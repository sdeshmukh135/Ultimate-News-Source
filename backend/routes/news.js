const express = require("express");
const router = express.Router();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { getUserNews, getCachedNews } = require("../recommendation");

const {
  groupByDate,
  groupByCategory,
  getCategoryEngagement,
  findWeightedScores,
  parseTime,
  convertToMin,
} = require("../scheduler");

const { pipeline } = require("@huggingface/transformers"); // for sentiment analysis
const schedule = require("node-schedule");

const MAX_REQUESTS_PER_API_LIMIT = 10;

const WEIGHTS = {
  READ: 3,
  LIKED: 3,
  OPEN: 4,
};

// get all news for a specific user
router.get("/", async (req, res) => {
  try {
    const news = await prisma.news.findMany({
      orderBy: {
        releasedAt: "desc",
      },
    });

    res.json(news);
  } catch (error) {
    res.status(500).send("Server Error");
  }
});

// user does not access this, for testing purposes must run manually
router.post("/seed-news", async (req, res) => {
  const newsData = [];
  const apiToken = process.env.API_KEY;

  let pageCount = 1;

  for (let i = 0; i < MAX_REQUESTS_PER_API_LIMIT; i++) {
    // in order to get 120 total articles at once (3 articles per loop)
    const response = await fetch(
      ` https://api.thenewsapi.com/v1/news/top?locale=us&api_token=${apiToken}&language=en&page=${pageCount}`
    );
    const data = await response.json();
    const articles = data.data;

    for (const article of articles) {
      const classifier = await pipeline("sentiment-analysis");
      const result = await classifier(article.title); // classifying based on article title

      const publishedDate = new Date(article.published_at);
      const newArticle = {
        name: article.title,
        category: article.categories,
        articleURL: article.url,
        imageURL: article.image_url === "" ? null : article.image_url,
        releasedAt: publishedDate,
        leftCount: 0,
        rightCount: 0,
        sentiment: result,
      };

      newsData.push(newArticle);
    }

    pageCount++;
  }

  const newNews = await prisma.news.createMany({
    data: newsData,
  });

  const news = await prisma.news.findMany();

  res.status(201).json(news);
});

// update news (for changes to the schema, testing purposes)
router.put("/update-news", async (req, res) => {
  // update dates to actual date objects (for sorting and filtering purposes)
  // fetch original data
  const newsData = await prisma.news.findMany();
  const updatedDates = newsData.map(async (newsData) => {
    const updatedReleaseDate = new Date(newsData.releaseDate);
    return prisma.news.update({
      where: { id: newsData.id },
      data: {
        releasedAt: updatedReleaseDate,
      },
    });
  });

  const newsUpdatedData = await prisma.news.findMany();
  res.status(201).json(newsUpdatedData);
});

// update news for change in tags (testing purposes)
router.put("/update-tags", async (req, res) => {
  const allNews = await prisma.news.findMany({
    where: {
      leftCount: null,
    },
  });

  try {
    for (const article of allNews) {
      const classifier = await pipeline("sentiment-analysis");
      const result = await classifier(article.name); // classifying based on article title

      await prisma.news.update({
        where: {
          id: article.id,
        },
        data: {
          leftCount: 0,
          rightCount: 0,
          sentiment: result,
        },
      });
    }

    const updatedNews = await prisma.news.findMany();

    res.status(200).json(updatedNews);
  } catch (error) {
    res.status(500).json({ error: "Error creating tags" });
  }
});

// update tags for the specific news when a user updates a specific tag
router.put("/:newsId/update-tag", async (req, res) => {
  const newsid = req.params.newsId; // which news to update
  const { addedInput, tagToUpdate } = req.body;

  const article = await prisma.news.findFirst({
    where: {
      id: parseInt(newsid),
    },
  });

  if (tagToUpdate === "leftCount") {
    updatedArticle = await prisma.news.update({
      where: {
        id: article.id,
      },
      data: {
        leftCount: article.leftCount + 1,
      },
    });
  } else if (tagToUpdate === "rightCount") {
    updatedArticle = await prisma.news.update({
      where: {
        id: article.id,
      },
      data: {
        rightCount: article.rightCount + 1,
      },
    });
  }

  // update user input
  const userArticle = await prisma.userNewsCache.findFirst({
    where: {
      userId: req.session.userId,
      newsId: parseInt(newsid),
    },
  });

  const updatedUserArticle = await prisma.userNewsCache.update({
    where: {
      id: userArticle.id,
    },
    data: {
      addTagInput: addedInput,
    },
  });

  // update user interaction
  const userInteraction = await prisma.userInteraction.findFirst({
    where: {
      userId: req.session.userId,
      newsId: parseInt(newsid),
    },
  });

  if (userInteraction) {
    // if this user has interacted with this article before
    const updatedInteraction = await prisma.userInteraction.update({
      where: {
        id: userInteraction.id,
      },
      data: {
        voted: true,
      },
    });
  } else {
    // this is the first interaction with the article
    await prisma.userInteraction.create({
      data: {
        user: { connect: { id: req.session.userId } },
        news: { connect: { id: parseInt(newsid) } }, // news id
        openCount: 0, // 0 is default
        readCount: 0,
        isLiked: false, // false is default
        voted: true,
      },
    });
  }

  const interactionTimes = await prisma.interactionTime.findFirst({
    where: { newsId: parseInt(newsid) },
  });

  if (interactionTimes) {
    // this exists
    const updatedTimes = await prisma.interactionTime.update({
      where: {
        id: interactionTimes.id,
      },
      data: {
        timeVoted: [new Date()],
      },
    });
  } else {
    const addTimes = await prisma.interactionTime.create({
      data: {
        news: { connect: { id: parseInt(newsid) } }, // news id
        timeOpened: [],
        timeRead: [],
        timeBookmarked: [],
        timeAnnotated: [], // not tested here
        timeVoted: [new Date()],
      },
    });
  }

  const personalNews = await getUserNews(req);

  res.status(200).json(personalNews);
});

// for testing purposes
router.post("/add-news", async (req, res) => {
  // add a news to the news database
  const { name, releaseDate, category, articleURL, imageURL, userId } =
    req.body;

  const newNews = await prisma.news.create({
    data: {
      name,
      releaseDate,
      category,
      articleURL,
      imageURL,
      userId,
    },
  });
  const news = await prisma.news.findMany({
    where: { userId: userId },
  });

  res.status(201).json(news);
});

router.post("/add-new-news", async (req, res) => {
  const { title, categories, imageURL, url, timeToSchedule } = req.body;

  const currentDate = new Date();
  const currentDay = currentDate.getDay();
  let scheduledDate = null;
  if (timeToSchedule === "") {
    // a time has been provided
    scheduledDate = new Date(); // default time to post is RIGHT NOW
  } else {
    let dayOffset = parseInt(timeToSchedule.slice(0, 1)) - currentDay;

    if (dayOffset < 0) {
      // the day during the week has already passed
      dayOffset += 7; // next week
    }

    scheduledDate = new Date();

    scheduledDate.setDate(currentDate.getDate() + dayOffset);

    scheduledDate.setHours(parseInt(timeToSchedule.slice(2, 5)), 0, 0, 0); // the specific hour
  }

  // schedule the job
  try {
    const scheduledJob = schedule.scheduleJob(scheduledDate, async function () {
      const classifier = await pipeline("sentiment-analysis");
      const result = await classifier(title); // classifying based on article title

      const newArticle = await prisma.news.create({
        data: {
          name: title,
          category: categories,
          articleURL: url,
          imageURL: imageURL,
          releasedAt: scheduledDate,
          leftCount: 0,
          rightCount: 0,
          sentiment: result,
        },
      });
    });
    res.status(200).json({ message: "Scheduled Job Successfully" });
  } catch (error) {
    res.status(500).json({ error: "Unable to schedule job" });
  }
});

// create new posts (schedule when to create them)
router.post("/find-times", async (req, res) => {
  const { categories, deadline } = req.body; // user input (hardcoded for now for testing)
  try {
    const interactions = await prisma.globalInteraction.findMany(); // already aggregated (instantly with every update to user signals)

    for (const interaction of interactions) {
      // calculate engagement scores (hardcoded weights, will make dynamic)
      const score =
        WEIGHTS.LIKED * interaction.likedCount +
        WEIGHTS.OPEN * interaction.openCount +
        WEIGHTS.READ * interaction.readCount;
      const updatedInteraction = await prisma.globalInteraction.update({
        where: {
          id: interaction.id,
        },
        data: {
          score: score,
        },
      });
    }

    const globalInteractions = await prisma.globalInteraction.findMany();

    const dateIntervals = await groupByDate(globalInteractions);

    const categoriedTimes = groupByCategory(dateIntervals);

    const categoryAvgs = await getCategoryEngagement(globalInteractions); // engagement scores per category

    // update the scores of the categoriedTimes using normalizedScore = timeAvg / catAvg --> score = normalizedScore + log(1 + articleCount)
    for (const category in categoriedTimes) {
      for (const interval in categoriedTimes[category]) {
        // the time buckets within the category
        categoriedTimes[category][interval].score = (
          categoriedTimes[category][interval].score /
            (categoryAvgs[category].score / categoryAvgs[category].count) +
          Math.log(1 + categoriedTimes[category][interval].count)
        ).toFixed(2);
      }
    }

    // get the time options and scores of the categories that match the user's categories
    let options = {};
    for (const category of categories) {
      for (const interval in categoriedTimes[category]) {
        options[interval] = categoriedTimes[category][interval].score;
      }
    }

    options = Object.entries(options);
    options = options.sort((a, b) => b[1] - a[1]);

    let results = await findWeightedScores(options); // priority queue (already sorted)

    let deadlineWindow = 0;

    if (deadline === null) {
      // no deadline has been chosen
      deadlineWindow = convertToMin(new Date().getDay(), new Date().getHours());
    } else {
      deadlineWindow = convertToMin(
        parseTime(new Date(deadline).getDay(), new Date(deadline).getHours())
      ); // scheduled times cannot pass this
    }

    let chosenDates = [];
    let count = 0; // want top 3

    while (count != 3) {
      const date = results.poll();
      const choice = convertToMin(date.id);
      if (choice < deadlineWindow) {
        // date is less than the deadline
        chosenDates.push(date.id);
        count += 1;
      }
    }

    res.status(200).json(chosenDates); // best time intervals to post article
  } catch (error) {
    res.status(500).json({ error: "something went wrong with finding times" });
  }
});

// to delete duplicate news (due to API problems)
router.delete("/delete-dup", async (req, res) => {
  // find duplicate records
  const duplicates = await prisma.news.groupBy({
    by: ["articleURL", "name"],
    _count: {
      id: true,
    },
    having: {
      id: {
        _count: {
          gt: 1, // filter for records with more than one version (every record should be unique)
        },
      },
    },
  });

  // delete duplicates
  for (const duplicate of duplicates) {
    const matches = await prisma.news.findMany({
      where: {
        articleURL: duplicate.articleURL,
        name: duplicate.name,
      },
      skip: 1,
    });

    // ids of records to delete
    const ids = matches.map((news) => news.id);

    // delete
    if (ids.length > 0) {
      await prisma.news.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
    }
  }

  res.status(201).json({ message: "Duplicates Deleted Successfully!" });
});


router.post("/add-cache-news", async (req, res) => {
  const allNews = await getCachedNews();

  await prisma.news.createMany({
    data : allNews
  })

  const news = await prisma.news.findMany();

  res.status(200).json(news);
})

module.exports = router;

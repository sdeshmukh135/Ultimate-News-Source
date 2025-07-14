// specifically for news specific to a user
const express = require("express");
const router = express.Router();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const {
  getUserNews,
  getRankings,
  createPersonalizedNews,
} = require("../recommendation");

// enums
const Categories = {
  GENERAL: "general",
  SCIENCE: "science",
  SPORTS: "sports",
  BUSINESS: "business",
  HEALTH: "health",
  ENTERTAINMENT: "entertainment",
  TECH: "tech",
  POLITICS: "politics",
  FOOD: "food",
  TRAVEL: "travel",
};

const RecentFilters = {
  TODAY: "today",
  LAST_WEEK: "last week",
  LAST_YEAR: "last year",
  GENERAL: "general",
};

const getSimiliarity = (userCategories, articleCategories) => {
  let intersection = new Set(
    [...articleCategories].filter((e) => userCategories.includes(e)),
  ); // A N B
  let union = new Set([...userCategories, ...articleCategories]); // A U B

  if (intersection.length === 0) {
    // nothing common between the two...which shouldn't happen
    return 0;
  }

  return intersection.size / union.size; // jaccard similiarity
};

// get user specific news
router.get("/", async (req, res) => {
  try {
    const personalNews = await getUserNews(req);
    res.status(200).json(personalNews);
  } catch (error) {
    res.status(500).send("Server Error");
  }
});

router.get("/filter-news/:type", async (req, res) => {
  const chosenFilter = req.params.type;
  let filteredNews = [];
  // filter news accordingly
  try {
    if (Object.values(Categories).includes(chosenFilter)) {
      // this is a category filter
      filteredNews = await prisma.userNewsCache.findMany({
        where: {
          category: {
            has: chosenFilter,
          },
        },
        orderBy: {
          releasedAt: "desc",
        },
      });
    } else if (Object.values(RecentFilters).includes(req.params.type)) {
      // TO-DO: Update when more data is added to database
    } else if (req.params.type === "region") {
      // TO-DO: update after region tagging is complete
    } else if (req.params.type === "sentiment") {
      // TO-DO: sentiment--> update after tagging is complete
    } else {
      // last option "none" --> fetch original data
      filteredNews = await prisma.userNewsCache.findMany({
        orderBy: {
          releasedAt: "desc",
        },
      });
    }

    res.status(201).json(filteredNews);
  } catch (error) {
    res.json({ error: "Something went wrong with filtering" });
  }
});

// add news to cache (testing purposes, otherwise news is updated using engagement scores)
router.post("/add-news", async (req, res) => {
  // edit to take in user input to personalize according to hardcoded information.

  const { categories, sources } = req.body;
  try {
    const someNews = await prisma.news.findMany({
      // for 30 news articles (random subset for testing purposes)
      where: {
        category: {
          hasSome: categories,
        },
        OR: sources.map((source) => ({
          articleURL: {
            contains: source,
          },
        })),
      },
      take: 30,
      orderBy: {
        releasedAt: "desc", // most recent first
      },
    });
    for (const article of someNews) {
      // creates 30 entries for
      const newNews = await prisma.userNewsCache.create({
        data: {
          user: { connect: { id: req.session.userId } },
          news: { connect: { id: article.id } }, // news id
          bookmarked: false, // initially
          score: 0.0, // default
          addedTime: new Date(), // to keep track of how long the news has been in the cache
          addTagInput: false, // have not contributed to an article yet
        },
      });
    }

    const personalNews = await prisma.userNewsCache.findMany({
      where: { userId: req.session.userId },
    });

    res.status(201).json(personalNews);
  } catch (error) {
    res.status(500).json({ error: "Error in adding news to cache" });
  }
});

router.put("/:newsId/bookmarked", async (req, res) => {
  const { isBookmarked } = req.body;
  const newsid = parseInt(req.params.newsId);
  try {
    const article = await prisma.userNewsCache.findFirst({
      where: { newsId: newsid },
    });
    if (article != null) {
      // the metadata already exists so we are modifying an existing entry
      const updatedMetaData = await prisma.userNewsCache.update({
        where: { id: article.id },
        data: {
          bookmarked: isBookmarked,
        },
      });
    }

    const personalNews = await getUserNews(req);

    res.json(personalNews);
  } catch (error) {
    res.status(500).json({ error: "Error updating metadata" });
  }
});

// get a personalized feed
router.post("/personalized", async (req, res) => {
  const newNews = await prisma.userNewsCache.findMany({
    where: { userId: req.session.userId },
    orderBy: {
      id: "desc",
    },
  });

  const personalNews = [];
  // there are entries found
  for (const art of newNews) {
    const newArticle = await prisma.news.findFirst({
      where: { id: art.newsId },
    });

    newArticle.score = art.score;
    newArticle.bookmarked = art.bookmarked;
    newArticle.addTagInput = art.addTagInput;

    personalNews.push(newArticle);
  }

  try {
    // sort news based on engagement scores
    personalNews.sort((a, b) => b["score"] - a["score"]);
    const top10 = personalNews.slice(0, 10); // top 10 articles with highest engagement scores

    let categories = []; // aggregate the categories present in the top 10
    let publishDates = [];
    let sources = [];
    for (const article of top10) {
      for (const category of article.category) {
        if (!categories.includes(category)) {
          categories.push(category);
        }
      }
      publishDates.push(article.releasedAt.toDateString()); // Date Object, just comparing day, month, year
      // isolate the source (everything after the https:// and before the .com)
      const URLString = new URL(article.articleURL).hostname;
      sources.push(URLString); // source
    }

    // perform similiarity analysis
    weightedCategoryScores = {}; // scores for every category (how many points a news article gets for having this category)
    weightedSourcesScores = {};
    weightedDateScores = {}; // want the news to be recent, at least as close to the previous articles as possible
    for (const article of top10) {
      let similiarity = getSimiliarity(categories, article.category);
      for (let category of article.category) {
        if (category in weightedCategoryScores) {
          // the category already exists
          weightedCategoryScores[category] += similiarity; // add onto the exisiting value
        } else {
          weightedCategoryScores[category] = similiarity;
        }
      }

      // for dates
      similiarity = getSimiliarity(publishDates, [
        article.releasedAt.toDateString(),
      ]);
      if (article.releasedAt.toDateString() in weightedDateScores) {
        weightedDateScores[article.releasedAt.toDateString()] += similiarity;
      } else {
        weightedDateScores[article.releasedAt.toDateString()] = similiarity;
      }

      // for sources
      const URLString = new URL(article.articleURL).hostname;
      similiarity = getSimiliarity(sources, [URLString]);
      if (URLString in weightedSourcesScores) {
        weightedSourcesScores[URLString] += similiarity;
      } else {
        weightedSourcesScores[URLString] = similiarity;
      }
    }

    // use the weights to give all news a score
    const allNews = await prisma.news.findMany();
    const usedNews = newNews.map((article) => article.newsId);
    const notUsedNews = allNews.filter(
      (article) => !usedNews.includes(article.id),
    ); // so that we are not looking at articles that have already been seen

    let rankings = await getRankings(
      weightedDateScores,
      weightedCategoryScores,
      weightedSourcesScores,
      notUsedNews,
    ); // json of the newsIds and the rankings

    //delete previous ranking list
    await prisma.ranking.deleteMany({
      where: { userId: req.session.userId },
    });

    for (const ranking of rankings) {
      // add to ranking database
      const newRanking = await prisma.ranking.create({
        data: {
          userId: req.session.userId,
          newsId: ranking.newsId,
          rank: ranking.totalScore,
        },
      });
    }

    let sortedRankings = await prisma.ranking.findMany({
      where: {
        userId: req.session.userId,
      },
      orderBy: {
        rank: "desc",
      },
      take: 30,
    });

    sortedRankings = sortedRankings.map((ranking) => ranking.newsId);
    await createPersonalizedNews(req, notUsedNews, sortedRankings);

    const personalizedNews = await getUserNews(req);

    res.status(201).json(personalizedNews);
  } catch (error) {
    res.status(500).json({ error: "Could not created personalized feed" });
  }
});

// update tagging contribution
router.put("/:newsid/tag-input", async (req, res) => {
  const newsid = req.params.newsid;
  const { addedInput } = req.body;

  const article = await prisma.userNewsCache.findFirst({
    where: {
      userId: req.session.userId,
      newsId: parseInt(newsid),
    },
  });

  const updatedArticle = await prisma.userNewsCache.update({
    where: {
      id: article.id,
    },
    data: {
      addTagInput: addedInput,
    },
  });

  const newNews = await prisma.userNewsCache.findMany({
    where: { userId: req.session.userId },
    orderBy: {
      id: "desc",
    },
  });

  const personalNews = await getUserNews(req);

  res.status(200).json(personalNews);
});

// delete news from the cache
router.delete("/delete", async (req, res) => {
  await prisma.userNewsCache.deleteMany();
  res.status(201).json({ message: "Deleted Successfully" });
});

module.exports = router;

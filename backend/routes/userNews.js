// specifically for news specific to a user
const express = require("express");
const router = express.Router();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

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
  let { intersection, union } = new Set();

  if (articleCategories instanceof Array) {
    intersection = new Set(
      [...articleCategories].filter((e) => userCategories.includes(e)),
    ); // A N B
    union = new Set([...userCategories, ...articleCategories]); // A U B
  } else {
    // singular value
    intersection = new Set(
      [...userCategories].filter((e) => e === articleCategories),
    ); // filter for specific instance
    union = new Set([...userCategories, articleCategories]);
  }

  if (union === 0) {
    // nothing common between the two...which shouldn't happen
    return 0;
  }

  return intersection.size / union.size; // jaccard similiarity
};

// get user specific news
router.get("/", async (req, res) => {
  try {
    const newNews = await prisma.userNewsCache.findMany({
      where: { userId: req.session.userId },
      orderBy: {
        addedTime: "desc",
      },
      take: 30,
    });

    if (newNews.length != 0) {
      const personalNews = [];
      // there are entries found
      for (const article of newNews) {
        const newArticle = await prisma.news.findMany({
          where: { id: article.newsId },
        });

        newArticle[0].score = article.score;
        newArticle[0].bookmarked = article.bookmarked;

        personalNews.push(newArticle[0]);
      }
      res.json(personalNews);
    } else {
      res.status(404).json("No articles found");
    }
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
    const article = await prisma.userNewsCache.findMany({
      where: { newsId: newsid },
    });
    if (article.length != 0) {
      // the metadata already exists so we are modifying an existing entry
      const updatedMetaData = await prisma.userNewsCache.update({
        where: { id: article[0].id },
        data: {
          bookmarked: isBookmarked,
        },
      });
    }

    const newNews = await prisma.userNewsCache.findMany({
      where: { userId: req.session.userId },
      orderBy: {
        addedTime: "desc",
      },
      take: 30,
    });

    const personalNews = [];
    // there are entries found
    for (const art of newNews) {
      const newArticle = await prisma.news.findMany({
        where: { id: art.newsId },
      });

      newArticle[0].score = art.score;
      newArticle[0].bookmarked = art.bookmarked;

      personalNews.push(newArticle[0]);
    }

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
    const newArticle = await prisma.news.findMany({
      where: { id: art.newsId },
    });

    newArticle[0].score = art.score;
    newArticle[0].bookmarked = art.bookmarked;

    personalNews.push(newArticle[0]);
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
      similiarity = getSimiliarity(
        publishDates,
        article.releasedAt.toDateString(),
      );
      if (article.releasedAt.toDateString() in weightedDateScores) {
        weightedDateScores[article.releasedAt.toDateString()] += similiarity;
      } else {
        weightedDateScores[article.releasedAt.toDateString()] = similiarity;
      }

      // for sources
      const URLString = new URL(article.articleURL).hostname;
      similiarity = getSimiliarity(sources, URLString);
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

    let rankings = []; // json of the newsIds and the rankings
    for (const article of notUsedNews) {
      // calculate the score
      let score = 0.0;
      for (const category of article.category) {
        if (weightedCategoryScores.hasOwnProperty(category)) {
          // article has one of the weighted categories
          score += weightedCategoryScores[category];
        }
      }

      if (
        weightedDateScores.hasOwnProperty(article.releasedAt.toDateString())
      ) {
        score += weightedDateScores[article.releasedAt.toDateString()];
      }

      const URLString = new URL(article.articleURL).hostname;
      if (weightedSourcesScores.hasOwnProperty(URLString)) {
        score += weightedSourcesScores[URLString];
      }

      const newRanking = {
        newsId: article.id,
        totalScore: score,
      };

      rankings.push(newRanking);
    }

    //delete previous ranking list
    await prisma.ranking.deleteMany({
      where: { userId: req.session.userId },
    });

    for (const ranking of rankings) {
      // add to ranking database
      const newRanking = await prisma.ranking.create({
        data: {
          userId: 6,
          newsId: ranking.newsId,
          rank: ranking.totalScore,
        },
      });
    }

    let sortedRankings = await prisma.ranking.findMany({
      where: {
        userId: 6,
      },
      orderBy: {
        rank: "desc",
      },
      take: 30,
    });

    sortedRankings = sortedRankings.map((ranking) => ranking.newsId);

    const personalizedNews = [];
    for (const a of notUsedNews) {
      if (sortedRankings.includes(a.id)) {
        // one of the top 30 closest matches
        await prisma.userNewsCache.create({
          data: {
            user: { connect: { id: 6 } },
            news: { connect: { id: a.id } }, // news id
            bookmarked: false, // initially
            score: 0.0, // default
            addedTime: new Date(),
          },
        });
      }
    }

    const cacheNews = await prisma.userNewsCache.findMany({
      where: { userId: req.session.userId },
      orderBy: {
        addedTime: "desc",
      },
      take: 30,
    });

    for (const article of cacheNews) {
      const newArticle = await prisma.news.findMany({
        where: { id: article.newsId },
      });

      newArticle[0].score = article.score;
      newArticle[0].bookmarked = article.bookmarked;

      personalizedNews.push(newArticle[0]);
    }

    res.status(201).json(personalizedNews);
  } catch (error) {
    res.status(500).json({ error: "Could not created personalized feed" });
  }
});

// delete news from the cache
router.delete("/delete", async (req, res) => {
  await prisma.userNewsCache.deleteMany();
  res.status(201).json({ message: "Deleted Successfully" });
});

module.exports = router;

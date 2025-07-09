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

// get user specific news
router.get("/", async (req, res) => {
  try {
    const newNews = await prisma.userNewsCache.findMany({
      where: { userId: req.session.userId },
    });

    if (newNews.length != 0) {
      const personalNews = [];
      // there are entries found
      for (const article of newNews) {
        const newArticle = await prisma.news.findMany({
          where: { id: article.newsId },
        });

        newArticle[0].score = article.score;

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
  try {
    const someNews = await prisma.news.findMany({
      // for 30 news articles (random subset for testing purposes)
      take: 30,
    });
    for (const article of someNews) {
      // creates 30 entries for
      const newNews = await prisma.userNewsCache.create({
        data: {
          user: { connect: { id: req.session.userId } },
          news: { connect: { id: article.id } }, // news id
          score: 0.0, // default
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

// delete news from the cache
router.delete("/delete", async (req, res) => {
  await prisma.userNewsCache.deleteMany();
  res.status(201).json({ message: "Deleted Successfully" });
});

module.exports = router;

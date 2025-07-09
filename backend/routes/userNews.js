// specifically for news specific to a user
const express = require("express");
const router = express.Router();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

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

        personalNews.push(newArticle);
      }
      res.json(personalNews);
    } else {
      res.status(404).json("No articles found");
    }
  } catch (error) {
    res.status(500).send("Server Error");
  }
});

// add news to cache (testing purposes, otherwise news is updated using engagement scores)
router.post("/add-news", async (req, res) => {
  try {
    const someNews = await prisma.news.findMany({
      // for 30 news articles (random subset for testing purposes)
      take: 30,
    });
    const personalNews = [];
    for (const article of someNews) {
      // creates 30 entries for
      const newNews = await prisma.userNewsCache.create({
        data: {
          user: { connect: { id: req.session.userId } },
          news: { connect: { id: article.id } }, // news id
          score: 0.0, // default
        },
      });
      personalNews.push(newNews);
    }

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

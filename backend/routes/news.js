const express = require("express");
const router = express.Router();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// get all news for a specific user
router.get("/", async (req, res) => {
  try {
    const news = await prisma.news.findMany({
      where: { userId: req.session.userId },
    });

    res.json(news);
  } catch (error) {
    res.status(500).send("Server Error");
  }
});

// user does not access this? For now, will access when user input is considered in seeded data (maybe?)
router.post("/seed-news", async (req, res) => {
  const newsData = [];
  const apiKey = process.env.API_KEY;

  const Categories = {
    // enum
    BUSINESS: "business",
    TECH: "technology",
    ENTERTAINMENT: "entertainment",
    GENERAL: "general",
    HEALTH: "health",
    SCIENCE: "science",
    SPORTS: "sports",
  };

  // optimize? (O^2 time complexity)
  for (const category of Object.values(Categories)) {
    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}&language=en&category=${category}`,
    );
    const data = await response.json();
    const articles = data.articles;

    for (const article of articles) {

      const newArticle = {
        name: article.title,
        releaseDate: article.publishedAt.slice(0,10),
        category: category, 
        articleURL: article.url,
        imageURL: article.urlToImage === "" ? null : article.urlToImage,
        userId: req.session.userId,
      };

      newsData.push(newArticle);
    }
  }

  await prisma.news.deleteMany(); // clear any initial inputs

  const newNews = await prisma.news.createMany({
    data: newsData,
  });

  const news = await prisma.news.findMany();

  res.status(201).json(news);
});

// update news (for changes to the schema, testing purposes)
router.post("/update-news", async (req, res) => {
  // TO-DO: add according to feature to change
});

// for testing purposes
router.post("/add-news", async (req, res) => {
  // add a card to the card database
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

module.exports = router;

const express = require("express");
const router = express.Router();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// get all news for a specific user
router.get("/", async (req, res) => {
  try {
    const news = await prisma.news.findMany({
      where: { userId: userId },
    });

    res.json(news);
  } catch (error) {
    res.status(500).send("Server Error");
  }
});

router.post("/seed-news", async (req, res) => {
  const apiKey = process.env.API_KEY;
  const response = await fetch(
    `https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}&language=en`,
  );
  const data = await response.json();
  const articles = data.articles;

  console.log(articles);

  // news to add
  const newsData = [];
  for (const article of articles) {
    const newArticle = {
      name: article.title,
      releaseDate: article.publishedAt,
      category: "latest", // hardcoded for now until category is found
      articleURL: article.url,
      imageURL: article.urlToImage,
      userId: req.session.userId,
    };

    newsData.push(newArticle);
  }

  await prisma.news.deleteMany(); // clear any initial inputs

  const newNews = await prisma.news.createMany({
    data: newsData,
  });

  const news = await prisma.news.findMany();

  res.status(201).json(news);
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

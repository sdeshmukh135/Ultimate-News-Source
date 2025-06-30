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

// user does not access this
router.post("/seed-news", async (req, res) => {
  const newsData = [];
  const apiToken = process.env.API_TOKEN;

  let pageCount = 31; // manually changing for now (TO-DO: automate function to fetch everyday)

  for (let i = 0; i < 30; i++) {
    // in order to get 90 total articles at once, figure out how to keep this automatically running every day, for now manually add every day
    const response = await fetch(
      ` https://api.thenewsapi.com/v1/news/top?locale=us&api_token=${apiToken}&language=en&page=${pageCount}`,
    );
    const data = await response.json();
    const articles = data.data;

    for (const article of articles) {
      const newArticle = {
        name: article.title,
        releaseDate: article.published_at.toDateString(),
        category: article.categories,
        articleURL: article.url,
        imageURL: article.image_url === "" ? null : article.image_url,
        userId: req.session.userId,
      };

      newsData.push(newArticle);
    }

    pageCount++;
  }

  //   await prisma.news.deleteMany(); // clear any initial inputs

  const newNews = await prisma.news.createMany({
    data: newsData,
  });

  const news = await prisma.news.findMany();

  res.status(201).json(news);
});

// update news (for changes to the schema, testing purposes)
router.post("/update-news", async (req, res) => {
  // TO-DO: add according to feature to change
  // run when user input is added for personalized news (NewsAPI does not work on deployed projects)
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

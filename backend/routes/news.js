const express = require("express");
const router = express.Router();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const MAX_REQUESTS_PER_API_LIMIT = 40;

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
      ` https://api.thenewsapi.com/v1/news/top?locale=us&api_token=${apiToken}&language=en&page=${pageCount}`,
    );
    const data = await response.json();
    const articles = data.data;

    for (const article of articles) {
      const publishedDate = new Date(article.published_at);
      const newArticle = {
        name: article.title,
        category: article.categories,
        articleURL: article.url,
        imageURL: article.image_url === "" ? null : article.image_url,
        releasedAt: publishedDate,
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

module.exports = router;

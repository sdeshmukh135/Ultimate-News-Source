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
  const apiToken = process.env.API_TOKEN;

  let pageCount = 1;

  for (let i = 0; i < 40; i++) {
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

router.get("/filter-news/:type", async (req, res) => {
  const chosenFilter = req.params.type;
  let filteredNews = [];
  // filter news accordingly
  try {
    if (Object.values(Categories).includes(chosenFilter)) {
      // this is a category filter
      filteredNews = await prisma.news.findMany({
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
      filteredNews = await prisma.news.findMany({
        orderBy: {
          releasedAt: "desc",
        },
      });
    }

    res.status(201).json(filteredNews);
  } catch (error) {
    console.log("error ", error);
    res.json({ error: "Something went wrong with filtering" });
  }
});

// update news (for changes to the schema, testing purposes)
router.put("/update-news", async (req, res) => {
  // update dates to actual date objects (for sorting and filtering purposes)
  // fetch original data
  const newsData = await prisma.news.findMany();
  const updatedDates = newsData.map(async (newsData) => {
    const updatedReleaseDate = new Date(newsData.releaseDate);
    console.log(updatedReleaseDate);
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

module.exports = router;

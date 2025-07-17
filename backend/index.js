const express = require("express");
const cors = require("cors");
const session = require("express-session");
const schedule = require("node-schedule");

const { pipeline } = require("@huggingface/transformers"); // for sentiment analysis

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 3000;

const MAX_REQUESTS_PER_API_LIMIT = 30;

const authRoutes = require("./routes/auth");
const newsRoutes = require("./routes/news");
const stockRoutes = require("./routes/stock");
const featureRoutes = require("./routes/feature");
const cacheRoutes = require("./routes/userNews");
const interactionRoutes = require("./routes/interactions");
const globalRoutes = require("./routes/globalInteractions")
const weightRoutes = require("./routes/weights")

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

let sessionConfig = {
  name: "sessionId",
  secret: process.env.SECRET_KEY,
  cookie: {
    maxAge: 1000 * 60 * 5,
    secure: false,
    httpOnly: false,
  },
  resave: false,
  saveUninitialized: false,
};

app.use((err, req, res, next) => {
  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // For Additional Prisma Checks
  res.status(500).json({ error: "Internal Server Error" });
});

app.use(session(sessionConfig));
app.use(authRoutes);
app.use("/news", newsRoutes);
app.use("/stocks", stockRoutes);
app.use("/featured", featureRoutes);
app.use("/user-news", cacheRoutes);
app.use("/interactions", interactionRoutes);
app.use("/global", globalRoutes);
app.use("/weights", weightRoutes);

app.listen(PORT, () => {});

// seed the data (update the database everyday at midnight)
const addToDatabase = schedule.scheduleJob("0 0 * * *", async function () {
  try {
    const newsData = [];
    const apiToken = process.env.API_TOKEN;

    let pageCount = 1; // make sure you don't have duplicate news

    for (let i = 0; i < MAX_REQUESTS_PER_API_LIMIT; i++) {
      // in order to get 210 total articles at once (3 articles per request)
      const response = await fetch(
        ` https://api.thenewsapi.com/v1/news/top?locale=us&api_token=${apiToken}&language=en&page=${pageCount}`,
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
  } catch (error) {
    console.error("Error in updating database");
  }
});

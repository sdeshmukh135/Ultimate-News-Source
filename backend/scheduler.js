const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const WEIGHTS = {
  READ: 3,
  LIKED: 3,
  OPEN: 4,
};

// functions for scheduling algorithm

const aggregateMetrics = async () => {
  const metrics = await prisma.userInteraction.findMany();

  for (const interaction of metrics) {
    const article = await prisma.globalInteraction.findFirst({
      where: { newsId: interaction.newsId },
    });

    const newsArticle = await prisma.news.findFirst({
      where: { id: interaction.newsId },
    });

    if (article != null) {
      // the article is already present
      const updatedInteraction = await prisma.globalInteraction.update({
        data: {
          openCount: interaction.openCount + article.openCount,
          readCount: interaction.readCount + article.readCount,
          likedCOunt: article.isLiked ? likedCount + 1 : likedCount,
        },
      });
    } else {
      // article is not a part of the interactions yet
      const newInteraction = await prisma.globalInteraction.create({
        data: {
          // will add onto with more users
          news: { connect: { id: interaction.newsId } },
          openCount: interaction.openCount,
          readCount: interaction.readCount,
          likedCount: interaction.isLiked ? 1 : 0,
          publishedDayOfWeek: newsArticle.releasedAt.getDay(),
          publishedTime: newsArticle.releasedAt.getHours(),
          score: 0.0, // default-- will add score later
        },
      });
    }
  }

  const allInteractions = await prisma.globalInteraction.findMany();

  return allInteractions;
};

// create date interval (Day of the week, hour) scores (group articles according to time published (same day, within two hours of each other))
const groupByDate = async (interactions) => {
  // news is the global interactions
  const dateIntervals = {}; // each date interval has an averga engagement score attached (HashMap)
  for (const interaction of interactions) {
    const article = await prisma.news.findFirst({
      where: { id: interaction.newsId },
    });

    const startInterval = Math.floor(interaction.publishedTime / 2) * 2; // 2-hour window
    const endInterval = startInterval + 1;

    const window = `${interaction.publishedDayOfWeek}-${startInterval
      .toString()
      .padStart(2, "0")}-${endInterval.toString().padStart(2, "0")}`;
    if (!dateIntervals[window]) {
      // this bucket doesn't exist
      dateIntervals[window] = {
        // key is window, value is score and count (in order to get the avg score) and categories in the bucket
        score: interaction.score,
        categories: article.category,
        count: 1,
      };
    } else {
      const categories = [];
      for (const category of article.category) {
        if (!dateIntervals[window].categories.includes(category)) {
          categories.push(category); // new category to include
        }
      }
      dateIntervals[window] = {
        score:
          (interaction.score + dateIntervals[window].score) /
          (dateIntervals[window].count + 1), // new average engagement
        count: dateIntervals[window].count + 1,
        categories: [...dateIntervals[window].categories, ...categories], // append new categories to list of categories
      };
    }
  }

  return dateIntervals;
};

const getCategoryEngagement = async (interactions) => {
  // get the engagement score averages for per category
  const categoryScores = {};
  for (const interaction of interactions) {
    // from GlobalInteracions
    const article = await prisma.news.findFirst({
      where: { id: interaction.newsId },
    });
    const categories = article.category;
    for (const category of categories) {
      if (!categoryScores[category]) {
        // this category does not exist
        categoryScores[category] = {
          score: interaction.score,
          count: 1,
        };
      } else {
        // add on
        categoryScores[category] = {
          score: interaction.score + categoryScores[category].score,
          count: categoryScores[category].count + 1,
        };
      }
    }
  }

  return categoryScores;
};

const groupByCategory = (dateIntervals) => {
  // restructure date intervals according to categories
  const categoriesOfTime = {};

  const intervals = Object.keys(dateIntervals); // the intervals themselves

  for (const interval of intervals) {
    const categories = dateIntervals[interval].categories;
    for (const category of categories) {
      categoriesOfTime[category] = {
        ...categoriesOfTime[category],
        [interval]: {
          score: dateIntervals[interval].score, // add this interval to the category
          count: dateIntervals[interval].count,
        },
      };
    }
  }

  return categoriesOfTime;
};

module.exports = {
  aggregateMetrics,
  groupByCategory,
  groupByDate,
  getCategoryEngagement,
};
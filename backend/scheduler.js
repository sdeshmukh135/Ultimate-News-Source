const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// functions for scheduling algorithm

const findOnlineTimes = async () => {
  const users = await prisma.user.findMany(); // all users

  const loginTimes = {}; // time and count (if applicable)
  for (const user in users) {
    let times = JSON.parse(users[user].timesOnline);
    if (times === null) {
      continue; // not applicable
    }
    times = times["time"];
    for (const time of times) {
      const window = parseTime(
        new Date(time).getDay(),
        new Date(time).getHours()
      );
      if (loginTimes[window]) {
        // that time exists
        loginTimes[window]++;
      } else {
        // time has not been seen yet
        loginTimes[window] = 1; // first instance
      }
    }
  }

  return loginTimes;
};

const convertToMin = (time) => {
  const dayOfWeek = parseInt(time.slice(0, 1)); // first digit
  const hour = parseInt(time.slice(2, 5)); // hour to post it during the day

  return dayOfWeek * 24 * 60 + hour * 60; // minutes since the beginning of the week for the similiarity analysis
};

const parseTime = (day, time) => {
  const startInterval = Math.floor(time / 2) * 2; // 2-hour window
  const endInterval = startInterval + 1;

  const window = `${day}-${startInterval
    .toString()
    .padStart(2, "0")}-${endInterval.toString().padStart(2, "0")}`;

  return window;
};

// create date interval (Day of the week, hour) scores (group articles according to time published (same day, within two hours of each other))
const groupByDate = async (interactions) => {
  // news is the global interactions
  const dateIntervals = {}; // each date interval has an averga engagement score attached (HashMap)
  for (const interaction of interactions) {
    const article = await prisma.news.findFirst({
      where: { id: interaction.newsId },
    });

    const window = parseTime(
      interaction.publishedDayOfWeek,
      interaction.publishedTime
    );
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

const findWeightedScores = async (topEngagementScores) => {
  // weighted by similarity to popular user times
  const loginTimes = await findOnlineTimes();

  const finalizedTimes = {};

  for (const [interval, score] of topEngagementScores) {
    let weight = 0;
    for (const time in loginTimes) {
      const sim = similiarityAnalysis(time, interval, 0.01);
      weight += sim * loginTimes[time]; // where loginTimes[time] is the frequency of the time interval
    }

    finalizedTimes[interval] = (parseFloat(score) * weight).toFixed(2); // weighted score
  }

  return finalizedTimes;
};

const similiarityAnalysis = (time1, time2, decay = 0.01) => {
  // comparing with the highest engagement scores and intervals from categories
  // how similiar are the timings to the login times (want to be as close as possible to be a part of the fresh feed)
  // more similiar, weight is higher (exponential decay)
  const diff = Math.abs(convertToMin(time1) - convertToMin(time2));
  return Math.exp(-decay * diff);
};

module.exports = {
  groupByCategory,
  groupByDate,
  getCategoryEngagement,
  findWeightedScores,
  parseTime,
  convertToMin,
};

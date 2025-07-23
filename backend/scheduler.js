const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { Node, PriorityQueue } = require("./PriorityQueue");

// functions for scheduling algorithm

const Signals = {
  // enum
  OPENED: "timeOpened",
  LIKED: "timeBookmarked",
  READ: "timeRead",
  ANNOTATE: "timeAnnotated",
  VOTED: "timeVoted",
};

const addToWindows = async (loginTime, logoutTime) => {
  // called immediately after logging out
  let beginTime = new Date(loginTime); // update to get to logout time
  const endTime = new Date(logoutTime);

  const totalTime = (endTime.getTime() - beginTime.getTime()) / 60000; // number of minutes in between
  let numOfIntervals = Math.ceil(totalTime / 30); // 30-minute intervals

  while (numOfIntervals != 0) {
    // still intervals left
    const interval = parseTime(
      // starting interval
      new Date(beginTime).getDay(),
      new Date(beginTime).getHours(),
      new Date(beginTime).getMinutes()
    );

    const time = await prisma.onlineTime.findFirst({
      where: { interval: interval },
    });

    if (time) {
      // interval exists
      const updatedInterval = await prisma.onlineTime.update({
        where: { id: time.id },
        data: {
          count: time.count + 1,
        },
      });
    } else {
      const newInterval = await prisma.onlineTime.create({
        data: {
          interval: interval,
          count: 1, // first instance
        },
      });
    }

    const newTime = beginTime.getTime() + 30 * 60000;
    beginTime = new Date(newTime);
    numOfIntervals--;
  }
};

// aggregate engagement per interval of the articles interacted with
const engagementPerInterval = async () => {
  // how to improve runtime?
  const times = await prisma.interactionTime.findMany();

  let engagementCount = {};
  for (const interactions of times) {
    for (const signal of Object.values(Signals)) {
      // O(1)
      const times = interactions[signal];
      for (const time of times) {
        const window = parseTime(
          new Date(time).getDay(),
          new Date(time).getHours(),
          new Date(time).getMinutes()
        );

        if (engagementCount[window]) {
          // exists
          engagementCount[window] += 1;
        } else {
          engagementCount[window] = 1;
        }
      }
    }
  }

  return engagementCount;
};

const convertToMin = (time) => {
  let [day, startTime, endTime] = time.split("-");
  day = parseInt(day);
  startTime = parseFloat(startTime);

  return day * 24 * 60 + startTime * 60; // minutes since the beginning of the week for the similiarity analysis
};

const parseTime = (day, hour, minutes) => {
  const startInterval = minutes < 30 ? hour : hour + 0.5; // the starting hour
  const endInterval = startInterval + 0.5;

  const window = `${day}-${startInterval
    .toString()
    .padStart(2, "0")}-${endInterval.toString().padStart(2, "0")}`;

  return window;
};

// create date interval (Day of the week, hour) scores (group articles according to time published (same day, within two hours of each other))
const groupByDate = async (interactions) => {
  // news is the global interactions
  const dateIntervals = {}; // each date interval has an average engagement score attached (HashMap)
  for (const interaction of interactions) {
    const article = await prisma.news.findFirst({
      where: { id: interaction.newsId },
    });

    const window = parseTime(
      interaction.publishedDayOfWeek, // day
      interaction.publishedTime, // hour
      new Date(interaction.publishedDate).getMinutes() // minute
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
  const onlineTimes = await prisma.onlineTime.findMany();

  let finalizedTimes = {};

  for (const [interval, score] of topEngagementScores) {
    let weight = 0;
    for (const time in onlineTimes) {
      const sim = similiarityAnalysis(
        onlineTimes[time].interval,
        interval,
        0.01
      );
      weight += sim * onlineTimes[time].count; // where onlineTImes[time] is the frequency of the time interval
    }

    finalizedTimes[interval] = (parseFloat(score) * weight).toFixed(2); // weighted score
  }

  return weightByIntervalActivity(finalizedTimes);
};

const weightByIntervalActivity = async (topScores) => {
  const intervalEngagement = await engagementPerInterval();

  let pq = new PriorityQueue();

  for (const interval in topScores) {
    if (interval in intervalEngagement) {
      // interval exists in the engaged with intervals
      topScores[interval] *= intervalEngagement[interval];
    } else {
      // weight by small weight (default value);
      topScores[interval] *= 0.01;
    }

    const node = new Node(interval, topScores[interval]); // interval and score
    pq.add(node);
  }

  return pq;
};

const similiarityAnalysis = (time1, time2, decay = 0.01) => {
  // comparing with the highest engagement scores and intervals from categories
  // how similiar are the timings to the login times (want to be as close as possible to be a part of the fresh feed)
  // more similiar, weight is higher (exponential decay)
  const diff = 1 / (1 + Math.abs(convertToMin(time1) - convertToMin(time2)));
  return Math.exp(-decay * diff);
};

module.exports = {
  groupByCategory,
  addToWindows,
  groupByDate,
  getCategoryEngagement,
  findWeightedScores,
  parseTime,
  convertToMin,
};

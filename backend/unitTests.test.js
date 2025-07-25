const { getRankings, expoDecayFactor } = require("./recommendation");

const { groupByCategory, parseTime, convertToMin } = require("./scheduler");

const { news } = require("./mockNewsData");

test("rankings are outputted for news to recommend", () => {
  // ranks news for News Recommendation System
  const dateScores = {
    "Thu Jul 17 2025": 0.6666666666666666,
    "Mon Jul 21 2025": 1.6666666666666665,
    "Wed Jul 23 2025": 1,
  };
  const categoryScores = { entertainment: 10, general: 10 };
  const sourcesScores = { "www.usmagazine.com": 4.5, "www.eonline.com": 0.5 };
  const sentimentSources = { NEGATIVE: 2, POSITIVE: 3 };

  const notUsedNews = news;
  const rankings = getRankings(
    dateScores,
    categoryScores,
    sourcesScores,
    sentimentSources,
    notUsedNews
  );
  expect(rankings).toBeDefined(); // most recent addition to news database
});

test("exponential decay factor of a date is calculated", () => {
  // ranks news for News Recommendation System
  const date = new Date(2025, 7, 18); // sample date
  const weight = expoDecayFactor(date);
  expect(parseFloat(weight.toFixed(2))).toEqual(3.24); // expected output given the exponential decay formula
});

test("date is converted into an 30-minute interval", () => {
  // ranks news for News Recommendation System
  const interval = parseTime(5, 23, 11);
  expect(interval).toEqual("5-23-23.5"); // expected output interval
});

test("date is converted to total number of minutes", () => {
  // ranks news for News Recommendation System
  const minutes = convertToMin("5-23-23.5");
  expect(minutes).toEqual(8580); // expected output number of minutes
});

test("date-based intervals are converted to category-based intervals", () => {
  // ranks news for News Recommendation System
  const intervals = {
    "1-8.5-09": {
      score: 2.8333333333333335,
      count: 4,
      categories: ["entertainment", "general"],
    },
    "4-20.5-21": {
      score: 15,
      categories: ["entertainment", "general"],
      count: 1,
    },
    "4-18.5-19": {
      score: 4,
      categories: ["entertainment", "general"],
      count: 1,
    },
    "1-7.5-08": {
      score: 4,
      categories: ["entertainment", "general"],
      count: 1,
    },
    "1-17.5-18": {
      score: 5,
      count: 2,
      categories: ["entertainment", "general"],
    },
    "3-7.5-08": {
      score: 4,
      categories: ["entertainment", "general"],
      count: 1,
    },
    "3-8.5-09": {
      score: 1.8333333333333333,
      count: 4,
      categories: ["entertainment", "general"],
    },
  };
  const categoryIntervals = groupByCategory(intervals);
  expect(categoryIntervals).toBeDefined(); // expected output number of minutes
});

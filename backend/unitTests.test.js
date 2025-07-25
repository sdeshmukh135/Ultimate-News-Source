const { getRankings, expoDecayFactor } = require("./recommendation");

const { groupByCategory, parseTime, convertToMin } = require("./scheduler");

const {
  news,
  intervals,
  dateScores,
  categoryScores,
  sourcesScores,
  sentimentScores,
} = require("./mockNewsData");

test("rankings are outputted for news to recommend", () => {
  // ranks news for News Recommendation System
  const notUsedNews = news;
  const rankings = getRankings(
    dateScores,
    categoryScores,
    sourcesScores,
    sentimentScores,
    notUsedNews
  );
  expect(rankings).toBeDefined(); // most recent addition to news database
});

test("exponential decay factor of a date is calculated", () => {
  // exponential decay factor for the dates in News Recommendation System
  const date = new Date(2025, 7, 18); // sample date
  const weight = expoDecayFactor(date);
  expect(parseFloat(weight.toFixed(2))).toEqual(3.24); // expected output given the exponential decay formula
});

test("date is converted into an 30-minute interval", () => {
  // converts dates into intervals for News Scheduling System
  const interval = parseTime(5, 23, 11);
  expect(interval).toEqual("5-23-23.5"); // expected output interval
});

test("date is converted to total number of minutes", () => {
  // converts dates (i.e. in interval form) into minutes for News Scheduling System
  const minutes = convertToMin("5-23-23.5");
  expect(minutes).toEqual(8580); // expected output number of minutes
});

test("date-based intervals are converted to category-based intervals", () => {
  // converts intervals into category-based intervals for News Scheduling System
  const categoryIntervals = groupByCategory(intervals);
  expect(categoryIntervals).toBeDefined(); // expected intervals
});

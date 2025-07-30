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

const SentimentFilters = {
  POSITIVE: "POSITIVE",
  NEGATIVE: "NEGATIVE",
};

const RegionFilters = {
  // Four region model
  NORTHEAST: "northeast",
  MIDWEST: "midwest",
  WEST: "west",
  SOUTH: "south",
};

module.exports = { Categories, RecentFilters, SentimentFilters, RegionFilters};

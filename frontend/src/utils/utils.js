// enums

// signal types
export const SIGNALS = {
  OPEN: "open",
  LIKED: "liked",
  READ: "read",
};

export const TAGS = {
  LEFT: "leftCount",
  RIGHT: "rightCount",
};

export const CATEGORIES = {
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
}

export const TOOLS = {
  TEXTBOX : "textbox",
  DRAW: "draw",
  HIGHLIGHT : "highlight",
  DELETE : "delete"
}

// session-based enums
export const SESSION = {
  MAX_AGE: 1000 * 60 * 5,
}

// regions 
export const REGIONS = {
  NORTHEAST: ["Connecticut", "Maine", "Massachusetts", "New Hampshire", "New Jersey", "New York", "Pennsylvania", "Rhode Island", "Vermont"],
  MIDWEST: ["Illinois", "Indiana", "Iowa", "Kansas", "Michigan", "Minnesota", "Missouri", "Nebraska", "North Dakota", "Ohio", "South Dakota", "Wisconsin"],
  WEST: ["Alaska", "Arizona", "California", "Colorado", "Hawaii", "Idaho", "Montana", "Nevada", "New Mexico", "Oregon","Utah", "Washington", "Wyoming"],
  SOUTH: ["Alabama", "Arkansas", "Delaware", "District of Columbia", "Florida", "Georgia", "Kentucky", "Louisiana", "Maryland", "Mississippi", "North Carolina", "Oklahoma", "South Carolina", "Tennessee", "Texas", "Virginia", "West Virginia"],
}

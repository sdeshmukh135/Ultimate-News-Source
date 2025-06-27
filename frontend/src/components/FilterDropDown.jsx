import { useState } from "react";

const FilterDropDown = ({ setFilterOption }) => {
  const [openDropDown, setOpenDropDown] = useState(false); // starts off closed
  const [openSubOptions, setOpenSuboptions] = useState({
    isRecent: false,
    isCategory: false,
  }); // suboptions are closed as well (for the two categories with sub-options)

  const FilterCategories = {
    CATEGORY: "category",
    RECENT: "recent",
    REGION: "region",
    SENTIMENT: "sentiment",
  };

  const RecentOptions = {
    // recent dropdown
    TODAY: "today",
    PASTMONTH: "past month",
    PASTYEAR: "past year",
  };

  const Categories = {
    // category dropdown
    BUSINESS: "business",
    TECH: "technology",
    ENTERTAINMENT: "entertainment",
    GENERAL: "general",
    HEALTH: "health",
    SCIENCE: "science",
    SPORTS: "sports",
  };

  const handleDropDown = () => {
    if (openDropDown) {
      // we are going to close it
      setOpenSuboptions((prev) => ({ ...prev, isRecent: false })); // close this to
      setOpenSuboptions((prev) => ({ ...prev, isCategory: false })); // close this to
    }
    setOpenDropDown(!openDropDown);
  };

  const handleOptions = (category) => {
    if (category === "category") {
      setOpenSuboptions((prev) => ({
        ...prev,
        isCategory: !openSubOptions.isCategory,
      }));
    } else if (category === "recent") {
      setOpenSuboptions((prev) => ({
        ...prev,
        isRecent: !openSubOptions.isRecent,
      }));
    } else {
      // options without suboptions (clicking on it is all you need to do)
      setFilterOption(category);
    }
  };

  const handleSubOptions = (category) => {
    if (Object.values(Categories).includes(category)) {
      // if this is a category that we are sorting by
      setFilterOption("category:" + category); // marker for the exact route filter --> category --> suboption
    } else if (Object.values(RecentOptions).includes(category)) {
      // sort of implied
      setFilterOption("recent:" + category); // marker for the exact route filter --> recent --> suboption
    }
  };

  return (
    <div className="filter-dropdown">
      <button className="handleDropdown" type="button" onClick={handleDropDown}>
        Filter
      </button>
      <button
        className="handleDropdown"
        type="button"
        onClick={() => setFilterOption("clear")}
      >
        Clear Filters
      </button>
      {openDropDown ? (
        <ul className="filter-options">
          {Object.values(FilterCategories).map((category) => (
            <button
              className="filter-button"
              type="button"
              onClick={() => handleOptions(category)}
            >
              {category}
            </button>
          ))}
        </ul>
      ) : null}

      {openSubOptions.isCategory ? (
        <ul className="filter-options">
          {Object.values(Categories).map((category) => (
            <button
              className="filter-button"
              type="button"
              onClick={() => handleSubOptions(category)}
            >
              {category}
            </button>
          ))}
        </ul>
      ) : null}

      {openSubOptions.isRecent ? (
        <ul className="filter-options">
          {Object.values(RecentOptions).map((category) => (
            <button
              className="filter-button"
              type="button"
              onClick={() => handleSubOptions(category)}
            >
              {category}
            </button>
          ))}
        </ul>
      ) : null}
    </div>
  );
};

export default FilterDropDown;

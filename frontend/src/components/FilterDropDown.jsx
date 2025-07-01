import { useState } from "react";
import { SubFilters, Filters } from "../components/FilterTypes.jsx";

const FilterDropDown = ({ setFilterOption }) => {
  const [openDropDown, setOpenDropDown] = useState(false); // starts off closed
  const [openSubOptions, setOpenSuboptions] = useState({
    isRecent: false,
    isCategory: false,
  }); // suboptions are closed as well (for the two categories with sub-options)

  const getFilter = (filterType) => {
    switch (filterType) {
      case Filters.RECENT:
        return [
          SubFilters.NONE,
          SubFilters.TODAY,
          SubFilters.LAST_WEEK,
          SubFilters.LAST_YEAR,
        ];
      case Filters.CATEGORY:
        return [
          SubFilters.NONE,
          SubFilters.GENERAL,
          SubFilters.BUSINESS,
          SubFilters.ENTERTAINMENT,
          SubFilters.FOOD,
          SubFilters.HEALTH,
          SubFilters.POLITICS,
          SubFilters.SCIENCE,
          SubFilters.SPORTS,
          SubFilters.TECH,
          SubFilters.TRAVEL,
        ];
      case Filters.REGION:
      case Filters.SENTIMENT:
      case Filters.NONE:
    }
  };

  const FilterTypeButtons = (
    <ul className="filter-options">
      {Object.values(Filters).map(
        (category) =>
          category !== "none" && (
            <button
              className="filter-button"
              type="button"
              onClick={() => handleOptions(category)}
            >
              {category}
            </button>
          ),
      )}
    </ul>
  );

  const handleDropDown = () => {
    if (openDropDown) {
      setOpenSuboptions((prev) => ({
        ...prev,
        isRecent: false,
        isCategory: false,
      })); // close this to
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

  const filterButtons = (
    <>
      <button className="handleDropdown" type="button" onClick={handleDropDown}>
        Filter
      </button>
      <button
        className="handleDropdown"
        type="button"
        onClick={() => setFilterOption(Filters.NONE)}
      >
        Clear Filters
      </button>
    </>
  );

  const SubFilterTypeButtons = (filter) => {
    return (
      <ul className="filter-options">
        {Object.values(getFilter(filter)).map(
          (category) =>
            category !== "none" && (
              <button
                className="filter-button"
                type="button"
                onClick={() => setFilterOption(category)}
              >
                {category}
              </button>
            ),
        )}
      </ul>
    );
  };

  return (
    <div className="filter-dropdown">
      {filterButtons}
      {openDropDown ? FilterTypeButtons : null}
      {openSubOptions.isCategory
        ? SubFilterTypeButtons(Filters.CATEGORY)
        : null}
      {openSubOptions.isRecent ? SubFilterTypeButtons(Filters.RECENT) : null}
    </div>
  );
};

export default FilterDropDown;

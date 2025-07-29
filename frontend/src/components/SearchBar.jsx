import { useState } from "react";
import "../styles/SearchBar.css";

const SearchBar = ({ originalData, setNewsData, setFromFact }) => {
  const [query, setQuery] = useState("");
  const [isFactCheck, setIsFactCheck] = useState(false); // to toggle between fact-checking and simply searching for specific articles

  const handleSearching = (event) => {
    event.preventDefault();
    if (isFactCheck) {
      fetch(`http://localhost:3000/news/fact-checked`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          claim: query,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          setNewsData(data); // NOT the same structure as the other news, must be handled separately
          setFromFact(true); // once the information is accessed, will set this back to false
        })
        .catch((error) => {
          console.error("Error fetching evidence:", error);
        });
    } else {
      // normal searching through the information presented on the screen
      const filteredNews = [];

      const newsData = originalData;
      const keyWords = query.split(" "); // split the query into keywords to look for

      for (const article of newsData) {
        if (
          keyWords.some((word) =>
            article.name.toLowerCase().includes(word.toLowerCase())
          )
        ) {
          // accounts for case-insensitivity
          // valid article
          filteredNews.push(article);
        }
      }

      setNewsData(filteredNews);
    }
  };

  const TypeOfSearch = () => {
    return (
      <div
        className="type-search"
        onClick={() => setIsFactCheck(!isFactCheck)}
        style={{ backgroundColor: isFactCheck ? "#9e0b0f" : "#000000" }}
      >
        {isFactCheck ? "Fact Check" : "Search Articles"}
      </div>
    );
  };

  const handleClear = () => {
    setFromFact(false); // reset the information on the Home Page
    setNewsData(originalData); // reset the news data to the original news data passed into this component
  };

  return (
    <form className="Searchbar" onSubmit={handleSearching}>
      <div className="formElements">
        <TypeOfSearch />

        <input
          className="searchInput"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a question or fact-check a claim..."
        />

        <button type="submit" id="submitChange" onClick={handleSearching}>
          Search
        </button>
        <button type="button" id="submitChange" onClick={handleClear}>
          Clear
        </button>
      </div>
    </form>
  );
};

export default SearchBar;

import { useState } from "react";
import "../styles/SearchBar.css";

const SearchBar = ({setChangedNewsData, fromFact, setLoading }) => {
  const [query, setQuery] = useState("");

  const handleSearching = (event) => {
    event.preventDefault();
    setLoading(true);
    if (fromFact) {
      fetch(`http://localhost:3000/news/fact-checked`, { // combine the two fetches?
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
            setLoading(false);
          setChangedNewsData(data); // NOT the same structure as the other news, must be handled separately
        })
        .catch((error) => {
            setLoading(false);
          console.error("Error fetching evidence:", error);
        });
    } else {
      // normal searching through the information presented on the screen
      const keyWords = query.split(" "); // split the query into keywords to look for

      searchArticles(keyWords);
    }
  };

  const searchArticles = (keyWords) => {
    setLoading(true);
    fetch(`http://localhost:3000/news/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        keywords: keyWords,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setLoading(false);
        setChangedNewsData(data); // top 30 articles that match the search query
      })
      .catch((error) => {
        setLoading(false);
        console.error("Error fetching search results: ", error);
      });
  };

  const TypeOfSearch = () => {
    return (
      <div
        className="type-search"
        style={{ backgroundColor: fromFact ? "#9e0b0f" : "#000000" }}
      >
        {fromFact ? "Fact Check" : "Search Articles"}
      </div>
    );
  };

  const handleClear = () => {
    setQuery(""); // clear the search bar
    setChangedNewsData(null); // no changed news anymore
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

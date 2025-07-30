import SearchBar from "./SearchBar";
import NewsList from "./NewsList";
import LoadingGif from "../assets/loading.gif";
import { useState } from "react";

const FactCheckPage = () => {
  const fromFact = true;
  const [newsData, setNewsData] = useState(null);
  const [isLoading, setLoading] = useState(false); // loading state

  return (
    <div className="fact-check-page">
      <SearchBar
        setChangedNewsData={setNewsData}
        fromFact={fromFact}
        setLoading={setLoading}
      />
      <div className="news-section">
        {newsData && (
          <NewsList
            newsData={newsData}
            setNewsData={setNewsData}
            fromFact={fromFact}
          />
        )}
        {!newsData && !isLoading && (
          <h2 className="noNews-header">No News to Display Yet...</h2>
        )}
        {isLoading && (
          <img className="loading" src={LoadingGif} alt="Loading . . ." />
        )}
      </div>
    </div>
  );
};

export default FactCheckPage;

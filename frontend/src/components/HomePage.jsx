import { useState, useEffect } from "react";
import Banner from "../components/Banner.jsx";
import NewsList from "./NewsList";
import LoadingGif from "../assets/loading.gif";

const HomePage = () => {
  const [newsData, setNewsData] = useState(null);
  const [isLoading, setLoading] = useState(null);
  const [filterOption, setFilterOption] = useState(""); // for the filter dropdown
  const fetchNewsURL = `http://localhost:3000/user-news`; // default URL for general news (but user-specific)

  useEffect(() => {
    fetchNews(fetchNewsURL);
  }, []);

  useEffect(() => {
    if (filterOption != "") {
      filterData();
    }
  }, [filterOption]);

  const fetchNews = (url) => {
    // fetches the news for the HomePage
    setLoading(true);
    fetch(url, {
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); // Parse JSON data from the response
      })
      .then((data) => {
        setNewsData(data);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        console.error("Error fetching news:", error);
      });
  };

  const filterData = () => {
    const filterURL = fetchNewsURL + `/filter-news/${filterOption}`;
    fetchNews(filterURL);
  };

  return (
    <div className="HomePage">
      <Banner
        setFilterOption={setFilterOption}
        setNewsData={setNewsData}
        setLoading={setLoading}
      />
      {newsData && <NewsList newsData={newsData} setNewsData={setNewsData} />}
      <div className="loading-state">
        {isLoading && (
          <img className="loading" src={LoadingGif} alt="Loading . . ." />
        )}
      </div>
    </div>
  );
};

export default HomePage;

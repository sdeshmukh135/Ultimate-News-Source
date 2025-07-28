import { useState, useEffect } from "react";
import NewsList from "./NewsList";
import LoadingGif from "../assets/loading.gif";

const ReadLaterPage = () => {
  const [newsData, setNewsData] = useState(null);
  const [isLoading, setLoading] = useState(null);

  useEffect(() => {
    fetchBookmarkedNews();
  }, []);

  const fetchBookmarkedNews = async () => {
    setLoading(true);
    fetch(`http://localhost:3000/user-news/bookmarked`, {
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); // Parse JSON data from the response
      })
      .then((data) => {
        setLoading(false);
        setNewsData(data);
      })
      .catch((error) => {
        setLoading(false);
        console.error("Error fetching news:", error);
      });
  };

  return (
    <div className="bookmarkedPage">
      {newsData && <NewsList newsData={newsData} setNewsData={setNewsData} />}
      <div className="loading-state">
        {isLoading && (
          <img className="loading" src={LoadingGif} alt="Loading . . ." />
        )}
      </div>
    </div>
  );
};

export default ReadLaterPage;

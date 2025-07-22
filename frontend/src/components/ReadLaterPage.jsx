import { useState, useEffect } from "react";
import NewsList from "./NewsList";

const ReadLaterPage = () => {
  const [newsData, setNewsData] = useState(null);

  useEffect(() => {
    fetchBookmarkedNews();
  }, []);

  const fetchBookmarkedNews = async () => {
    fetch(`http://localhost:3000/user-news/`, {
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); // Parse JSON data from the response
      })
      .then((data) => {
        setNewsData(parseForBookmarked(data));
      })
      .catch((error) => {
        console.error("Error fetching news:", error);
      });
  };

  const parseForBookmarked = (news) => {
    const bookMarkedNews = [];
    for (const article of news) {
      if (article.bookmarked) {
        bookMarkedNews.push(article);
      }
    }
    return bookMarkedNews;
  };

  return (
    <div className="bookmarkedPage">
      {newsData && <NewsList newsData={newsData} setNewsData={setNewsData} />}
    </div>
  );
};

export default ReadLaterPage;

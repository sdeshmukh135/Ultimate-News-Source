import { useState, useEffect } from "react";
import NewsList from "./NewsList";

const HomePage = () => {
  const [newsData, setNewsData] = useState(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = () => {
    fetch(`http://localhost:3000/news`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); // Parse JSON data from the response
      })
      .then((data) => {
        // Handle successful response

        setNewsData(data);
      })
      .catch((error) => {
        console.error("Error fetching news:", error);
      });
  };

  return (
    <div className="HomePage">
      {newsData && <NewsList newsData={newsData} />}
    </div>
  );
};

export default HomePage;

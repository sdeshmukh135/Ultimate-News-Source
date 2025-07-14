import NewsComponent from "./NewsComponent";
import ArticleModal from "./ArticleModal";
import { useState } from "react";
import "../styles/News.css";

const NewsList = ({ newsData, setNewsData }) => {
  const [articleModalData, setArticleModalData] = useState(""); // for the article data (just the article link for now)

  const handleSignalUpdates = (id, signal, liked) => {
    fetch(`http://localhost:3000/interactions/${id}/${signal}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        updatedSignal: liked ? liked : false,
      }),
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .catch((error) => {
        console.error("Error updating signals: ", error);
      });
  };

  return (
    <div className="news-list">
      {articleModalData && (
        <ArticleModal
          articleModalData={articleModalData}
          setArticleModalData={setArticleModalData}
          setNewsData={setNewsData}
          handleSignalUpdates={handleSignalUpdates}
        />
      )}
      {newsData.map((article) => {
        return (
          <NewsComponent
            article={article}
            setNewsData={setNewsData}
            setArticleModalData={setArticleModalData}
            handleSignalUpdates={handleSignalUpdates}
          />
        );
      })}
    </div>
  );
};

export default NewsList;

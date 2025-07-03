import NewsComponent from "./NewsComponent";
import ArticleModal from "./ArticleModal";
import { useState } from "react";
import "../styles/News.css";

const NewsList = ({ newsData }) => {
  const [articleModalData, setArticleModalData] = useState(""); // for the article data (just the article link for now)

  return (
    <div className="news-list">
      {articleModalData && (
        <ArticleModal
          articleModalData={articleModalData}
          setArticleModalData={setArticleModalData}
        />
      )}
      {newsData.map((article) => {
        return (
          <NewsComponent
            article={article}
            setArticleModalData={setArticleModalData}
          />
        );
      })}
    </div>
  );
};

export default NewsList;

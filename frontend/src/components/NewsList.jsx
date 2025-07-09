import NewsComponent from "./NewsComponent";
import ArticleModal from "./ArticleModal";
import { useState } from "react";
import "../styles/News.css";

const NewsList = ({ newsData, metaData, setMetaData }) => {
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
        let uiData = null;
        for (const data of metaData) {
          if (data.newsId === article.id) {
            uiData = data;
          }
        }
        return (
          <NewsComponent
            article={article}
            setArticleModalData={setArticleModalData}
            uiData={uiData}
            setMetaData={setMetaData}
          />
        );
      })}
    </div>
  );
};

export default NewsList;

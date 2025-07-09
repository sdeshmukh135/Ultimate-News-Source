import "../styles/News.css";
import DefaultNewsImage from "/src/assets/default-news.png";
import EmptyBookMarkImage from "/src/assets/emptyBookmark.png";
import FilledBookMarkImage from "/src/assets/filledBookmark.png";
import { useState } from "react";

const NewsComponent = ({ article, setArticleModalData }) => {
  const openModal = () => {
    setArticleModalData(article.articleURL); // just so the modal appears on the screen
  };

  // TO-DO: Connect backend bookmarking to the frontend to mark the bookmarks and store in backend

  return (
    <div className="newsComponent" onClick={openModal}>
      <img className="readLater" src={EmptyBookMarkImage} alt={"Read Later"} />
      <div className="newsContent">
        {article.imageURL ? (
          <img
            className="newsPic"
            src={article.imageURL}
            alt={"Not Found"}
            onError={(event) => {
              event.target.src = DefaultNewsImage;
              event.onerror = null;
            }}
          />
        ) : (
          <img className="newsPic" src={DefaultNewsImage} alt={"Not Found"} />
        )}
        <h3>{article.name}</h3>
        <h4>Release Date: {article.releasedAt.slice(0, 10)}</h4>
      </div>
    </div>
  );
};

export default NewsComponent;

import NewsComponent from "./NewsComponent";
import "../styles/News.css";

const NewsList = ({ newsData }) => {
  return (
    <div className="news-list">
      {newsData.map((article) => {
        return (
          <>
            <NewsComponent article={article} />
          </>
        );
      })}
    </div>
  );
};

export default NewsList;

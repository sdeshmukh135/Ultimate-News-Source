import NewsComponent from "./NewsComponent";
import ArticleModal  from "./ArticleModal";
import "../styles/News.css";

const NewsList = (props) => {
  return (
    <div className="news-list">
      {props.articleModalData && <ArticleModal articleModalData={props.articleModalData} setArticleModalData={props.setArticleModalData}/>}
      {props.newsData.map((article) => {
        return <NewsComponent article={article} setArticleModalData={props.setArticleModalData}/>
      })}
    </div>
  );
};

export default NewsList;

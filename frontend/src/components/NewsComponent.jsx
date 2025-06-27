import "../styles/News.css";
import DefaultNewsImage from "/src/assets/default-news.png"; // TO-DO: Get this to appear when imageURL is null (not just invalid)

const NewsComponent = ({ article }) => {
  return (
    <div className="newsComponent">
      <img
        className="newsPic"
        src={article.imageURL}
        alt={"Not Found"}
        onError={(event) => {
          event.target.src = DefaultNewsImage
          event.onerror=null
        }}
      />
      <h3>{article.name}</h3>
      <h4>Release Date: {article.releaseDate}</h4>
    </div>
  );
};

export default NewsComponent;

import "../styles/News.css";
import DefaultNewsImage from "/src/assets/default-news.png";

const NewsComponent = ({ article, setArticleModalData }) => {
  const openModal = () => {
    setArticleModalData(article.articleURL); // just so the modal appears on the screen
  };

  return (
    <div className="newsComponent" onClick={openModal}>
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
  );
};

export default NewsComponent;

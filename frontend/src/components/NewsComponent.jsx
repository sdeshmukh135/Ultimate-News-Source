import "../styles/News.css";
import DefaultNewsImage from "/src/assets/default-news.png";
import EmptyBookMarkImage from "/src/assets/emptyBookmark.png";
import FilledBookMarkImage from "/src/assets/filledBookmark.png";
import { SIGNALS } from "../utils/utils";
import GradientBar from "./GradientBar";

const NewsComponent = ({
  article,
  setNewsData,
  setArticleModalData,
  handleSignalUpdates,
}) => {
  const openModal = (event) => {
    event.stopPropagation();
    const articleModalInfo = {
      url: article.articleURL,
      id: article.id,
      addTagInput: article.addTagInput,
    };
    setArticleModalData(article); // just so the modal appears on the screen
    // add signal handling (update user interaction)
    handleSignalUpdates(article.id, SIGNALS.OPEN);
  };

  const handleBookmark = (event) => {
    event.stopPropagation();

    // add change to database
    fetch(`http://localhost:3000/user-news/${article.id}/bookmarked`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        isBookmarked: !article.bookmarked,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setNewsData(data);
      })
      .catch((error) => {
        console.error("Error fetching bookmarks: ", error);
      });

    handleSignalUpdates(article.id, SIGNALS.LIKED, !article.bookmarked);
  };

  const parseDate = (date) => {
    const newDate = new Date(date);
    newDate.setHours(newDate.getHours() + newDate.getTimezoneOffset() / 60);

    return newDate.toDateString();
  };

  return (
    <div
      className="newsComponent"
      onClick={openModal}
      style={{
        backgroundImage: `url(${
          article.imageURL ? article.imageURL : DefaultNewsImage
        })`,
        backgroundSize: "cover",
        backgroundPosition: "center center",
        border: "2px solid #9e0b0f",
      }}
    >
      {article.bookmarked ? (
        <img
          className="readLater"
          src={FilledBookMarkImage}
          alt={"Bookmarked"}
          onClick={handleBookmark}
        />
      ) : (
        <img
          className="readLater"
          src={EmptyBookMarkImage}
          alt={"Not Bookmarked"}
          onClick={handleBookmark}
        />
      )}

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
        <h4>Release Date: {parseDate(article.releasedAt)}</h4>
        <GradientBar article={article} />
        <div className="tags">
          <div className="tag-container">{article.sentiment[0].label}</div>
          {article.category.map((cat) => {
            return <div className="tag-container">{cat}</div>;
          })}
        </div>
      </div>
    </div>
  );
};

export default NewsComponent;

import { useState } from "react";
import DefaultNewsImage from "/src/assets/default-news.png";
import "../styles/FeaturedPage.css";

const FeaturedNews = ({ featuredData }) => {
  const [index, setIndex] = useState(0); // to toggle through all of the news

  const handleNext = () => {
    // to get to the next news
    setIndex((prev) => (prev + 1) % featuredData.length);
  };

  const handlePrev = () => {
    // to get to the previous news
    setIndex((prev) => (prev - 1 + featuredData.length) % featuredData.length);
  };

  const Feature = (data) => {
    return (
      <div className="featured-container">
        {data.imageURL ? (
          <img
            className="featuredPic"
            src={data.imageURL}
            alt={"Not Found"}
            onError={(event) => {
              event.target.src = DefaultNewsImage;
              event.onerror = null;
            }}
          />
        ) : (
          <img className="newsPic" src={DefaultNewsImage} alt={"Not Found"} />
        )}
        <h3>{data.name}</h3>
        <h4>Release Date: {new Date(data.releasedAt).toDateString()}</h4>
      </div>
    );
  };

  return (
    <div className="featureNews">
      {Feature(featuredData[index])}
      <div className="toggleButtons">
        <button onClick={handlePrev} className="toggle">
          ⬅️
        </button>
        <button onClick={handleNext} className="toggle">
          ➡️
        </button>
      </div>
    </div>
  );
};

export default FeaturedNews;

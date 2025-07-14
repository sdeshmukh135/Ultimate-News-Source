import "../styles/GradientBar.css";

const GradientBar = ({ article }) => {
  const totalCount = article.leftCount + article.rightCount;
  const bluePercent =
    totalCount == 0 ? 0 : (article.leftCount / totalCount) * 100; // gradient is from blue to red

  const gradient = {
    // CSS styling using percentages
    width: "390px",
    height: "30px",
    borderRadius: "5px",
    background:
      totalCount == 0
        ? "#f3f3f3"
        : `linear-gradient(to right, blue ${bluePercent}%, #9e0b0f ${bluePercent}%)`,
  };

  return (
    <div className="gradient-bar">
      <div className="counts">
        <p>{article.leftCount}</p>
        <p>{article.rightCount}</p>
      </div>
      <div className="bar-container" style={gradient}></div>
    </div>
  );
};

export default GradientBar;

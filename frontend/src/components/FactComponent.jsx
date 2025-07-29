import "../styles/FactComponent.css";

const FactComponent = ({ article }) => {
  const openArticle = () => {
    const url = article.articleURL;
    window.open(url, "_blank");
  };

  const parseDate = (date) => {
    const newDate = new Date(date);
    newDate.setHours(newDate.getHours() + newDate.getTimezoneOffset() / 60);

    return newDate.toDateString();
  };

  return (
    <div className="evidence" onClick={openArticle}>
      <h2>Claim: {article.claim}</h2>
      <h3>Review : {article.review}</h3>
      <div className="details">
        <h4>Source : {article.source}</h4>
        <h4>Published On : {parseDate(article.reviewDate)}</h4>
      </div>
    </div>
  );
};

export default FactComponent;

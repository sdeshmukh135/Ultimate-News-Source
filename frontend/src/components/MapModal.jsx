import "../styles/Modal.css";
import "../styles/Map.css";

const MapModal = ({ regionData, mapModalVisible, setMapModalVisible }) => {
  const closeModal = () => {
    setMapModalVisible(false); // close the modal
  };

  const openArticle = (article) => {
    const url = article.articleURL;
    window.open(url, "_blank");
  };

  const parseDate = (date) => {
    const newDate = new Date(date);
    newDate.setHours(newDate.getHours() + newDate.getTimezoneOffset() / 60);

    return newDate.toDateString();
  };

  const MapComponent = (article) => {
    return (
      <div className="region-article" onClick={() => openArticle(article)}>
        <h3>{article.name}</h3>
        <h4>Release Date: {parseDate(article.releasedAt)}</h4>
        <img className="newsPic" src={article.imageURL} alt="article image" />
      </div>
    );
  };

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div
        className="modal-content"
        onClick={(element) => element.stopPropagation()}
      >
        <h2>Articles for {mapModalVisible}</h2>
        <div className="region-articles">
          {regionData.map((article) => {
            return MapComponent(article);
          })}
        </div>
      </div>
    </div>
  );
};

export default MapModal;

import "../styles/Modal.css";
import Whiteboard from "./Whiteboard.jsx";

const ArticleModal = (props) => {
  const openArticle = () => {
    const url = props.articleModalData;
    window.open(url, "_blank");
  };

  const closeModal = () => {
    props.setArticleModalData("");
  };

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div
        className="modal-content"
        onClick={(element) => element.stopPropagation()}
      >
        <h2>Notes</h2>
        <button className="articleButton" onClick={openArticle}>
          Article
        </button>
        <Whiteboard />
      </div>
    </div>
  );
};

export default ArticleModal;

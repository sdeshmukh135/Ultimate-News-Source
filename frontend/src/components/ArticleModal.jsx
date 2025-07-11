import "../styles/Modal.css";
import Whiteboard from "./Whiteboard.jsx";
import {SIGNALS} from "../utils/utils.js"

const ArticleModal = (props) => {

  const openArticle = () => {
    const url = props.articleModalData.url;
    props.handleSignalUpdates(props.articleModalData.id, SIGNALS.READ);
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

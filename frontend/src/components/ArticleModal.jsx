import "../styles/Modal.css"

const ArticleModal = (props) => {

    const parseArticleData = (url) => {
        return (
            <iframe
            src={url}
            width="800"
            height="600"
            title="Embedded"
        ></iframe>
        )
    }
  
  const closeModal = () => {
    props.setArticleModalData("");
  };

  return (
    <div className="modal-overlay" onClick={closeModal}>
        <div className="modal-content" onClick={element => element.stopPropagation()}>
            {parseArticleData(props.articleModalData)}
        </div>
    </div>
  )
};

export default ArticleModal;

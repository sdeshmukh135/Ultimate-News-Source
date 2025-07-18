import "../styles/Modal.css";
import Whiteboard from "./Whiteboard.jsx";
import { SIGNALS } from "../utils/utils.js";
import { TAGS } from "../utils/utils.js";
import { useState } from "react";

const ArticleModal = (props) => {
  const [answered, setAnswered] = useState(props.articleModalData.addTagInput); // if they have already contributed with tag input

  const openArticle = () => {
    const url = props.articleModalData.articleURL;
    props.handleSignalUpdates(props.articleModalData.id, SIGNALS.READ);
    window.open(url, "_blank");
  };

  const closeModal = () => {
    props.setArticleModalData("");
  };

  const handleTagChange = (tag) => {
    // handle change to tag in the news database
    fetch(
      `http://localhost:3000/news/${props.articleModalData.id}/update-tag`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          tagToUpdate: tag,
          addedInput: true,
        }),
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setAnswered(true); // cannot add input again
        props.setNewsData(data);
      })
      .catch((error) => {
        console.error("Error updating tags: ", error);
      });
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
        <Whiteboard
          setNewsData={props.setNewsData}
          id={props.articleModalData.id}
          canvasData={props.articleModalData.canvasData}
        />

        <div className="userInput">
          {answered ? (
            <h3>Thank you for contributing!</h3>
          ) : (
            <>
              <h3>Want to Contribute?</h3>
              <h3>
                Let us know where you believe the ideas in this article are
                aligned!
              </h3>
              <div className="tag-options">
                <button onClick={() => handleTagChange(TAGS.LEFT)}>
                  Liberal-Leaning
                </button>
                <button onClick={() => handleTagChange(TAGS.RIGHT)}>
                  Conservative-Leaning
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticleModal;

import "../styles/modal.css";
import { useState } from "react";
import { CATEGORIES } from "../utils/utils.js";

const PersonalizationModal = ({ setNewsData, setPersonalModal }) => {
  const [personal, setPersonal] = useState({
    categories: [], // set kind of categories to choose from
    sources: [], // user can input whatever sources they would like
  });

  const [source, setSource] = useState(""); // for the individual sources to add to the personalizationc
  const [addedMessage, setAddedMessage] = useState(""); // for confirmation that the source was added

  const handleSubmit = (event) => {
    event.preventDefault();
    // connect to existing backend route to add to the userNewsCache
    fetch(`http://localhost:3000/user-news/add-news`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        categories: personal.categories,
        sources: personal.sources,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setNewsData(data); // new input for the specific user
        setPersonalModal(false);
      })
      .catch((error) => {
        setLoading(false);
        setPersonalModal(false);
        console.error("Error fetching times: ", error);
      });
  };

  const handleSelectingCategories = (event) => {
    const options = event.target.options;
    const selectedCategories = [];
    for (const option of options) {
      if (option.selected) {
        // this is one of the selected option
        selectedCategories.push(option.value);
      }
    }

    setPersonal((cat) => ({ ...cat, categories: selectedCategories }));
  };

  const handleSource = (event) => {
    event.preventDefault();

    let newSources = personal.sources;
    newSources.push(source);
    setPersonal((source) => ({ ...source, sources: newSources }));
    setAddedMessage("Added Source Successfully!");
    setSource(""); // empty the input
  };

  return (
    <div className="modal-overlay">
      <div
        className="modal-content"
        onClick={(element) => element.stopPropagation()}
      >
        <h2>What kind of News would you like to see? Let us help you!</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="categories">
            Categories (Select All that Apply):
          </label>
          <select
            multiple={true}
            value={personal.categories}
            onChange={handleSelectingCategories}
            className="postInput"
            required
          >
            {Object.keys(CATEGORIES).map((category) => {
              return <option value={category.toLowerCase()}>{category}</option>;
            })}
          </select>

          <label htmlFor="sources">Add Sources to Include: </label>
          <input
            className="sources"
            type="text"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="e.g. google.com"
          />
          <button type="button" id="submitSource" onClick={handleSource}>
            Add Source
          </button>
          <div className="messageAfter">
            {addedMessage && <h4>{addedMessage}</h4>}
          </div>
          <button
            type="submit"
            id="submitPersonalization"
            onSubmit={handleSubmit}
          >
            Submit Personalization
          </button>
        </form>
      </div>
    </div>
  );
};

export default PersonalizationModal;

import "../styles/modal.css";
import { useState } from "react";
import LoadingGif from "../assets/loading.gif";
import { CATEGORIES } from "../utils/utils.js";

const PostArticleModal = ({ setOpenPostModal }) => {
  const [post, setPost] = useState({
    title: "",
    imageURL: "",
    url: "",
    categories: [], // array
    timeToSchedule: "", // scheduling system for this
  });
  const [isLoading, setLoading] = useState(false); // loading state
  const [successMessage, setSuccessMessage] = useState(""); // to prove the post has been scheduled (because there is no instant reaction)
  const [selectedTime, setSelectedTime] = useState("");
  const [timeOptions, setTimeOptions] = useState([]); // the options

  const parseOption = (time) => {
    // turn into the right format
    const dayOfWeek = parseInt(time.slice(0, 1)); // first digit
    const hour = parseInt(time.slice(2, 5)); // hour to post it during the day

    let timeOption = getDay(dayOfWeek);
    if (hour > 12) {
      // in the afternoon
      timeOption = timeOption + " " + (hour - 12) + "pm";
    } else {
      timeOption = timeOption + " " + hour + "am";
    }

    return timeOption;
  };

  const getDay = (index) => {
    const days = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"];
    return days[index];
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

    setPost((cat) => ({ ...cat, categories: selectedCategories }));
  };

  const handlePost = (event) => {
    event.preventDefault();
    // update the post data
    fetch(`http://localhost:3000/news/add-new-news`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        title: post.title,
        url: post.url,
        imageURL: post.imageURL,
        categories: post.categories,
        timeToSchedule: post.timeToSchedule,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setSuccessMessage(data.message);
      })
      .catch((error) => {
        console.error("Error scheduling post: ", error);
      });
  };

  const OptionComponent = ({ isClicked, option }) => {
    return (
      <div
        className="option"
        onClick={() => setScheduledTime(option)}
        style={{ backgroundColor: isClicked ? "#ababab" : "#fff6eb" }}
      >
        {parseOption(option)}
      </div>
    );
  };

  const handleScheduling = () => {
    setLoading(true); // loading

    fetch(`http://localhost:3000/news/find-times`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        title: post.title,
        url: post.url,
        imageURL: post.imageURL,
        categories: post.categories,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        const options = data.map((option) => option[0]); // the first index is the date
        setTimeOptions(options);
        setLoading(false); // no longer loading
      })
      .catch((error) => {
        console.error("Error fetching times: ", error);
      });
  };

  const setScheduledTime = (time) => {
    // TO-DO: Set the scheduled time in using setPost
    setSelectedTime(time);
    setPost((prev) => ({ ...prev, timeToSchedule: time })); // new post content is all there now
  };

  const closeModal = () => {
    setOpenPostModal(false);
  };

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div
        className="modal-content"
        onClick={(element) => element.stopPropagation()}
      >
        <h2>Have Something to Say? Post an Article!</h2>
        <form onSubmit={handlePost}>
          <label htmlFor="title">Article Title:</label>
          <input
            className="postInput"
            type="text"
            value={post.title}
            onChange={(e) =>
              setPost((prev) => ({ ...prev, title: e.target.value }))
            }
            name="title"
            placeholder="Enter Article Name"
            required
          />
          <label htmlFor="ArticleURL">Article URL:</label>
          <input
            className="postInput"
            type="text"
            value={post.url}
            onChange={(e) =>
              setPost((prev) => ({ ...prev, url: e.target.value }))
            }
            name="articleURL"
            placeholder="Enter Article URL"
            required
          />
          <label htmlFor="ImageURL">Article Cover URL:</label>
          <input
            className="postInput"
            type="text"
            value={post.imageURL}
            onChange={(e) =>
              setPost((prev) => ({ ...prev, imageURL: e.target.value }))
            }
            name="imageURL"
            placeholder="Enter Article Cover URL"
            required
          />
          <label htmlFor="category">Category (Select all that Apply): </label>
          <select
            multiple={true}
            value={post.categories}
            onChange={handleSelectingCategories}
            className="postInput"
            required
          >
            {Object.keys(CATEGORIES).map((category) => {
              return <option value={category.toLowerCase()}>{category}</option>;
            })}
          </select>
          <button
            type="button"
            id="handleScheduling"
            onClick={handleScheduling}
          >
            Generate Potential Post Dates
          </button>

          <div className="time-options">
            {timeOptions &&
              timeOptions.map((option) => {
                return (
                  <OptionComponent
                    isClicked={selectedTime === option}
                    option={option}
                  />
                );
              })}
          </div>

          <div className="loading-state">
            {isLoading && (
              <img className="loading" src={LoadingGif} alt="Loading . . ." />
            )}
          </div>

          <button type="submit" id="submitPost" onClick={handlePost}>
            Create Post
          </button>

          <div className="messageAfter">
            {successMessage && <h4>{successMessage}</h4>}
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostArticleModal;

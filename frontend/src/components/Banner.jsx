import FilterDropDown from "../components/FilterDropDown.jsx";
import "../styles/Banner.css";
import { useState } from "react";
import PlusSign from "/src/assets/plusSign.png";
import PostArticleModal from "./PostArticleModal.jsx";
import SearchBar from "./SearchBar.jsx";

const Banner = ({
  setFilterOption,
  setNewsData,
  setLoading,
  setChangedNewsData,
  fromFact,
}) => {
  // ONLY visible to those logged in
  const [openPostModal, setOpenPostModal] = useState(false);

  const openModal = () => {
    setOpenPostModal(true);
  };

  const handleRefresh = () => {
    // refresh for personalized news (must update engagement scores and send personalized news back to screen)
    setLoading(true);
    // get personalized news
    fetch(`http://localhost:3000/user-news/personalized`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setNewsData(data);
        setLoading(false); // no longer loading now that there is data
      })
      .catch((error) => {
        setLoading(false);
        console.error("Error creating personalized news: ", error);
      });
  };

  return (
    <div className="banner">
      <div className="right-side">
        <h2>News for You</h2>
        <button onClick={handleRefresh}>Refresh Feed</button>
      </div>
      <SearchBar
        setChangedNewsData={setChangedNewsData}
        fromFact={fromFact}
        setLoading={setLoading}
      />
      <div className="features">
        <FilterDropDown setFilterOption={setFilterOption} />
        <div className="plusToolTip">
          <img
            className="plus-sign"
            src={PlusSign}
            alt="plus sign"
            onClick={openModal}
          />
          <span className="tooltip-text">Post an Article of Your Own!</span>
        </div>
      </div>
      {openPostModal && (
        <PostArticleModal setOpenPostModal={setOpenPostModal} />
      )}
    </div>
  );
};

export default Banner;

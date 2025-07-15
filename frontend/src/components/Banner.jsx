import FilterDropDown from "../components/FilterDropDown.jsx";
import "../styles/Banner.css";

const Banner = ({ setFilterOption, setNewsData }) => {
  // ONLY visible to those logged in

  const handleRefresh = () => {
    // refresh for personalized news (must update engagement scores and send personalized news back to screen)

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
      })
      .catch((error) => {
        console.error("Error creating personalized news: ", error);
      });
  };

  return (
    <div className="banner">
      <h2>News for You</h2>
      <button onClick={handleRefresh}>Refresh Feed</button>
      <FilterDropDown setFilterOption={setFilterOption} />
    </div>
  );
};

export default Banner;

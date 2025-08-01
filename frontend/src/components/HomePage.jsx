import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Banner from "../components/Banner.jsx";
import NewsList from "./NewsList";
import LoadingGif from "../assets/loading.gif";
import PersonalizationModal from "./PersonalizationModal.jsx";
import SearchBar from "./SearchBar.jsx";

const HomePage = () => {
  const [newsData, setNewsData] = useState(null);
  const [changedNewsData, setChangedNewsData] = useState(null); // to hold changes to using search
  const [personalModalVisible, setPersonalModalVisible] = useState(false); // whether or not we need the modal for initial personalization
  const [isLoading, setLoading] = useState(null);
  const [filterOption, setFilterOption] = useState(""); // for the filter dropdown

  const fromFact = false;
  const navigate = useNavigate();

  const fetchNewsURL = `http://localhost:3000/user-news`; // default URL for general news (but user-specific)

  useEffect(() => {
    fetchNews(fetchNewsURL);
  }, []);

  useEffect(() => {
    if (filterOption != "") {
      filterData();
    }
  }, [filterOption]);

  const fetchNews = (url) => {
    // fetches the news for the HomePage
    setLoading(true);
    fetch(url, {
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); // Parse JSON data from the response
      })
      .then((data) => {
        if (data.length === 0 && filterOption === "") {
          // there is no news in the cache for this specific user (i.e. new user)
          setPersonalModalVisible(true);
        } else {
          setNewsData(data);
        }
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        console.error("Error fetching news:", error);
      });
  };

  const toMap = () => {
    navigate("/map");
  };

  const filterData = () => {
    const filterURL = fetchNewsURL + `/filter-news/${filterOption}`;
    fetchNews(filterURL);
  };

  return (
    <div className="HomePage">
      <Banner
        setFilterOption={setFilterOption}
        setNewsData={setNewsData}
        setChangedNewsData={setChangedNewsData}
        setLoading={setLoading}
        fromFact={fromFact}
      />
      <button className="button-to-map" onClick={toMap}>
        View Articles on Map
      </button>
      {personalModalVisible && (
        <PersonalizationModal
          setNewsData={setNewsData}
          setPersonalModalVisible={setPersonalModalVisible}
        />
      )}
      {newsData && (
        <NewsList
          newsData={changedNewsData || newsData}
          setNewsData={changedNewsData ? setChangedNewsData : setNewsData}
          fromFact={fromFact}
        />
      )}
      <div className="loading-state">
        {isLoading && (
          <img className="loading" src={LoadingGif} alt="Loading . . ." />
        )}
      </div>
    </div>
  );
};

export default HomePage;

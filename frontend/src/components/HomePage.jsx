import { useState, useEffect } from "react";
import Banner from "../components/Banner.jsx";
import NewsList from "./NewsList";
import LoadingGif from "../assets/loading.gif";
import PersonalizationModal from "./PersonalizationModal.jsx";
import SearchBar from "./SearchBar.jsx";

const HomePage = () => {
  const [newsData, setNewsData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [personalModalVisible, setPersonalModalVisible] = useState(false); // whether or not we need the modal for initial personalization
  const [isLoading, setLoading] = useState(null);
  const [fromFact, setFromFact] = useState(false); // test whether the newsData is from fact search query
  const [filterOption, setFilterOption] = useState(""); // for the filter dropdown
  
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
        if (data.length === 0) {
          // there is no news in the cache for this specific user (i.e. new user)
          setPersonalModalVisible(true);
        } else {
          setNewsData(data);
          setOriginalData(data);
        }
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        console.error("Error fetching news:", error);
      });
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
        setLoading={setLoading}
      />
      <SearchBar originalData={originalData} setNewsData={setNewsData} setFromFact={setFromFact}/>
      {personalModalVisible && (
        <PersonalizationModal
          setNewsData={setNewsData}
          setPersonalModalVisible={setPersonalModalVisible}
        />
      )}
      {newsData && <NewsList newsData={newsData} setNewsData={setNewsData} fromFact={fromFact} />}
      <div className="loading-state">
        {isLoading && (
          <img className="loading" src={LoadingGif} alt="Loading . . ." />
        )}
      </div>
    </div>
  );
};

export default HomePage;

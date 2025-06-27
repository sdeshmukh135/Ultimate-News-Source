import { useState, useEffect } from "react";
import NewsList from "./NewsList";

const HomePage = ({ filterOption }) => {
  const [newsData, setNewsData] = useState(null);
  const [filteredData, setFilteredData] = useState(null);

  const dataToDisplay = filteredData || newsData;

  useEffect(() => {
    fetchNews();
  }, []);

  useEffect(() => {
    if (filterOption != "") {
      filterData();
    }
  }, [filterOption]);

  const fetchNews = () => {
    fetch(`http://localhost:3000/news`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); // Parse JSON data from the response
      })
      .then((data) => {
        // Handle successful response

        setNewsData(data);
      })
      .catch((error) => {
        console.error("Error fetching news:", error);
      });
  };

  const filterData = () => {
    let currentNewsData = [...newsData];
    let newData = null;

    if (filterOption === "clear") {
      // clear filters
      setFilteredData(currentNewsData);
    }

    if (filterOption === "sentiment") {
      // TO-DO: once sentiment tag created
    } else if (filterOption === "region") {
      // TO-DO: once region tag is created
    } else {
      if (filterOption.slice(0, 6) === "recent") {
        const now = new Date();

        // TO-DO: right now, all of the data is of today, so there will be no change visually-- test as more data comes in
        if (filterOption.slice(7) === "today") {
          newData = currentNewsData.filter(function (object) {
            return new Date(object.releaseDate) === now;
          });
        } else if (filterOption.slice(7) === "past month") {
          newData = currentNewsData.filter(function (object) {
            return new Date(object.releaseDate).getMonth() === now.getMonth();
          });
        } else if (filterOption.slice(7) === "past year") {
          newData = currentNewsData.filter(function (object) {
            return (
              new Date(object.releaseDate).getFullYear() === now.getFullYear()
            );
          });
        }
      } else if (filterOption.slice(0, 8) === "category") {
        newData = currentNewsData.filter(function (object) {
          return object.category === filterOption.slice(9);
        });
      }
    }

    setFilteredData(newData);
  };

  return (
    <div className="HomePage">
      {dataToDisplay && <NewsList newsData={dataToDisplay} />}
    </div>
  );
};

export default HomePage;

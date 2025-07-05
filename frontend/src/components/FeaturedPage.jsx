import FeaturedStockBanner from "./FeaturedStockBanner";
import FeaturedNews from "./FeaturedNews";
import { useState, useEffect } from "react";

const FeaturedPage = () => {
  const [featuredData, setFeaturedData] = useState(null);

  useEffect(() => {
    handleFeaturedNews();
  }, []);

  const handleFeaturedNews = () => {
    fetch(`http://localhost:3000/featured`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); // Parse JSON data from the response
      })
      .then((data) => {
        // parse data appropriately out of the individual jsons (current a series of jsons)
        let totalData = [];
        for (const output of data) {
          for (const news of output.featuredNews) {
            totalData.push(news);
          }
        }
        // sort the data so most recent important data is first
        totalData = totalData.sort((a, b) => {
          const aTime = new Date(a.releasedAt);
          const bTime = new Date(b.releasedAt);
          return bTime.getTime() - aTime.getTime();
        });
        setFeaturedData(totalData); // easier to parse to screen
      })
      .catch((error) => {
        console.error("Error fetching featured news:", error);
      });
  };

  return (
    <div className="featuredPage">
      <FeaturedStockBanner />
      {featuredData && <FeaturedNews featuredData={featuredData} />}
    </div>
  );
};

export default FeaturedPage;

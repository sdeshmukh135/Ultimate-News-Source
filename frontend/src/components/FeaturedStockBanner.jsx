import { useState, useEffect } from "react";
import "../styles/FeaturedPage.css";

const FeaturedStockBanner = () => {
  const [stocks, setStocks] = useState(null); // list, default to prevent against API restrictions

  useEffect(() => {
    handleStockData();
  }, []);

  const handleStockData = () => {
    fetch(`http://localhost:3000/stocks/add-stocks`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); // Parse JSON data from the response
      })
      .then((data) => {
        setStocks(data);
      })
      .catch((error) => {
        console.error("Error fetching stocks:", error);
      });
  };

  return (
    <div className="stock-banner">
      {stocks && (
        <div className="stocks-container">
          {stocks.map((stock) => {
            const classname = stock.isPositive ? "stockGain" : "stockLoss";
            return (
              <h3 className={classname}>
                {stock.name}: {parseFloat(stock.low).toFixed(2)} (
                {parseFloat(stock.diffPercent).toFixed(2)})
              </h3>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FeaturedStockBanner;

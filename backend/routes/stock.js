const express = require("express");
const router = express.Router();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const stockTypes = {
  // enum
  GOOGLE: "GOOG",
  AMAZON: "AMZN",
  APPLE: "AAPL",
  META: "META",
  MICROSOFT: "MSFT",
  NVIDIA: "NVDA",
  TESLA: "TSLA",
  BROADCOM: "AVGO",
};

// get the stocks present in the database
router.get("/", async (req, res) => {
  const stocks = await prisma.stock.findMany();

  res.status(201).json(stocks);
});

// add today's stocks to the database (replace previous entires)
router.get("/add-stocks", async (req, res) => {
  // before deleting, check to make sure that we really do need new data (don't want to unncessarily call the API)
  const oldStocks = await prisma.stock.findMany();
  const currentDay = new Date().toISOString().slice(0, 10);

  if (oldStocks.length != 0) {
    // if there are previous stocks
    if (oldStocks[0].date === currentDay) {
      return res.status(201).json(oldStocks); // break out of the function
    }
  }

  await prisma.stock.deleteMany(); // delete whatever was in the database to begin with to add the new data (if necessary)

  const apiKey = process.env.STOCK_API_KEY;
  const stockArr = [];
  for (const stock of Object.values(stockTypes)) {
    try {
      const response = await fetch(
        `https://api.twelvedata.com/time_series?symbol=${stock}&interval=1day&apikey=${apiKey}&source=docs`,
      );
      const data = await response.json();

      // process the response
      const low = data["values"][0].low;
      const difference =
        ((parseFloat(data["values"][0].close) -
          parseFloat(data["values"][0].open)) /
          parseFloat(data["values"][0].open)) *
        100; // for the percentage differnce
      const date = data["values"][0]["datetime"];
      const isPositive = difference >= 0 ? true : false; // whether or not there is a drop in the stock price
      const newStock = {
        date: date,
        name: stock,
        low: low,
        diffPercent: difference.toString(),
        isPositive: isPositive,
      };
      stockArr.push(newStock);
    } catch (error) {
      console.log("Error Fetching Stock Data");
    }
  }

  // add to prisma
  const newStocks = await prisma.stock.createMany({
    data: stockArr,
  });

  const stocks = await prisma.stock.findMany();

  res.status(201).json(stocks);
});

// delete stocks from stock schema (for testing purposes)
router.delete("/delete", async (req, res) => {
  await prisma.stock.deleteMany();
  res.status(201).json({ message: "Deleted Successfully" });
});

module.exports = router;

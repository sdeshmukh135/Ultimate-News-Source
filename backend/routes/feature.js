const express = require("express");
const router = express.Router();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const featuredNews = {
  // news that the user should always see
  SUPREME_COURT: "Supreme Court",
  ELECTION: "Election",
  HEALTH_POLICY: "Health Policy",
  ECONOMY: "Economy",
  EDUCATION: "Education",
  GLOBAL_CRISIS: "Global Crisis",
  STOCK: "Stock",
  SENATE: "Senate",
};

// add featured news (only allowed by admin user controlled in the frontend)
router.get("/", async (req, res) => {
  const records = await prisma.feature.findMany();
  if (records != 0) {
    // delete to prevent duplicate data
    await prisma.feature.deleteMany();
  }

  try {
    for (const keyword of Object.values(featuredNews)) {
      const specificNews = await prisma.news.findMany({
        where: {
          name: {
            contains: keyword,
          },
        },
      });
      if (specificNews.length != 0) {
        // there were articles present for this keyword

        await prisma.feature.create({
          data: {
            featuredNews: specificNews,
          },
        });
      }
    }

    const featured = await prisma.feature.findMany();

    res.status(201).json(featured);
  } catch (error) {
    res.status(500).json({ error: "Could not load featured news" });
  }
});

// delete all featured news (testing purposes)
router.delete("/delete", async (req, res) => {
  const deleted = await prisma.feature.deleteMany();
  res.status(201).json({ message: "Deleted Featured News Successfully" });
});

module.exports = router;

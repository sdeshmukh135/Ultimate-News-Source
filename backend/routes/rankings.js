const express = require("express");
const router = express.Router();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// get all rankings (sorted) --> testing purposes
router.get("/", async (req, res) => {
  const rankings = await prisma.ranking.findMany({
    where: {
      userId: req.session.userId,
    },
    orderBy: {
      ranking: "desc",
    },
  });

  res.status(200).json(rankings);
});

module.exports = router;

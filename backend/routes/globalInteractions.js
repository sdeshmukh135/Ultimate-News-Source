const express = require("express");
const router = express.Router();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// get the global interactions
router.get("/", async (req, res) => {
  const interactions = await prisma.globalInteraction.findMany();
  res.status(200).json(interactions);
});

// update existing global interactions with full publish date (testing purposes)
router.put("/update-date", async (req, res) => {
  const global = await prisma.globalInteraction.findMany();
  for (const interaction of global) {
    const article = await prisma.news.findFirst({
      where: { id: interaction.newsId },
    });

    const updatedInteraction = await prisma.globalInteraction.update({
      where: { id: interaction.id },
      data: {
        publishDate: article.releasedAt,
      },
    });
  }

  const updatedGlobal = await prisma.globalInteraction.findMany();

  res.status(200).json(updatedGlobal);
});

// delete global interactions (testing purposes)
router.delete("/delete", async (req, res) => {
  const deleted = await prisma.globalInteraction.deleteMany();
  res.status(200).json({ message: "Deleted Succesfully!" });
});

module.exports = router;

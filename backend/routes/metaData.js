const express = require("express");
const router = express.Router();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// get the metadata for a specific user (UI components)
router.get("/", async (req, res) => {
  try {
    const newNews = await prisma.userNewsMetaData.findMany({
      where: { userId: req.session.userId },
    });

    res.json(newNews);
  } catch (error) {
    res.status(500).send("Server Error");
  }
});

// generate metadata for all user-news (seeding purposes) --> will be automatically done in the future
router.post("/generate", async (req, res) => {
  const userNews = await prisma.userNewsCache.findMany({
    where: {
      userId: req.session.userId,
    },
  });

  for (const article of userNews) {
    await prisma.userNewsMetaData.create({
      data: {
        user: { connect: { id: req.session.userId } },
        news: { connect: { id: article.newsId } }, // news id
        bookmarked: false, // in the beginning
      },
    });
  }

  const newNews = await prisma.userNewsMetaData.findMany({
    where: { userId: req.session.userId },
  });

  res.json(newNews);
});

// update the metadata for a specific news (if present, if not, add to the metadata)
router.put("/:newsId/bookmarked", async (req, res) => {
  const { isBookmarked } = req.body;
  const newsid = parseInt(req.params.newsId);
  try {
    const article = await prisma.userNewsMetaData.findMany({
      where: { newsId: newsid },
    });
    if (article.length != 0) {
      // the metadata already exists so we are modifying an existing entry
      const updatedMetaData = await prisma.userNewsMetaData.update({
        where: { id: article[0].id },
        data: {
          bookmarked: isBookmarked,
        },
      });
    } else {
      // add a new entry to the metadata
      const updatedMetaData = await prisma.userNewsMetaData.create({
        data: {
          user: { connect: { id: req.session.userId } },
          news: { connect: { id: newsid } }, // news id
          bookmarked: isBookmarked,
        },
      });
    }

    const newNews = await prisma.userNewsMetaData.findMany({
      where: { userId: req.session.userId },
    });

    res.json(newNews);
  } catch (error) {
    res.status(500).json({ error: "Error updating metadata" });
  }
});

// delete exisiting metadata
router.delete("/delete", async (req, res) => {
  await prisma.userNewsMetaData.deleteMany();
  res.status(201).json({ message: "Deleted Successfully" });
});

module.exports = router;

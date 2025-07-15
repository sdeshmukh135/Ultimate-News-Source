const express = require("express");
const router = express.Router();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// enum
const WEIGHTS = {
  READ: 3,
  LIKED: 3,
  OPEN: 4,
};

// get all user interactions
router.get("/", async (req, res) => {
  const interactions = await prisma.userInteraction.findMany({
    where: { userId: req.session.userId },
  });

  res.json(interactions);
});

// add a user signal
router.post("/:newsId/:signal", async (req, res) => {
  // if an interaction with the article does not already exist, add a new UserInteraction
  const newsid = parseInt(req.params.newsId);
  const signal = req.params.signal;
  const { updatedSignal } = req.body; // only necessary for bookmarking (is boolean)
  let { opened, read, liked } = false; // to figure out which signal is being refered to
  if (signal === "open") {
    opened = true;
  } else if (signal === "read") {
    read = true;
  } else if (signal === "liked") {
    liked = true;
  }

  try {
    const userSignals = await prisma.userInteraction.findMany({
      where: {
        userId: req.session.userId,
        newsId: newsid,
      },
    });

    if (userSignals.length == 0) {
      // empty, no interactions on this article yet
      const addSignals = await prisma.userInteraction.create({
        data: {
          user: { connect: { id: req.session.userId } },
          news: { connect: { id: newsid } }, // news id
          openCount: opened ? 1 : 0, // 0 is default
          readCount: read ? 1 : 0,
          isLiked: liked ? Boolean(updatedSignal) : false, // false is default
        },
      });
    } else {
      if (opened) {
        const updateSignal = await prisma.userInteraction.update({
          where: {
            id: userSignals[0].id,
            userId: req.session.userId,
            newsId: newsid,
          },
          data: { openCount: userSignals[0].openCount + 1 },
        });
      } else if (read) {
        const updateSignal = await prisma.userInteraction.update({
          where: {
            id: userSignals[0].id,
            userId: req.session.userId,
            newsId: newsid,
          },
          data: { readCount: userSignals[0].readCount + 1 },
        });
      } else {
        const updateSignal = await prisma.userInteraction.update({
          where: {
            id: userSignals[0].id,
            userId: req.session.userId,
            newsId: newsid,
          },
          data: { isLiked: Boolean(updatedSignal) },
        });
      }
    }

    // return the list of interaction for the user
    const interactions = await prisma.userInteraction.findMany({
      where: { userId: req.session.userId },
    });

    res.status(201).json(interactions);
  } catch (error) {
    res.status(500).json({ error: "Error updating user signal" });
  }
});

// update scores --> update UserNewsCache according to change in score (schedule this)
router.put("/update-scores", async (req, res) => {
  // calculate engagament scores for the user-specific articles, update ONLY for the articles that have been engaged with
  const interactions = await prisma.userInteraction.findMany({
    where: { userId: req.session.userId },
  });

  try {
    for (const interaction of interactions) {
      // get article
      const article = await prisma.userNewsCache.findMany({
        where: { newsId: interaction.newsId },
      });

      const weightedLiked = interaction.isLiked ? WEIGHTS.LIKED : 1.0;
      const weightedOpen = interaction.openCount * WEIGHTS.OPEN; // 3 times whatever the number was
      const weightedRead = interaction.readCount * WEIGHTS.READ;

      const engagamentScore = weightedLiked + weightedOpen + weightedRead;

      await prisma.userNewsCache.update({
        where: { id: article[0].id },
        data: {
          score: engagamentScore,
        },
      });
    }

    const news = await prisma.userNewsCache.findMany({
      where: { userId: req.session.userId },
    });

    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({ error: "Unable to calculate engagement scores" });
  }
});

// delete current interactions (testing purposes)
router.delete("/delete", async (req, res) => {
  await prisma.userInteraction.deleteMany({
    where : {
      userId : req.session.userId,
    }
  });
  res.status(201).json({ message: "Deleted Successfully" });
});

module.exports = router;

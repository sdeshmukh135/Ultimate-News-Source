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

  // update global count
  const globalInteraction = await prisma.globalInteraction.findFirst({
    where: { newsId: newsid },
  });

  if (signal === "open") {
    opened = true;
  } else if (signal === "read") {
    read = true;
  } else if (signal === "liked") {
    liked = true;
  }

  try {
    const userSignals = await prisma.userInteraction.findFirst({
      where: {
        userId: req.session.userId,
        newsId: newsid,
      },
    });

    if (opened) {
      // for the time stamp on userNewsCache
      const article = await prisma.userNewsCache.findFirst({
        where: { newsId: newsid },
      });

      const updatedArticle = await prisma.userNewsCache.update({
        where: { id: article.id },
        data: {
          timeOpened: new Date(), // right now (most recent open)
        },
      });
    }

    if (!userSignals) {
      // empty, no interactions on this article yet
      const addSignals = await prisma.userInteraction.create({
        data: {
          user: { connect: { id: req.session.userId } },
          news: { connect: { id: newsid } }, // news id
          openCount: opened ? 1 : 0, // 0 is default
          readCount: read ? 1 : 0,
          isLiked: liked ? Boolean(updatedSignal) : false, // false is default
          voted: false, // default
        },
      });
    } else {
      const updateSignal = await prisma.userInteraction.update({
        where: {
          id: userSignals.id,
          userId: req.session.userId,
          newsId: newsid,
        },
        data: {
          openCount: opened ? userSignals.openCount + 1 : userSignals.openCount,
          readCount: read ? userSignals.readCount + 1 : userSignals.readCount,
          isLiked: liked ? Boolean(updatedSignal) : userSignals.isLiked,
        },
      });
    }

    // update global count (parallel to collecting user-based signals)
    const globalInteraction = await prisma.globalInteraction.findFirst({
      where: { newsId: newsid },
    });

    if (globalInteraction) {
      const updatedInteraction = await prisma.globalInteraction.update({
        // update the global interaction when there is a change interactions
        where: { id: globalInteraction.id },
        data: {
          openCount: opened
            ? globalInteraction.openCount + 1
            : globalInteraction.openCount,
          readCount: read
            ? globalInteraction.readCount + 1
            : globalInteraction.readCount,
          likedCount: liked
            ? globalInteraction.likedCount + 1
            : globalInteraction.likedCount,
        },
      });
    } else {
      const article = await prisma.news.findFirst({
        where: { id: newsid },
      });

      const newInteraction = await prisma.globalInteraction.create({
        // new interaction in general
        data: {
          // will add onto with more users
          news: { connect: { id: newsid } },
          openCount: opened ? 1 : 0,
          readCount: read ? 1 : 0,
          likedCount: liked ? 1 : 0,
          publishedDayOfWeek: article.releasedAt.getDay(),
          publishedTime: article.releasedAt.getHours(),
          score: 0.0, // default-- will add score later
        },
      });
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

// update exisiting interactions with whether a user voted (testing purposes)
router.put("/update-vote", async (req, res) => {
  const userNews = await prisma.userNewsCache.findMany({
    where: { userId: req.session.userId },
  });

  for (const article of userNews) {
    const interaction = await prisma.userInteraction.findFirst({
      where: {
        userId: req.session.userId,
        newsId: article.newsId,
      },
    });
    if (article.addTagInput) {
      // they did vote
      if (interaction) {
        // it exists
        const updatedInteraction = await prisma.userInteraction.update({
          where: {
            id: interaction.id,
          },
          data: {
            voted: true,
          },
        });
      } else {
        // does not have any other interaction with that article
        await prisma.userInteraction.create({
          data: {
            user: { connect: { id: req.session.userId } },
            news: { connect: { id: article.newsId } }, // news id
            openCount: 0, // 0 is default
            readCount: 0,
            isLiked: false, // false is default
            voted: true,
          },
        });
      }
    } else {
      // null from default addition into schema

      if (interaction) {
        // it exists
        const updatedInteraction = await prisma.userInteraction.update({
          where: {
            id: interaction.id,
          },
          data: {
            voted: false, // want false to be the default
          },
        });
      }
    }
  }

  const interactions = await prisma.userInteraction.findMany({
    where: { userId: req.session.userId },
  });

  res.status(200).json(interactions);
});

// delete current interactions (testing purposes)
router.delete("/delete", async (req, res) => {
  await prisma.userInteraction.deleteMany({
    where: {
      userId: req.session.userId,
    },
  });
  res.status(201).json({ message: "Deleted Successfully" });
});

module.exports = router;

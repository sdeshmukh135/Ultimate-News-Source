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


// update the metadata for a specific news (if present, if not, add to the metadata)
router.put("/:newsId/bookmarked", async (req, res) => {
    const {isBookmarked} = req.body;
    const newsid = parseInt(req.params.newsId);
    try {
        const article = await prisma.userNewsMetaData.findMany({
            where : {id : parseInt(newsid)},
        })

        if (article.length != 0) {
            // the metadata already exists so we are modifying an existing entry
            const updatedMetaData = await prisma.userNewsMetaData.update({
                where : {id : parseInt(newsid)},
                data : {
                    bookmarked : isBookmarked,
                },
            })
        } else {
            // add a new entry to the metadata
            const updatedMetaData = await prisma.userNewsMetaData.create({
                data : {
                    user: { connect: { id: req.session.userId } },
                    news: { connect: { id: newsid} }, // news id
                    bookmarked : isBookmarked,
                },
            })
        }
        res.json("updated successfully");
    } catch (error) {
        res.status(500).json({error : "Error updating metadata"})
    }
})

module.exports = router;
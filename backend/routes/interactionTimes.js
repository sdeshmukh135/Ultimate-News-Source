const express = require("express");
const router = express.Router();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// get all interaction times 
router.get("/", async (req, res) => {
    const times = await prisma.interactionTime.findMany();

    res.status(200).json(times);
})

// add an interaction time (testing purposes)
router.post("/add-time", async (req, res) => {
    try {
        const addTimes = await prisma.interactionTime.create({
        data: {
          news: { connect: { id: 3358 } }, // news id
          timeOpened: [new Date()], 
          timeRead:  [],
          timeBookmarked:  [], 
          timeAnnotated : [], // not tested here
          timeVoted : [], // not tested here
        },
      });
      
      const times = await prisma.interactionTime.findMany();
      res.status(200).json(times);
    } catch (error) {
        res.status(500).json({error : "unable to add interaction time"})
    }
})

module.exports = router
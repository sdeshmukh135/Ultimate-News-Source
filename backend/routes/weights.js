const express = require("express");
const router = express.Router();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// get all of the weights
router.get("/", async (req, res) => {
  const weights = await prisma.engagementWeight.findMany();

  res.status(200).json(weights);
});

// add weights
router.post("/add-weight", async (req, res) => {
  const { signal, weight } = req.body;

  const newEngagement = await prisma.engagementWeight.create({
    data: {
      signal: signal,
      weight: parseFloat(weight),
      updatedLast: new Date(),
    },
  });

  const weights = await prisma.engagementWeight.findMany();
  res.status(201).json(weights);
});

// update a weight (for dynamic control over the weights)
router.put("/:signal/update-weight", async (req, res) => {
  const signal = req.params.signal;
  const { weight } = req.body; // the update

  const updatedEngagement = await prisma.engagementWeight.update({
    where: { signal: signal },
    data: {
      weight: weight,
    },
  });

  const weights = await prisma.engagementWeight.findMany();
  res.status(201).json(weights);
});

module.exports = router;

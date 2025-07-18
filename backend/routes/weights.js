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
      user: { connect: { id: req.session.userId } },
    },
  });

  const weights = await prisma.engagementWeight.findMany();
  res.status(201).json(weights);
});

// update a weight (for dynamic control over the weights)
router.put("/:signal/update-weight", async (req, res) => {
  const signal = req.params.signal;
  const { weight } = req.body; // the update

  const original = await prisma.engagementWeight.findFirst({
    where: {
      signal: signal,
      userId: req.session.userId,
    },
  });

  const updatedEngagement = await prisma.engagementWeight.update({
    where: {
      id: original.id,
    },
    data: {
      weight: weight,
    },
  });

  const weights = await prisma.engagementWeight.findMany();
  res.status(201).json(weights);
});

// delete current weights (testing purposes)
router.delete("/delete", async (req, res) => {
  const deleted = await prisma.engagementWeight.deleteMany();

  res.json({ message: "Deleted Successfully" });
});

module.exports = router;

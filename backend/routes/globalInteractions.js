const express = require("express");
const router = express.Router();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// get the global interactions
router.get("/", async (req, res) => {
  const interactions = await prisma.globalInteraction.findMany();
  res.status(200).json(interactions);
});

// delete global interactions (testing purposes)
router.delete("/delete", async (req, res) => {
  const deleted = await prisma.globalInteraction.deleteMany();
  res.status(200).json({ message: "Deleted Succesfully!" });
});

module.exports = router;
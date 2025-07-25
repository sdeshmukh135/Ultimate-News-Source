const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// using transactional rollback- all changes to the database will be reverted

afterAll(async () => {
  await prisma.$disconnect();
});

module.exports = { prisma };

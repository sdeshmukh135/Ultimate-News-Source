/*
  Warnings:

  - You are about to drop the `Rankings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Rankings";

-- CreateTable
CREATE TABLE "Ranking" (
    "id" SERIAL NOT NULL,
    "rank" INTEGER NOT NULL,
    "newsId" INTEGER NOT NULL,

    CONSTRAINT "Ranking_pkey" PRIMARY KEY ("id")
);

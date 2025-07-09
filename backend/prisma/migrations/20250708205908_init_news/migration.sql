/*
  Warnings:

  - You are about to drop the column `userId` on the `News` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "News" DROP CONSTRAINT "News_userId_fkey";

-- AlterTable
ALTER TABLE "News" DROP COLUMN "userId";

-- CreateTable
CREATE TABLE "UserNewsCache" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "newsId" INTEGER NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "UserNewsCache_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserNewsCache" ADD CONSTRAINT "UserNewsCache_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserNewsCache" ADD CONSTRAINT "UserNewsCache_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES "News"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

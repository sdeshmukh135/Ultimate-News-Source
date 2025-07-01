/*
  Warnings:

  - You are about to drop the column `userId` on the `News` table. All the data in the column will be lost.
  - You are about to drop the `Article` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Article" DROP CONSTRAINT "Article_newsId_fkey";

-- DropForeignKey
ALTER TABLE "News" DROP CONSTRAINT "News_userId_fkey";

-- AlterTable
ALTER TABLE "News" DROP COLUMN "userId";

-- DropTable
DROP TABLE "Article";

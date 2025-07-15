/*
  Warnings:

  - You are about to drop the column `publishedDate` on the `GlobalInteraction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "GlobalInteraction" DROP COLUMN "publishedDate",
ADD COLUMN     "publishedDayOfWeek" TEXT,
ADD COLUMN     "publishedTime" TEXT;

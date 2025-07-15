/*
  Warnings:

  - Changed the type of `publishedTime` on the `GlobalInteraction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "GlobalInteraction" DROP COLUMN "publishedTime",
ADD COLUMN     "publishedTime" INTEGER NOT NULL;

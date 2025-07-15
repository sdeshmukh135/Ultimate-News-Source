/*
  Warnings:

  - Added the required column `likedCount` to the `GlobalInteraction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `publishedDate` to the `GlobalInteraction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `readCount` to the `GlobalInteraction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GlobalInteraction" ADD COLUMN     "likedCount" INTEGER NOT NULL,
ADD COLUMN     "publishedDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "readCount" INTEGER NOT NULL;

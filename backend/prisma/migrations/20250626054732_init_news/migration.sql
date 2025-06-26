/*
  Warnings:

  - Added the required column `articleURL` to the `News` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imageURL` to the `News` table without a default value. This is not possible if the table is not empty.
  - Added the required column `releaseDate` to the `News` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "News" ADD COLUMN     "articleURL" TEXT NOT NULL,
ADD COLUMN     "imageURL" TEXT NOT NULL,
ADD COLUMN     "releaseDate" TEXT NOT NULL;

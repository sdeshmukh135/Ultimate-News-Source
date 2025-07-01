/*
  Warnings:

  - Made the column `releasedAt` on table `News` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "News" ALTER COLUMN "releaseDate" DROP NOT NULL,
ALTER COLUMN "releasedAt" SET NOT NULL;

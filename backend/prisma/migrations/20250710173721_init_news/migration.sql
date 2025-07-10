/*
  Warnings:

  - Made the column `bookmarked` on table `UserNewsCache` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "UserNewsCache" ALTER COLUMN "bookmarked" SET NOT NULL;

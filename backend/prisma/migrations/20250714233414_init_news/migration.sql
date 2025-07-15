/*
  Warnings:

  - Made the column `publishedDayOfWeek` on table `GlobalInteraction` required. This step will fail if there are existing NULL values in that column.
  - Made the column `publishedTime` on table `GlobalInteraction` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "GlobalInteraction" ALTER COLUMN "publishedDayOfWeek" SET NOT NULL,
ALTER COLUMN "publishedTime" SET NOT NULL;

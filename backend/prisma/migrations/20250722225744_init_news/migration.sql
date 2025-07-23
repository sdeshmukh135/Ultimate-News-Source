/*
  Warnings:

  - The `timeBookmarked` column on the `InteractionTime` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "InteractionTime" DROP COLUMN "timeBookmarked",
ADD COLUMN     "timeBookmarked" TIMESTAMP(3)[];

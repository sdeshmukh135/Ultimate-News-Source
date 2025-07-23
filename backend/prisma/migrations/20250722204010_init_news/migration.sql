/*
  Warnings:

  - Changed the type of `timeBookmarked` on the `InteractionTime` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "GlobalInteraction" ADD COLUMN     "publishDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "InteractionTime" DROP COLUMN "timeBookmarked",
ADD COLUMN     "timeBookmarked" TIMESTAMP(3) NOT NULL;

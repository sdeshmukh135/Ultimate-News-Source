-- AlterTable
ALTER TABLE "News" ADD COLUMN     "leftCount" INTEGER,
ADD COLUMN     "rightCount" INTEGER,
ADD COLUMN     "sentiment" JSONB;

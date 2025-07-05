/*
  Warnings:

  - You are about to drop the column `featureId` on the `News` table. All the data in the column will be lost.
  - Added the required column `featuredNews` to the `Feature` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "News" DROP CONSTRAINT "News_featureId_fkey";

-- AlterTable
ALTER TABLE "Feature" ADD COLUMN     "featuredNews" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "News" DROP COLUMN "featureId";

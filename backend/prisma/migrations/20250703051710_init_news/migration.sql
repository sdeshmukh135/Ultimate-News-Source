/*
  Warnings:

  - You are about to drop the column `jsonResponse` on the `Stock` table. All the data in the column will be lost.
  - Added the required column `diffPercent` to the `Stock` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isPositive` to the `Stock` table without a default value. This is not possible if the table is not empty.
  - Added the required column `low` to the `Stock` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Stock" DROP COLUMN "jsonResponse",
ADD COLUMN     "diffPercent" TEXT NOT NULL,
ADD COLUMN     "isPositive" BOOLEAN NOT NULL,
ADD COLUMN     "low" TEXT NOT NULL;

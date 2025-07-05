/*
  Warnings:

  - Added the required column `lastUpdated` to the `Stock` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Stock" ADD COLUMN     "lastUpdated" TEXT NOT NULL;

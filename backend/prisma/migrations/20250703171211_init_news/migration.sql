/*
  Warnings:

  - Added the required column `date` to the `Stock` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Stock" ADD COLUMN     "date" TEXT NOT NULL;

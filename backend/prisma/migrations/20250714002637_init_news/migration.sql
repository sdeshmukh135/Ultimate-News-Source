/*
  Warnings:

  - Added the required column `addTagInput` to the `UserNewsCache` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserNewsCache" ADD COLUMN     "addTagInput" BOOLEAN NOT NULL;

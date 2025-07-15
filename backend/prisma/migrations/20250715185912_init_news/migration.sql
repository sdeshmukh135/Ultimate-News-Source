/*
  Warnings:

  - Added the required column `score` to the `GlobalInteraction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GlobalInteraction" ADD COLUMN     "score" DOUBLE PRECISION NOT NULL;

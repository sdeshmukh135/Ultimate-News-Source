/*
  Warnings:

  - You are about to drop the `UserNewsMetaData` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserNewsMetaData" DROP CONSTRAINT "UserNewsMetaData_newsId_fkey";

-- DropForeignKey
ALTER TABLE "UserNewsMetaData" DROP CONSTRAINT "UserNewsMetaData_userId_fkey";

-- DropTable
DROP TABLE "UserNewsMetaData";

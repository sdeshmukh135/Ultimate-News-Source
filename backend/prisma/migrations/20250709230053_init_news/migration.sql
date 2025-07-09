/*
  Warnings:

  - You are about to drop the column `isOpened` on the `UserInteraction` table. All the data in the column will be lost.
  - You are about to drop the column `isRead` on the `UserInteraction` table. All the data in the column will be lost.
  - Added the required column `openCount` to the `UserInteraction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `readCount` to the `UserInteraction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserInteraction" DROP COLUMN "isOpened",
DROP COLUMN "isRead",
ADD COLUMN     "openCount" INTEGER NOT NULL,
ADD COLUMN     "readCount" INTEGER NOT NULL;

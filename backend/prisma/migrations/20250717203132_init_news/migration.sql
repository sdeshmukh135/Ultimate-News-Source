/*
  Warnings:

  - Added the required column `userId` to the `EngagementWeight` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EngagementWeight" ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "UserNewsCache" ADD COLUMN     "canvasData" JSONB;

-- AddForeignKey
ALTER TABLE "EngagementWeight" ADD CONSTRAINT "EngagementWeight_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

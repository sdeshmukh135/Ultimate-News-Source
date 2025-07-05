/*
  Warnings:

  - A unique constraint covering the columns `[featuredNews]` on the table `Feature` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Feature_featuredNews_key" ON "Feature"("featuredNews");

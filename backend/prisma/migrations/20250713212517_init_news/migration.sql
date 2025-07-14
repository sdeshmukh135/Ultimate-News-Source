-- CreateTable
CREATE TABLE "Tag" (
    "id" SERIAL NOT NULL,
    "leftCount" INTEGER NOT NULL,
    "rightCount" INTEGER NOT NULL,
    "sentimentScore" DOUBLE PRECISION NOT NULL,
    "newsId" INTEGER NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES "News"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

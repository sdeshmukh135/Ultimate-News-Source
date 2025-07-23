-- CreateTable
CREATE TABLE "InteractionTime" (
    "id" SERIAL NOT NULL,
    "timeOpened" TIMESTAMP(3)[],
    "timeVoted" TIMESTAMP(3)[],
    "timeBookmarked" TIMESTAMP(3)[],
    "timeAnnotated" TIMESTAMP(3)[],
    "newsId" INTEGER NOT NULL,

    CONSTRAINT "InteractionTime_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "InteractionTime" ADD CONSTRAINT "InteractionTime_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES "News"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

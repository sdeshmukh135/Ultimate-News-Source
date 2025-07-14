-- CreateTable
CREATE TABLE "GlobalInteraction" (
    "id" SERIAL NOT NULL,
    "openCount" INTEGER NOT NULL,
    "newsId" INTEGER NOT NULL,

    CONSTRAINT "GlobalInteraction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GlobalInteraction" ADD CONSTRAINT "GlobalInteraction_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES "News"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

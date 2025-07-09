-- CreateTable
CREATE TABLE "UserNewsMetaData" (
    "id" SERIAL NOT NULL,
    "bookmarked" BOOLEAN NOT NULL,
    "userId" INTEGER NOT NULL,
    "newsId" INTEGER NOT NULL,

    CONSTRAINT "UserNewsMetaData_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserNewsMetaData" ADD CONSTRAINT "UserNewsMetaData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserNewsMetaData" ADD CONSTRAINT "UserNewsMetaData_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES "News"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

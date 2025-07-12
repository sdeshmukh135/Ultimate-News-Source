-- CreateTable
CREATE TABLE "Rankings" (
    "id" SERIAL NOT NULL,
    "rank" INTEGER NOT NULL,
    "newsId" INTEGER NOT NULL,

    CONSTRAINT "Rankings_pkey" PRIMARY KEY ("id")
);

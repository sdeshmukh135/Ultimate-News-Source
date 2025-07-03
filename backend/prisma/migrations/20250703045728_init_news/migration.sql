-- CreateTable
CREATE TABLE "Stock" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "jsonResponse" JSONB NOT NULL,

    CONSTRAINT "Stock_pkey" PRIMARY KEY ("id")
);

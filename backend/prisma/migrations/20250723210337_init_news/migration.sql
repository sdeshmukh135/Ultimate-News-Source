-- CreateTable
CREATE TABLE "OnlineTime" (
    "id" SERIAL NOT NULL,
    "interval" TEXT NOT NULL,
    "count" INTEGER NOT NULL,

    CONSTRAINT "OnlineTime_pkey" PRIMARY KEY ("id")
);

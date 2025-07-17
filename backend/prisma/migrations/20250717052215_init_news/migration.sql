-- CreateTable
CREATE TABLE "EngagementWeight" (
    "id" SERIAL NOT NULL,
    "signal" TEXT NOT NULL,
    "weight" INTEGER NOT NULL,
    "updatedLast" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EngagementWeight_pkey" PRIMARY KEY ("id")
);

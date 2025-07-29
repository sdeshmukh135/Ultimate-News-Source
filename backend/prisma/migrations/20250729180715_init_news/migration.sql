-- CreateTable
CREATE TABLE "FactEvidence" (
    "id" SERIAL NOT NULL,
    "claim" TEXT NOT NULL,
    "reviewer" TEXT NOT NULL,
    "review" TEXT NOT NULL,
    "reviewDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FactEvidence_pkey" PRIMARY KEY ("id")
);

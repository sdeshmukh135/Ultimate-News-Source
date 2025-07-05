-- AlterTable
ALTER TABLE "News" ADD COLUMN     "featureId" INTEGER;

-- CreateTable
CREATE TABLE "Feature" (
    "id" SERIAL NOT NULL,
    "adminId" INTEGER NOT NULL,

    CONSTRAINT "Feature_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "News" ADD CONSTRAINT "News_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "Feature"("id") ON DELETE SET NULL ON UPDATE CASCADE;

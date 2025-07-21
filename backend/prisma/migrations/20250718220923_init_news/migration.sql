-- AlterTable
ALTER TABLE "User" ADD COLUMN     "timesOnline" JSONB;

-- AlterTable
ALTER TABLE "UserNewsCache" ADD COLUMN     "timeOpened" TIMESTAMP(3);

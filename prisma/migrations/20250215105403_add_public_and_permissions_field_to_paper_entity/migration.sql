-- AlterTable
ALTER TABLE "paper" ADD COLUMN     "permissions" JSONB,
ADD COLUMN     "public" BOOLEAN NOT NULL DEFAULT false;

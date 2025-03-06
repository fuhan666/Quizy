/*
  Warnings:

  - The `status` column on the `ai_record` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ai_record_status" AS ENUM ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED');

-- AlterTable
ALTER TABLE "ai_record" DROP COLUMN "status",
ADD COLUMN     "status" "ai_record_status" NOT NULL DEFAULT 'PENDING';

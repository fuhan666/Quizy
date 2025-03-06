/*
  Warnings:

  - You are about to drop the `AiRecordEntity` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AiRecordEntity" DROP CONSTRAINT "AiRecordEntity_file_id_fkey";

-- DropForeignKey
ALTER TABLE "AiRecordEntity" DROP CONSTRAINT "AiRecordEntity_user_id_fkey";

-- DropTable
DROP TABLE "AiRecordEntity";

-- CreateTable
CREATE TABLE "ai_record" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "service_name" TEXT NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "file_id" INTEGER,
    "request_body" JSONB,
    "result" JSONB,
    "tokens" INTEGER,
    "error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_record_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ai_record" ADD CONSTRAINT "ai_record_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_record" ADD CONSTRAINT "ai_record_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "upload_file"("id") ON DELETE SET NULL ON UPDATE CASCADE;

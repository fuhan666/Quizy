-- CreateTable
CREATE TABLE "AiRecordEntity" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "service_name" TEXT NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "file_id" INTEGER,
    "request_body" JSONB,
    "result" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiRecordEntity_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AiRecordEntity" ADD CONSTRAINT "AiRecordEntity_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiRecordEntity" ADD CONSTRAINT "AiRecordEntity_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "upload_file"("id") ON DELETE SET NULL ON UPDATE CASCADE;

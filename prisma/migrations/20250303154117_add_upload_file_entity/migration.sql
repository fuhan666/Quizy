-- CreateTable
CREATE TABLE "upload_file" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "file" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_type" VARCHAR NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "upload_file_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "upload_file" ADD CONSTRAINT "upload_file_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

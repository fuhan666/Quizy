-- CreateTable
CREATE TABLE "answer_sheet" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "correct_answers" JSONB NOT NULL,
    "answers" JSONB,
    "start_time" TIMESTAMP(3) NOT NULL,
    "finish_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "answer_sheet_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "answer_sheet" ADD CONSTRAINT "answer_sheet_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

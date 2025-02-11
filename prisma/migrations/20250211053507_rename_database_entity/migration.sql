/*
  Warnings:

  - You are about to drop the `answers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `papers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `questions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "answers" DROP CONSTRAINT "answers_question_id_fkey";

-- DropForeignKey
ALTER TABLE "papers" DROP CONSTRAINT "papers_user_id_fkey";

-- DropForeignKey
ALTER TABLE "questions" DROP CONSTRAINT "questions_user_id_fkey";

-- DropTable
DROP TABLE "answers";

-- DropTable
DROP TABLE "papers";

-- DropTable
DROP TABLE "questions";

-- CreateTable
CREATE TABLE "question" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "question_text" TEXT NOT NULL,
    "difficulty" SMALLINT DEFAULT 1,
    "status" SMALLINT NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "answer" (
    "id" SERIAL NOT NULL,
    "question_id" INTEGER NOT NULL,
    "answer_text" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paper" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "qas" JSONB NOT NULL,

    CONSTRAINT "paper_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "question" ADD CONSTRAINT "question_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answer" ADD CONSTRAINT "answer_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paper" ADD CONSTRAINT "paper_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

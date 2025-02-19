/*
  Warnings:

  - You are about to drop the `answer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `answer_sheet` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `paper` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `question` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "answer" DROP CONSTRAINT "answer_question_id_fkey";

-- DropForeignKey
ALTER TABLE "answer_sheet" DROP CONSTRAINT "answer_sheet_user_id_fkey";

-- DropForeignKey
ALTER TABLE "paper" DROP CONSTRAINT "paper_user_id_fkey";

-- DropForeignKey
ALTER TABLE "question" DROP CONSTRAINT "question_user_id_fkey";

-- DropTable
DROP TABLE "answer";

-- DropTable
DROP TABLE "answer_sheet";

-- DropTable
DROP TABLE "paper";

-- DropTable
DROP TABLE "question";

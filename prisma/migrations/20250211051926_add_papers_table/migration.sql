/*
  Warnings:

  - You are about to drop the column `user_id` on the `answers` table. All the data in the column will be lost.
  - You are about to drop the column `question_type` on the `questions` table. All the data in the column will be lost.
  - You are about to alter the column `difficulty` on the `questions` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `SmallInt`.
  - You are about to drop the `category` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `question_id` to the `answers` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "answers" DROP CONSTRAINT "answers_user_id_fkey";

-- DropForeignKey
ALTER TABLE "category" DROP CONSTRAINT "category_user_id_fkey";

-- DropIndex
DROP INDEX "answers_id_key";

-- DropIndex
DROP INDEX "questions_id_key";

-- DropIndex
DROP INDEX "user_id_key";

-- AlterTable
ALTER TABLE "answers" DROP COLUMN "user_id",
ADD COLUMN     "question_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "questions" DROP COLUMN "question_type",
ADD COLUMN     "status" SMALLINT NOT NULL DEFAULT 1,
ALTER COLUMN "difficulty" SET DATA TYPE SMALLINT;

-- DropTable
DROP TABLE "category";

-- DropEnum
DROP TYPE "questionType";

-- CreateTable
CREATE TABLE "papers" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "qas" JSONB NOT NULL,

    CONSTRAINT "papers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "answers" ADD CONSTRAINT "answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "papers" ADD CONSTRAINT "papers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

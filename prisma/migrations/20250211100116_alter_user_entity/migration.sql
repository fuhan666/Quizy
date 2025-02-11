/*
  Warnings:

  - A unique constraint covering the columns `[user_name]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `password` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user" ADD COLUMN     "password" TEXT NOT NULL,
ALTER COLUMN "nick_name" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "user_user_name_key" ON "user"("user_name");

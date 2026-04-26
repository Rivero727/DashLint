/*
  Warnings:

  - A unique constraint covering the columns `[user_number]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "user" ADD COLUMN     "user_number" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "user_user_number_key" ON "user"("user_number");

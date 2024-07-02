/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Conversation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Conversation" DROP COLUMN "createdAt",
ADD COLUMN     "updatedAt" INTEGER NOT NULL DEFAULT 0;

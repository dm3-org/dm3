/*
  Warnings:

  - Added the required column `conversationId` to the `EncryptedMessage` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "EncryptedMessage" DROP CONSTRAINT "EncryptedMessage_encryptedContactName_fkey";

-- AlterTable
ALTER TABLE "EncryptedMessage" ADD COLUMN     "conversationId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "EncryptedMessage" ADD CONSTRAINT "EncryptedMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

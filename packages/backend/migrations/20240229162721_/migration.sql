/*
  Warnings:

  - You are about to drop the column `conversationId` on the `EncryptedMessage` table. All the data in the column will be lost.
  - Added the required column `encryptedContactName` to the `EncryptedMessage` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "EncryptedMessage" DROP CONSTRAINT "EncryptedMessage_conversationId_fkey";

-- AlterTable
ALTER TABLE "EncryptedMessage" DROP COLUMN "conversationId",
ADD COLUMN     "encryptedContactName" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "EncryptedMessage" ADD CONSTRAINT "EncryptedMessage_encryptedContactName_fkey" FOREIGN KEY ("encryptedContactName") REFERENCES "Conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

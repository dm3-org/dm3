/*
  Warnings:

  - The primary key for the `Conversation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `encryptedId` on the `Conversation` table. All the data in the column will be lost.
  - Added the required column `encryptedContactName` to the `Conversation` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `Conversation` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "EncryptedMessage" DROP CONSTRAINT "EncryptedMessage_conversationId_fkey";

-- AlterTable
ALTER TABLE "Conversation" DROP CONSTRAINT "Conversation_pkey",
DROP COLUMN "encryptedId",
ADD COLUMN     "encryptedContactName" TEXT NOT NULL,
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "EncryptedMessage" ADD CONSTRAINT "EncryptedMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - The primary key for the `Conversation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `messageId` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the `Message` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `accountId` to the `Conversation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `encryptedId` to the `Conversation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_conversationId_fkey";

-- AlterTable
ALTER TABLE "Conversation" DROP CONSTRAINT "Conversation_pkey",
DROP COLUMN "id",
DROP COLUMN "messageId",
ADD COLUMN     "accountId" TEXT NOT NULL,
ADD COLUMN     "encryptedId" TEXT NOT NULL,
ADD CONSTRAINT "Conversation_pkey" PRIMARY KEY ("encryptedId");

-- DropTable
DROP TABLE "Message";

-- CreateTable
CREATE TABLE "EncryptedMessage" (
    "id" TEXT NOT NULL,
    "encryptedEnvelopContainer" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,

    CONSTRAINT "EncryptedMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EncryptedMessage" ADD CONSTRAINT "EncryptedMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("encryptedId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

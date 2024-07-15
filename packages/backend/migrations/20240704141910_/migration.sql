/*
  Warnings:

  - You are about to drop the `HaltedMessage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "HaltedMessage" DROP CONSTRAINT "HaltedMessage_ownerId_fkey";

-- AlterTable
ALTER TABLE "EncryptedMessage" ADD COLUMN     "isHalted" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "HaltedMessage";

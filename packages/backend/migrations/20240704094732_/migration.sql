/*
  Warnings:

  - You are about to drop the column `encryptedContactName` on the `HaltedMessage` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "HaltedMessage" DROP COLUMN "encryptedContactName";

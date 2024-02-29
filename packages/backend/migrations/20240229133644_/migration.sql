/*
  Warnings:

  - Added the required column `ownerId` to the `EncryptedMessage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EncryptedMessage" ADD COLUMN     "ownerId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "EncryptedMessage" ADD CONSTRAINT "EncryptedMessage_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

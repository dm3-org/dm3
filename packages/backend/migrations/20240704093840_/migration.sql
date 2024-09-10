-- CreateTable
CREATE TABLE "HaltedMessage" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "encryptedEnvelopContainer" TEXT NOT NULL,
    "encryptedContactName" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "HaltedMessage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "HaltedMessage" ADD CONSTRAINT "HaltedMessage_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

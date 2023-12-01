/*
  Warnings:

  - The primary key for the `ProfileContainer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `id` on the `ProfileContainer` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "ProfileContainer" DROP CONSTRAINT "ProfileContainer_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "ProfileContainer_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "Alias" (
    "id" UUID NOT NULL,
    "profileContainerId" UUID NOT NULL,
    "alias" TEXT NOT NULL,

    CONSTRAINT "Alias_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Alias_profileContainerId_key" ON "Alias"("profileContainerId");

-- CreateIndex
CREATE UNIQUE INDEX "Alias_alias_key" ON "Alias"("alias");

-- AddForeignKey
ALTER TABLE "Alias" ADD CONSTRAINT "Alias_profileContainerId_fkey" FOREIGN KEY ("profileContainerId") REFERENCES "ProfileContainer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

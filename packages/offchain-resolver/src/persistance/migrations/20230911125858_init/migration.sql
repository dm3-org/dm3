/*
  Warnings:

  - The primary key for the `ProfileContainer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `ProfileContainer` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `Alias` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Alias" DROP CONSTRAINT "Alias_profileContainerId_fkey";

-- AlterTable
ALTER TABLE "ProfileContainer" DROP CONSTRAINT "ProfileContainer_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "ProfileContainer_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "Alias";

/*
  Warnings:

  - You are about to drop the column `createdById` on the `ShoppingList` table. All the data in the column will be lost.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `User` table. All the data in the column will be lost.
  - Added the required column `createdByEmail` to the `ShoppingList` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ShoppingList" DROP CONSTRAINT "ShoppingList_createdById_fkey";

-- AlterTable
ALTER TABLE "ShoppingList" DROP COLUMN "createdById",
ADD COLUMN     "createdByEmail" VARCHAR(1000) NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("email");

-- AddForeignKey
ALTER TABLE "ShoppingList" ADD CONSTRAINT "ShoppingList_createdByEmail_fkey" FOREIGN KEY ("createdByEmail") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the column `createdByEmail` on the `ShoppingList` table. All the data in the column will be lost.
  - Added the required column `createdById` to the `ShoppingList` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ShoppingList" DROP CONSTRAINT "ShoppingList_createdByEmail_fkey";

-- AlterTable
ALTER TABLE "ShoppingList" DROP COLUMN "createdByEmail",
ADD COLUMN     "createdById" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "ShoppingList" ADD CONSTRAINT "ShoppingList_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

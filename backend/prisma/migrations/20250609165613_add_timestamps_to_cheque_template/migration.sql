/*
  Warnings:

  - You are about to drop the column `name` on the `ChequeTemplate` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[bankId]` on the table `ChequeTemplate` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ChequeTemplate" DROP COLUMN "name",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "ChequeTemplate_bankId_key" ON "ChequeTemplate"("bankId");

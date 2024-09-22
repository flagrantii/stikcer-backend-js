/*
  Warnings:

  - A unique constraint covering the columns `[productId]` on the table `File` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "File_productId_key" ON "File"("productId");

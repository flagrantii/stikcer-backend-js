/*
  Warnings:

  - Added the required column `channel` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currencyCode` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerEmail` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lang` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productDetail` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "channel" TEXT NOT NULL,
ADD COLUMN     "currencyCode" TEXT NOT NULL,
ADD COLUMN     "customerEmail" TEXT NOT NULL,
ADD COLUMN     "lang" TEXT NOT NULL,
ADD COLUMN     "productDetail" TEXT NOT NULL,
ADD COLUMN     "total" DOUBLE PRECISION NOT NULL;

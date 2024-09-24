/*
  Warnings:

  - You are about to drop the column `amount` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `channel` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `currencyCode` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `customerEmail` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `lang` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `merchantId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `paymentMethod` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `productDetail` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `total` on the `Payment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "amount",
DROP COLUMN "channel",
DROP COLUMN "currency",
DROP COLUMN "currencyCode",
DROP COLUMN "customerEmail",
DROP COLUMN "lang",
DROP COLUMN "merchantId",
DROP COLUMN "paymentMethod",
DROP COLUMN "productDetail",
DROP COLUMN "status",
DROP COLUMN "total";

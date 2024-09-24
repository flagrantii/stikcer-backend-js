/*
  Warnings:

  - You are about to drop the column `paymentIntent` on the `Payment` table. All the data in the column will be lost.
  - Added the required column `channel` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currencyCode` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerEmail` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `Payment` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `lang` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `merchantId` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentMethod` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productDetail` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `refNo` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "paymentIntent",
ADD COLUMN     "channel" TEXT NOT NULL,
ADD COLUMN     "currencyCode" TEXT NOT NULL,
ADD COLUMN     "customerEmail" TEXT NOT NULL,
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "lang" TEXT NOT NULL,
ADD COLUMN     "merchantId" TEXT NOT NULL,
ADD COLUMN     "paymentMethod" TEXT NOT NULL,
ADD COLUMN     "productDetail" TEXT NOT NULL,
ADD COLUMN     "refNo" TEXT NOT NULL,
ADD COLUMN     "total" DOUBLE PRECISION NOT NULL,
ADD CONSTRAINT "Payment_pkey" PRIMARY KEY ("id");

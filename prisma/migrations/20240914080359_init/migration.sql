/*
  Warnings:

  - You are about to drop the column `amount` on the `Cart` table. All the data in the column will be lost.
  - You are about to drop the column `amountA3plus` on the `Cart` table. All the data in the column will be lost.
  - You are about to drop the column `subTotal` on the `Cart` table. All the data in the column will be lost.
  - The primary key for the `Order` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `OrderLine` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `amount` on the `OrderLine` table. All the data in the column will be lost.
  - You are about to drop the column `amountA3plus` on the `OrderLine` table. All the data in the column will be lost.
  - You are about to drop the column `subTotal` on the `OrderLine` table. All the data in the column will be lost.
  - You are about to drop the column `roleId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Role` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `paymentId` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shippingMethod` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `orderId` on the `OrderLine` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `orderId` on the `Payment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `amount` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amountA3plus` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subTotal` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "OrderLine" DROP CONSTRAINT "OrderLine_orderId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_orderId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_roleId_fkey";

-- AlterTable
ALTER TABLE "Cart" DROP COLUMN "amount",
DROP COLUMN "amountA3plus",
DROP COLUMN "subTotal";

-- AlterTable
ALTER TABLE "Order" DROP CONSTRAINT "Order_pkey",
ADD COLUMN     "paymentId" INTEGER NOT NULL,
ADD COLUMN     "shippingMethod" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Order_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "OrderLine" DROP CONSTRAINT "OrderLine_pkey",
DROP COLUMN "amount",
DROP COLUMN "amountA3plus",
DROP COLUMN "subTotal",
DROP COLUMN "orderId",
ADD COLUMN     "orderId" INTEGER NOT NULL,
ADD CONSTRAINT "OrderLine_pkey" PRIMARY KEY ("orderId", "productId");

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "orderId",
ADD COLUMN     "orderId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "amount" INTEGER NOT NULL,
ADD COLUMN     "amountA3plus" INTEGER NOT NULL,
ADD COLUMN     "subTotal" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "roleId";

-- DropTable
DROP TABLE "Role";

-- CreateIndex
CREATE UNIQUE INDEX "OrderLine_orderId_productId_key" ON "OrderLine"("orderId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_orderId_key" ON "Payment"("orderId");

-- AddForeignKey
ALTER TABLE "OrderLine" ADD CONSTRAINT "OrderLine_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

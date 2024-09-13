/*
  Warnings:

  - The primary key for the `Address` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `quantity` on the `Cart` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `OrderLine` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `Product` table. All the data in the column will be lost.
  - Added the required column `addressType` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amount` to the `Cart` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amountA3plus` to the `Cart` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subTotal` to the `Cart` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderSubTotal` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shippingFee` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amount` to the `OrderLine` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amountA3plus` to the `OrderLine` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subTotal` to the `OrderLine` table without a default value. This is not possible if the table is not empty.
  - Added the required column `inkColor` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `material` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `note` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `parcelColor` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `printingSide` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shape` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Address" DROP CONSTRAINT "Address_pkey",
ADD COLUMN     "addressType" TEXT NOT NULL,
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Address_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Cart" DROP COLUMN "quantity",
ADD COLUMN     "amount" INTEGER NOT NULL,
ADD COLUMN     "amountA3plus" INTEGER NOT NULL,
ADD COLUMN     "subTotal" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "orderSubTotal" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "shippingFee" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "OrderLine" DROP COLUMN "quantity",
ADD COLUMN     "amount" INTEGER NOT NULL,
ADD COLUMN     "amountA3plus" INTEGER NOT NULL,
ADD COLUMN     "subTotal" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "quantity",
ADD COLUMN     "inkColor" TEXT NOT NULL,
ADD COLUMN     "material" TEXT NOT NULL,
ADD COLUMN     "note" TEXT NOT NULL,
ADD COLUMN     "parcelColor" TEXT NOT NULL,
ADD COLUMN     "printingSide" TEXT NOT NULL,
ADD COLUMN     "shape" TEXT NOT NULL,
ADD COLUMN     "size" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "File" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "isPurchased" BOOLEAN NOT NULL,
    "deleteAt" TIMESTAMP(3) NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

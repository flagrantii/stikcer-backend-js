/*
  Warnings:

  - You are about to drop the column `addressType` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `houseNumber` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `street` on the `Address` table. All the data in the column will be lost.
  - Added the required column `address` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `province` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reciverName` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subDistrict` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taxPayerId` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taxPayerName` to the `Address` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Address" DROP COLUMN "addressType",
DROP COLUMN "city",
DROP COLUMN "houseNumber",
DROP COLUMN "street",
ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "province" TEXT NOT NULL,
ADD COLUMN     "reciverName" TEXT NOT NULL,
ADD COLUMN     "subDistrict" TEXT NOT NULL,
ADD COLUMN     "taxPayerId" TEXT NOT NULL,
ADD COLUMN     "taxPayerName" TEXT NOT NULL;

/*
  Warnings:

  - Changed the type of `inkColor` on the `Product` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `parcelColor` on the `Product` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "inkColor",
ADD COLUMN     "inkColor" JSONB NOT NULL,
DROP COLUMN "parcelColor",
ADD COLUMN     "parcelColor" JSONB NOT NULL;

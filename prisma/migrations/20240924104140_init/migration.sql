-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('AWAITING_PAYMENT', 'PAYMENT_ACCEPTED', 'PROCESSING', 'AWAITING_SHIPMENT', 'SHIPPED', 'COMPLETED', 'CANCELLED', 'EXPIRED');

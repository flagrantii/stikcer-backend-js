import { IsNotEmpty, IsPositive, IsString, IsNumber, IsEnum } from 'class-validator';
import { CreateOrderLineDto } from './create-orderLine.dto';
import { OrderStatus } from '@prisma/client';

export class CreateOrderDto {
  id: string;
  userId: string;

  @IsNotEmpty()
  items: CreateOrderLineDto[];

  @IsNotEmpty()
  @IsPositive()
  shippingFee: number;

  @IsNotEmpty()
  @IsString()
  shippingMethod: string;

  @IsNotEmpty()
  @IsString()
  paymentId: string;

  @IsNotEmpty()
  @IsNumber()
  orderSubTotal: number;

  @IsNotEmpty()
  @IsEnum(OrderStatus)
  status: OrderStatus;
}

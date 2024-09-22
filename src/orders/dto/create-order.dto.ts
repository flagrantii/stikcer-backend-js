import { IsNotEmpty, IsPositive, IsString } from 'class-validator';
import { CreateOrderLineDto } from './create-orderLine.dto';

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
  status: string = 'pending';
}

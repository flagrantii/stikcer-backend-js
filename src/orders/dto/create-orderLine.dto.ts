import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateOrderLineDto {
  orderId: number;

  @IsNumber()
  @IsNotEmpty()
  readonly productId: number;
}

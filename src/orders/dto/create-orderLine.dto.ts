import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateOrderLineDto {
  orderId: string;

  @IsNumber()
  @IsNotEmpty()
  readonly productId: string;
}

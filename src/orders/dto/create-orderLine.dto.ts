import { IsNotEmpty, IsNumber, IsPositive } from "class-validator";

export class CreateOrderLineDto {
    orderId: string

    @IsNumber()
    @IsNotEmpty()
    readonly productId: number

    @IsNumber()
    @IsNotEmpty()
    @IsPositive()
    readonly amount: number

    @IsNumber()
    @IsNotEmpty()
    @IsPositive()
    readonly amountA3plus: number

    @IsNumber()
    @IsNotEmpty()
    @IsPositive()
    readonly subTotal: number
}
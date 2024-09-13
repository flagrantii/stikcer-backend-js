import { IsNotEmpty, IsNumber, IsPositive } from "class-validator"

export class CreateCartDto {
    userId: number

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

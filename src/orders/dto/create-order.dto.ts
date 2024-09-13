import { IsNotEmpty, IsNumber, IsPositive, IsString, IsUUID } from "class-validator";

export class CreateOrderDto {
    id: string
    
    @IsNumber()
    @IsNotEmpty()
    readonly userId: number

    @IsNotEmpty()
    @IsPositive()
    readonly orderSubTotal: string

    @IsNotEmpty()
    @IsPositive()
    readonly shippingFee: string
}

import { IsNotEmpty, IsNumber, IsPositive, IsString } from "class-validator"
import { CreateOrderLineDto } from "./create-orderLine.dto"

export class CreateOrderDataDto {
    id: number
    userId: number

    @IsNotEmpty()
    items: CreateOrderLineDto[]

    @IsNotEmpty()
    @IsPositive()
    shippingFee: number

    @IsNotEmpty()
    @IsString()
    shippingMethod: string

    @IsNotEmpty()
    @IsString()
    paymentId: number
}

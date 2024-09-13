import { PartialType } from '@nestjs/mapped-types';
import { CreateCartDto } from './create-cart.dto';
import { IsEmpty, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class UpdateCartDto extends PartialType(CreateCartDto) {
    @IsEmpty()
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

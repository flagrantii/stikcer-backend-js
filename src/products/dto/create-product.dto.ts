import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";

export class CreateProductDto {
    productId: number

    @IsNumber()
    @IsNotEmpty()
    readonly categoryId: number

    @IsNumber()
    @IsNotEmpty()
    readonly userId: number

    @IsString()
    @IsNotEmpty()
    readonly size: string

    @IsString()
    @IsNotEmpty()
    readonly material: string

    @IsString()
    @IsNotEmpty()
    readonly shape: string

    @IsString()
    @IsNotEmpty()
    readonly printingSide: string

    @IsString()
    @IsNotEmpty()
    readonly parcelColor: string[]

    @IsString()
    @IsNotEmpty()
    readonly inkColor: string[]

    @IsNotEmpty()
    @IsPositive()
    readonly unitPrice: number

    @IsNotEmpty()
    @IsPositive()
    readonly amount: number

    @IsString()
    @IsOptional()
    readonly note: string

    @IsNotEmpty()
    @IsString()
    readonly fileUrl: string

    @IsNotEmpty()
    @IsString()
    readonly fileType: string

    @IsNotEmpty()
    @IsNumber()
    readonly fileSize: number

    @IsNotEmpty()
    isPurchased: boolean = false


}

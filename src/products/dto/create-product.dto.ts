import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateProductDto {
  productId: string;

  userId: string;

  categoryId: string;

  @IsString()
  @IsNotEmpty()
  readonly size: string;

  @IsString()
  @IsNotEmpty()
  readonly material: string;

  @IsString()
  @IsNotEmpty()
  readonly shape: string;

  @IsString()
  @IsNotEmpty()
  readonly printingSide: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  readonly parcelColor: string[];

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  readonly inkColor: string[];

  @IsNotEmpty()
  @IsPositive()
  readonly unitPrice: number;

  @IsNotEmpty()
  @IsPositive()
  readonly amount: number;

  @IsString()
  @IsOptional()
  readonly note: string;

  @IsNotEmpty()
  isPurchased: boolean = false;
}

import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsBoolean,
  IsNumber,
  IsArray,
  ArrayMinSize,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly size: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly material: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly shape: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly printingSide: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  readonly parcelColor: string[];

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  readonly inkColor: string[];

  @IsOptional()
  @IsBoolean()
  readonly isPurchased: boolean;

  @IsOptional()
  @IsNumber()
  readonly amount: number;

  @IsOptional()
  @IsNumber()
  readonly unitPrice: number;

  @IsOptional()
  @IsString()
  readonly note: string;
}

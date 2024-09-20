import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @IsOptional()
  @IsString()
  readonly fileUrl: string;

  @IsOptional()
  @IsString()
  readonly fileType: string;

  @IsOptional()
  @IsNumber()
  readonly fileSize: number;
}

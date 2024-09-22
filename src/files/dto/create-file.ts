import { IsBoolean, IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class CreateFileDto {
  id: number;

  @IsNotEmpty()
  @IsPositive()
  userId: number;

  @IsNotEmpty()
  @IsPositive()
  productId: number;

  @IsNotEmpty()
  @IsPositive()
  categoryId: number;

  @IsNotEmpty()
  @IsString()
  key: string;

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsNotEmpty()
  @IsPositive()
  size: number;

  @IsNotEmpty()
  @IsString()
  url: string;

  @IsNotEmpty()
  @IsBoolean()
  isPurchased: boolean;

  @IsNotEmpty()
  @IsString()
  displayName: string;

  @IsNotEmpty()
  file: Express.Multer.File;
}

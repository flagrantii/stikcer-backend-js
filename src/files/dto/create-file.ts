import { IsBoolean, IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class CreateFileDto {
  id: string;

  @IsNotEmpty()
  @IsPositive()
  userId: string;

  @IsNotEmpty()
  @IsPositive()
  productId: string;

  @IsNotEmpty()
  @IsPositive()
  categoryId: string;

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

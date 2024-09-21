import { IsBoolean, IsOptional, IsPositive, IsString } from 'class-validator';

export class UpdateFileDto {
  @IsOptional()
  @IsString()
  key: string;

  @IsOptional()
  @IsString()
  type: string;

  @IsOptional()
  @IsPositive()
  size: number;

  @IsOptional()
  @IsString()
  url: string;

  @IsOptional()
  @IsBoolean()
  isPurchased: boolean;
}

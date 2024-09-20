import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAddressDto {
  userId: number;

  @IsString()
  @IsNotEmpty()
  reciverName: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsOptional()
  subDistrict: string;

  @IsString()
  @IsOptional()
  district: string;

  @IsString()
  @IsOptional()
  province: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @IsString()
  @IsOptional()
  taxPayerId: string;

  @IsString()
  @IsOptional()
  taxPayerName: string;
}

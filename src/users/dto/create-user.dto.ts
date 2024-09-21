import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  readonly firstName: string;

  @IsString()
  @IsNotEmpty()
  readonly lastName: string;

  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsPhoneNumber('TH')
  @IsNotEmpty()
  readonly phone: string;

  @IsNotEmpty()
  @IsEnum(['ADMIN', 'USER']) // enum
  readonly role: string;
}

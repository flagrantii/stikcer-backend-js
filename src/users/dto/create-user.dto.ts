import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPhoneNumber, IsString } from "class-validator";

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    readonly firstname: string

    @IsString()
    @IsNotEmpty()
    readonly lastname: string

    @IsEmail()
    @IsNotEmpty()
    readonly email: string

    @IsString()
    @IsNotEmpty()
    password: string

    @IsPhoneNumber('TH')
    @IsNotEmpty()
    readonly phone: string

    @IsNotEmpty()
    @IsEnum(['ADMIN', 'USER']) // enum
    readonly role: string
}

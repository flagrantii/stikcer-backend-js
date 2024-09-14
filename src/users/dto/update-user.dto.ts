import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsEmail, IsEmpty, IsNumber, IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @IsString()
    @IsOptional()
    readonly firstname?: string

    @IsString()
    @IsOptional()
    readonly lastname?: string

    @IsEmail()
    @IsOptional()
    readonly email?: string

    @IsString()
    @IsOptional()
    password?: string

    @IsPhoneNumber('TH')
    @IsOptional()
    readonly phone?: string
}

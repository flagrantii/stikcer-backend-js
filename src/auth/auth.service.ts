import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { LoginUserDto } from './dto/login-user.dto';
import { DatabaseService } from 'src/database/database.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}
  async login(
    loginUserDto: LoginUserDto,
  ): Promise<{ token: string; err: string }> {
    try {
      const existUser = await this.databaseService.user.findUnique({
        where: {
          email: loginUserDto.email,
        },
      });

      if (!existUser)
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);

      const isPasswordValid = await bcrypt.compare(
        loginUserDto.password,
        existUser.password,
      );
      if (!isPasswordValid)
        throw new HttpException('Invalid password', HttpStatus.UNAUTHORIZED);

      const token = await this.jwtService.signAsync({
        id: existUser.id,
        email: existUser.email,
        role: existUser.role,
      });

      return {
        token,
        err: null,
      };
    } catch (err) {
      console.log(err);
      return {
        token: null,
        err: err.message,
      };
    }
  }

  async InsertUser(
    createUserDto: CreateUserDto,
  ): Promise<{ user: User; err: string; token: string }> {
    try {
      // hashing password
      const hashedPassword: string = await bcrypt.hash(
        createUserDto.password,
        10,
      );
      createUserDto.password = hashedPassword;

      // executing create user to database
      const user = await this.databaseService.user.create({
        data: {
          firstName: createUserDto.firstname,
          lastName: createUserDto.lastname,
          email: createUserDto.email,
          password: createUserDto.password,
          phone: createUserDto.phone,
          role: createUserDto.role,
        },
      });
      delete user.password;

      const token = await this.jwtService.signAsync({
        id: user.id,
      });

      return {
        user: user,
        err: null,
        token: token,
      };
    } catch (err) {
      let message = 'An error occurred while processing your request.';

      if (err.code === 'P2002' && err.meta?.target?.includes('email')) {
        message = 'This email address is already registered.';
      }

      console.log('Error: ', err);
      return {
        user: null,
        err: message,
        token: null,
      };
    }
  }
}

import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginUserDto } from './dto/login-user.dto';
import { DatabaseService } from 'src/database/database.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as uuid from 'uuid';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    this.logger.log(`Attempting to validate user: ${email}`);
    try {
      const user = await this.databaseService.user.findUnique({
        where: { email },
      });
      if (user && (await bcrypt.compare(password, user.password))) {
        const { password: _, ...result } = user;
        return {
          ...result,
          password: _,
        };
      }
      return null;
    } catch (error) {
      this.logger.error(
        `Failed to validate user: ${error.message}`,
        error.stack,
      );
      throw new UnauthorizedException('Invalid credentials');
    }
  }
  async login(loginUserDto: LoginUserDto): Promise<{ token: string }> {
    this.logger.log(
      `Attempting to login user with email: ${loginUserDto.email}`,
    );
    try {
      const user = await this.validateUser(
        loginUserDto.email,
        loginUserDto.password,
      );
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }
      delete user.password;
      const token = { id: user.id, email: user.email, role: user.role };

      return {
        token: this.jwtService.sign(token),
      };
    } catch (error) {
      this.logger.error(`Failed to login user: ${error.message}`, error.stack);
      throw error;
    }
  }

  async register(registerDto: CreateUserDto): Promise<User> {
    this.logger.log(`Attempting to register new user: ${registerDto.email}`);
    try {
      const existingUser = await this.databaseService.user.findUnique({
        where: { email: registerDto.email },
      });
      if (existingUser) {
        throw new BadRequestException('User already exists');
      }
      const userId = uuid.v4();
      const hashedPassword = await bcrypt.hash(registerDto.password, 10);
      const newUser = await this.databaseService.user.create({
        data: {
          ...registerDto,
          password: hashedPassword,
          id: userId,
        },
      });
      const { password: _, ...result } = newUser;
      return {
        ...result,
        password: _,
      };
    } catch (error) {
      this.logger.error(
        `Failed to register user: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}

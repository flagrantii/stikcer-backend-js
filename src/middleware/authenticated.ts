import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { DatabaseService } from 'src/database/database.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private databaseService: DatabaseService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async use(req: Request & { user?: User }, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
  
    if (!authHeader) {
      throw new UnauthorizedException('No token provided');
    }
  
    const [bearer, token] = authHeader.split(' ');
  
    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid token format');
    }
  
    try {
      const secret = this.configService.get<string>('JWT_SECRET');
      const payload = this.jwtService.verify(token, { secret });
  
      const user = await this.databaseService.user.findUnique({
        where: { id: payload.id },
      });
  
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
  
      const { password, ...userWithoutPassword } = user;
      req.user = userWithoutPassword as User;
  
      next();
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { DatabaseService } from 'src/database/database.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    constructor(
        private databaseService: DatabaseService,
        private jwtService: JwtService
    ) {}

    async use(req: Request, res: Response, next: NextFunction) {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            throw new UnauthorizedException('No token provided');
        }

        const [bearer, token] = authHeader.split(' ');

        if (bearer !== 'Bearer' || !token) {
            throw new UnauthorizedException('Invalid token format');
        }

        try {
            const payload = this.jwtService.verify(token);
            const user = await this.databaseService.user.findUnique({
                where: { id: payload.id }
            });

            if (!user) {
                throw new UnauthorizedException('User not found');
            }

            delete user.password;
            req['user'] = {
                ...user,
                role: user.role
            }

            next();
        } catch (err) {
            throw new UnauthorizedException('Invalid token');
        }
    }
}
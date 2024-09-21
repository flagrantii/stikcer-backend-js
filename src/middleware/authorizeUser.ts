import { Injectable, NestMiddleware } from '@nestjs/common';
import { User } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class AuthorizeUser implements NestMiddleware {
  use(req: Request & { user?: User }, res: Response, next: NextFunction) {
    if (req.user.role !== 'USER' && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: `Only users and admins are authorized to access this route`,
      });
    }
    next();
  }
}

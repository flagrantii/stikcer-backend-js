import { Injectable, NestMiddleware } from '@nestjs/common';
import { User } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class AuthorizeAdmin implements NestMiddleware {
  use(req: Request & { user?: User }, res: Response, next: NextFunction) {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: `role user is not authorized to access this route`,
      });
    }
    next();
  }
}

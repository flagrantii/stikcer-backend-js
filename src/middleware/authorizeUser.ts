import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class AuthorizeUser implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req['user'].role !== 'USER') {
      return res.status(403).json({
        success: false,
        message: `role admin is not authorized to access this route`,
      });
    }
    next();
  }
}

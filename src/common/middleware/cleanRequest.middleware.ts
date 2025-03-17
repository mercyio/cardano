import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class CleanRequestMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Clean request body
    for (const key in req.body) {
      if (req.body[key] === '' || req.body[key] === null) {
        delete req.body[key];
      }
    }

    // Clean request query
    for (const key in req.query) {
      if (req.query[key] === '' || req.query[key] === null) {
        delete req.query[key];
      }
    }

    next();
  }
}

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as winston from 'winston';
import { format } from 'winston';
import { ENVIRONMENT } from '../configs/environment';

@Injectable()
export class AuditLoggerMiddleware implements NestMiddleware {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: format.combine(
        format.timestamp(),
        format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} ${level.toUpperCase()}: ${message}\n${JSON.stringify(
            this.maskSensitiveData(meta),
            null,
            2,
          )}`;
        }),
      ),
      transports: [
        new winston.transports.File({ filename: 'audit.log' }),
        new winston.transports.Console(),
      ],
    });

    this.use = this.use.bind(this);
  }

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();

    if (ENVIRONMENT.APP.ENV !== 'development') {
      this.logger.info('Incoming Request', {
        method: req.method,
        url: req.url,
        headers: this.maskSensitiveData(req.headers),
        body: this.maskSensitiveData(req.body),
        query: req.query,
        params: req.params,
        ip: req.ip,
      });
    }

    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (ENVIRONMENT.APP.ENV !== 'development') {
        const responseTime = Date.now() - startTime;
        this.logger.info('Outgoing Response', {
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          responseTime,
          body: this.maskSensitiveData(body),
        });
      }
      return originalJson(body);
    };

    next();
  }

  private maskSensitiveData(data: any, seen = new WeakSet()): any {
    const sensitiveFields = ['password', 'accessToken', 'authorization'];
    if (typeof data !== 'object' || data === null) {
      return data;
    }
    if (seen.has(data)) {
      return '[Circular]';
    }
    seen.add(data);
    const maskedData = Array.isArray(data) ? [] : {};
    for (const [key, value] of Object.entries(data)) {
      if (sensitiveFields.includes(key)) {
        maskedData[key] = '******';
      } else if (typeof value === 'object' && value !== null) {
        maskedData[key] = this.maskSensitiveData(value, seen);
      } else {
        maskedData[key] = value;
      }
    }
    return maskedData;
  }
}

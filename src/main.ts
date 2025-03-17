import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as express from 'express';
import { ValidationPipe } from '@nestjs/common';
import { ENVIRONMENT } from './common/configs/environment';
import { ResponseTransformerInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filter/filter';
import { AuditLoggerMiddleware } from './common/middleware/auditLogger.middleware';
import { CleanRequestMiddleware } from './common/middleware/cleanRequest.middleware';

const serverPort = ENVIRONMENT.APP.PORT || 3000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: '*',
    },
  });

  app.use(helmet());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  /**
   * interceptors
   */
  app.useGlobalInterceptors(
    new ResponseTransformerInterceptor(app.get(Reflector)),
    // new CacheInterceptor(app.get(Reflector)), // enable when need cache
  );

  /**
   * Set global exception filter
   */
  app.useGlobalFilters(new HttpExceptionFilter());

  /**
   * Set global prefix for routes
   */
  app.setGlobalPrefix('/api');

  /**
   *  Set global pipes
   */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Middlewares
  app.use(new CleanRequestMiddleware().use);
  app.use(new AuditLoggerMiddleware().use);

  await app.listen(serverPort);
}
bootstrap().then(() =>
  console.log(
    `======= SERVER STARTED SUCCESSFULLY ON PORT : ${serverPort} ========`,
  ),
);

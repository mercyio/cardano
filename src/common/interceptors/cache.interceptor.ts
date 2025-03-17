import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { CACHE_EXPIRY, NO_CACHE } from '../decorators/cache.decorator';
import { CacheHelperUtil } from '../utils/cache-helper.util';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const key = this.getRequestCacheKey(request);

    const noCache = this.reflector.getAllAndOverride<boolean>(NO_CACHE, [
      context.getHandler(),
      context.getClass(),
    ]);

    const cacheExpiry = this.reflector.getAllAndOverride<number>(CACHE_EXPIRY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (noCache) {
      return next.handle();
    }

    if (request.method === 'GET') {
      const cachedResponse = await CacheHelperUtil.getCache(key);

      if (cachedResponse) {
        return of(cachedResponse);
      }

      return next.handle().pipe(
        tap((response) => {
          CacheHelperUtil.setCache(key, response, cacheExpiry ?? 60 * 5); // cache for 5 minutes
        }),
      );
    } else {
      return next.handle();
    }
  }

  private getRequestCacheKey(
    request: Request & { user: { _id?: string } },
  ): string {
    const userId = request?.user?._id;

    if (userId) {
      return `${request.url}:${userId}`;
    }

    return `${request.url}`;
  }
}

import { Redis } from 'ioredis';
import { ENVIRONMENT } from '../configs/environment';
import { logger } from './logger';

class CacheHelper {
  private redis: Redis | null = null;
  private maxRetries = 3;
  private retryDelay = 2000; // 2 seconds

  constructor() {
    this.initializeRedis()
      .then(() => logger.info('Redis initialized'))
      .catch((err) => {
        logger.error('Redis connection error: ', err);
      });
  }

  private async initializeRedis(retryCount = 0) {
    try {
      this.redis = new Redis(ENVIRONMENT.REDIS.URL, {
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
      });

      // Listen to redis connection events
      this.redis.on('connect', () =>
        logger.info('Redis connected successfully'),
      );
      this.redis.on('error', (err: Error) => {
        (async () => {
          logger.error('Redis connection error: ', err);

          if (retryCount < this.maxRetries) {
            logger.info(
              `Attempting to reconnect to Redis (attempt ${retryCount + 1}/${
                this.maxRetries
              })...`,
            );

            // Clean up existing connection
            if (this.redis) {
              this.redis.disconnect();
              this.redis = null;
            }

            // Wait before retrying
            await new Promise((resolve) =>
              setTimeout(resolve, this.retryDelay),
            );

            // Retry connection
            await this.initializeRedis(retryCount + 1);
          } else {
            logger.error(
              `Failed to connect to Redis after ${this.maxRetries} attempts`,
            );
          }
        })().catch((err) => {
          logger.error('Redis connection error: ', err);
        });
      });
    } catch (error) {
      logger.error('Failed to initialize Redis:', error);

      if (retryCount < this.maxRetries) {
        logger.info(
          `Attempting to reconnect to Redis (attempt ${retryCount + 1}/${
            this.maxRetries
          })...`,
        );

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, this.retryDelay));

        // Retry connection
        await this.initializeRedis(retryCount + 1);
      } else {
        logger.error(
          `Failed to connect to Redis after ${this.maxRetries} attempts`,
        );
      }
    }
  }

  async setCache(
    key: string,
    value: unknown,
    expiry?: number,
  ): Promise<boolean> {
    try {
      if (!this.redis) {
        throw new Error('Redis is not initialized');
      }

      const json = JSON.stringify(value);
      if (expiry) {
        await this.redis.set(key, json, 'EX', expiry);
      } else {
        await this.redis.set(key, json);
      }
      return true;
    } catch (error) {
      logger.error(`Error in setCache for key '${key}':`, error);
      return false;
    }
  }

  async getCache<T = unknown>(key: string): Promise<T | null> {
    try {
      if (!this.redis) {
        throw new Error('Redis is not initialized');
      }

      const json = await this.redis.get(key);

      if (json) {
        return JSON.parse(json) as T;
      }

      return null;
    } catch (error) {
      logger.error(`Error getting cache for key '${key}':`, error);
      return null;
    }
  }

  async removeFromCache(key: string): Promise<boolean> {
    try {
      if (!this.redis) {
        throw new Error('Redis is not initialized');
      }

      await this.redis.del(key);
      return true;
    } catch (error) {
      logger.error(`Error removing from cache for key '${key}':`, error);
      return false;
    }
  }

  async invalidateCacheForResource(resourcePath: string): Promise<number> {
    try {
      if (!this.redis) {
        throw new Error('Redis is not initialized');
      }

      const pattern = `${resourcePath}*`;
      const keys = await this.scanKeys(pattern);

      if (keys.length === 0) {
        return 0;
      }

      await Promise.all(keys.map((key) => this.removeFromCache(key)));
      return keys.length;
    } catch (error) {
      logger.error(
        `Error invalidating cache for resource '${resourcePath}':`,
        error,
      );
      return 0;
    }
  }

  async scanKeys(pattern: string): Promise<string[]> {
    try {
      if (!this.redis) {
        throw new Error('Redis is not initialized');
      }

      let cursor = '0';
      let keys: string[] = [];

      do {
        const response = await this.redis.scan(cursor, 'MATCH', pattern);
        cursor = response[0];
        const matchedKeys = response[1].filter((key) => {
          const [basePath] = key.split('?');
          return basePath.startsWith(pattern.replace('*', ''));
        });
        keys = keys.concat(matchedKeys);
      } while (cursor !== '0');

      return keys;
    } catch (error) {
      logger.error(`Error scanning keys for pattern '${pattern}':`, error);
      return [];
    }
  }

  async getTtl(key: string): Promise<number> {
    if (!this.redis) {
      throw new Error('Redis is not initialized ');
    }
    try {
      const ttl = await this.redis.ttl(key);
      return ttl;
    } catch (err) {
      logger.error(`Error getting TTL for key '${key}':`, err);
      return -1;
    }
  }

  // Add a method to check Redis connection status
  isConnected(): boolean {
    return this.redis !== null && this.redis.status === 'ready';
  }

  // Add a method to properly close Redis connection
  async close(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
      this.redis = null;
    }
  }

  // Method to manually force a reconnection
  async reconnect(): Promise<void> {
    logger.info('Manually reconnecting to Redis...');
    await this.close();
    await this.initializeRedis();
  }
}

export const cacheHelper = new CacheHelper();

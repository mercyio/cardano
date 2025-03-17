import { Redis } from 'ioredis';
import { ISettings } from '../interfaces/setting.interface';
import { CACHE_KEYS } from '../constants/cache.constant';

class CacheHelper {
  private redis: Redis;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL);

    // Listen to redis connection events
    this.redis.on('connect', () => console.log('Redis connected'));
    this.redis.on('error', (err) => console.log(err));
  }

  async setCache(
    key: string,
    value: string | object,
    expiry?: number,
  ): Promise<void> {
    try {
      const json = JSON.stringify(value);
      if (expiry) {
        await this.redis.set(key, json, 'EX', expiry);
      } else {
        await this.redis.set(key, json);
      }
    } catch (error) {
      console.log('Error in setCache: ', error);
    }
  }

  async getCache(key: string): Promise<string | object> {
    try {
      const json = await this.redis.get(key);

      if (json) {
        return JSON.parse(json);
      }

      return null;
    } catch (error) {
      console.log('Error getting cache', error);
      return null;
    }
  }

  async removeFromCache(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.log('Error removing from cache: ', error);
    }
  }

  async invalidateCacheForResource(resourcePath: string): Promise<void> {
    const pattern = `${resourcePath}*`;
    const keys = await this.scanKeys(pattern);
    await Promise.all(keys.map((key) => this.removeFromCache(key)));
  }

  async scanKeys(pattern: string): Promise<string[]> {
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
  }

  async getAppSettings(): Promise<ISettings> {
    return (await this.getCache(CACHE_KEYS.appSettings)) as ISettings;
  }
}

export const CacheHelperUtil = new CacheHelper();

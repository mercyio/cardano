import { isDevEnvironment } from '../configs/environment';
import { APP_CONSTANT } from './app.constant';

export const CACHE_EXPIRY = {
  ONE_MINUTE: 60,
  FIVE_MINUTES: 60 * 5,
  FIFTEEN_MINUTES: 60 * 15,
  THIRTY_MINUTES: 60 * 30,
  ONE_HOUR: 60 * 60,
  TWO_HOURS: 60 * 60 * 2,
  ONE_HOURS: 60 * 60,
  A_DAY: 60 * 60 * 24,
  A_WEEK: 60 * 60 * 24 * 7,
  A_MONTH: 60 * 60 * 24 * 30,
  A_YEAR: 60 * 60 * 24 * 365,
};

export const CACHE_KEYS = {
  appSettings: 'cardano:appSettings',
};

const cacheKeyPrefix = `${APP_CONSTANT.appName}:${isDevEnvironment}:`;
const addCacheKey = (key: string) => `${cacheKeyPrefix}${key}`;

export const cacheKeys = {
  mediaUpload: (fileName: string) => {
    return addCacheKey(`mediaUpload:${fileName}`);
  },
  walletNonce: (walletAddress: string) => {
    return addCacheKey(`walletNonce:${walletAddress}`);
  },
  walletNonceRateLimit: (walletAddress: string) => {
    return addCacheKey(`walletNonceRateLimit:${walletAddress}`);
  },
};

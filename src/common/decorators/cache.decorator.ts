import { SetMetadata } from '@nestjs/common';

export const NO_CACHE = 'noCache';
export const NoCache = () => SetMetadata(NO_CACHE, true);

export const CACHE_EXPIRY = 'cacheExpiry';
export const CacheExpiry = (expiry: number) =>
  SetMetadata(CACHE_EXPIRY, expiry);

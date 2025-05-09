const nonceRateLimitWindow = 60; // 1 minute in seconds
const nonceRateLimitMax = 4; // Maximum nonce requests per minute

export const authConstants = {
  nonceRateLimitWindow,
  nonceRateLimitMax,
};

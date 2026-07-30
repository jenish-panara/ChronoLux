const Redis = require('ioredis');

// Only connect to Redis if it is enabled and the URL is provided
const isRedisEnabled = process.env.REDIS_ENABLED === 'true' && process.env.REDIS_URL;

let redisClient = null;

if (isRedisEnabled) {
  redisClient = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 1, // Do not retry infinitely if server is down
    retryStrategy(times) {
      if (times > 3) {
        // Stop retrying after 3 attempts and fallback to MongoDB
        return null; 
      }
      return Math.min(times * 50, 2000);
    }
  });

  redisClient.on('error', (err) => {
    console.error('Redis connection error:', err.message);
  });

  redisClient.on('connect', () => {
    console.log('Redis connected successfully.');
  });
}

/**
 * Utility to clear all cache keys matching a specific pattern.
 * E.g., clearCachePattern('cache:/api/products*')
 * This uses SCAN so it won't block the Redis server like KEYS would.
 */
const clearCachePattern = async (pattern) => {
  if (!redisClient) return;

  try {
    let cursor = '0';
    do {
      const result = await redisClient.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = result[0];
      const keys = result[1];

      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
    } while (cursor !== '0');
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};

module.exports = {
  redisClient,
  clearCachePattern,
};

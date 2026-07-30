const Redis = require('ioredis');

// 1. Check if Redis is enabled in the .env file
const isRedisEnabled = process.env.REDIS_ENABLED === 'true' && process.env.REDIS_URL;

let redisClient = null;

// 2. Connect to Redis (if enabled)
if (isRedisEnabled) {
  redisClient = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 1, 
    retryStrategy(times) {
      // If we can't connect after 3 tries, stop trying so the app doesn't crash
      if (times > 3) return null; 
      return 1000; // Wait 1 second before retrying
    }
  });

  redisClient.on('error', (err) => console.error('Redis connection error:', err.message));
  redisClient.on('connect', () => console.log('Redis connected successfully.'));
}

/**
 * UTILITY: Clear Cache
 * This function deletes cached data when a product or category is updated.
 * E.g., clearCachePattern('cache:/api/products') will delete all product cache.
 */
const clearCachePattern = async (prefixPattern) => {
  // If Redis isn't connected, do nothing
  if (!redisClient) return;

  try {
    // STEP 1: Find all saved keys in Redis that match the pattern
    // (e.g. find all keys starting with "cache:/api/products")
    const matchingKeys = await redisClient.keys(`${prefixPattern}*`);

    // STEP 2: If we found any keys, delete them!
    if (matchingKeys.length > 0) {
      await redisClient.del(matchingKeys);
      console.log(`🗑️ Cache Cleared: Deleted ${matchingKeys.length} items matching "${prefixPattern}"`);
    }
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};

module.exports = {
  redisClient,
  clearCachePattern,
};


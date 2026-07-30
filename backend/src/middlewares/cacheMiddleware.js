const { redisClient } = require('../utils/redis');

/**
 * Middleware to cache HTTP responses using Redis.
 * @param {number} durationInSeconds - How long the response should be cached.
 */
const cache = (durationInSeconds) => {
  return async (req, res, next) => {
    // If Redis is disabled, not connected, or the request isn't a GET request, skip caching
    if (!redisClient || req.method !== 'GET') {
      return next();
    }

    // Generate a unique cache key based on the URL (including query parameters)
    const key = `cache:${req.originalUrl || req.url}`;

    try {
      // Check if we have a cached response
      const cachedResponse = await redisClient.get(key);

      if (cachedResponse) {
        console.log(`⚡ Cache Hit: ${key}`);
        // Send the cached response immediately
        return res.status(200).json(JSON.parse(cachedResponse));
      }

      console.log(`🐢 Cache Miss: ${key} (Fetching from DB...)`);
      // If not cached, we need to intercept the response
      // Store the original res.json function
      const originalJson = res.json;

      // Override res.json to save data to Redis before sending it
      res.json = function (body) {
        // Only cache successful responses (status 200 or 201)
        if (res.statusCode >= 200 && res.statusCode < 300) {
          redisClient.setex(key, durationInSeconds, JSON.stringify(body)).catch((err) => {
            console.error('Failed to save to Redis cache:', err.message);
          });
        }
        
        // Call the original res.json to send the response to the user
        originalJson.call(this, body);
      };

      next();
    } catch (error) {
      // If anything fails with Redis, just proceed without caching (fallback to DB)
      console.error('Redis cache middleware error:', error.message);
      next();
    }
  };
};

module.exports = { cache };

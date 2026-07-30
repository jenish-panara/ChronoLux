const { redisClient } = require('../utils/redis');

/**
 * CACHE MIDDLEWARE
 * This function intercepts requests before they hit the database.
 * If the data is already in Redis, it sends it immediately (Cache Hit).
 * If not, it lets the database fetch it, saves a copy in Redis, and then sends it (Cache Miss).
 */
const cache = (durationInSeconds) => {
  return async (req, res, next) => {
    // 1. If Redis isn't working or it's not a GET request, just skip caching entirely
    if (!redisClient || req.method !== 'GET') {
      return next();
    }

    // 2. Create a unique name (key) for this request based on its URL
    // Example key: "cache:/api/products?page=1"
    const key = `cache:${req.originalUrl || req.url}`;

    try {
      // 3. STEP A: Check if we already saved the answer in Redis
      const savedData = await redisClient.get(key);

      if (savedData) {
        console.log(`⚡ Cache Hit: Found data for ${key}`);
        // We found it! Send the saved data to the user immediately.
        // We don't even need to talk to MongoDB.
        return res.status(200).json(JSON.parse(savedData));
      }

      console.log(`🐢 Cache Miss: No saved data for ${key}. Fetching from database...`);

      // 4. STEP B: We didn't find it in Redis. 
      // We need to fetch it from MongoDB, but before we send it to the user,
      // we need to save a copy in Redis for next time.
      
      // Keep a backup of the original response function
      const sendOriginalResponse = res.json;

      // Temporarily replace the response function with our own logic
      res.json = function (databaseData) {
        // Only save successful responses to Redis
        if (res.statusCode >= 200 && res.statusCode < 300) {
          redisClient.setex(key, durationInSeconds, JSON.stringify(databaseData)).catch(err => {
            console.error('Failed to save to Redis cache:', err.message);
          });
        }
        
        // Finally, send the database data to the user
        sendOriginalResponse.call(this, databaseData);
      };

      // Proceed to the controller (which will fetch data from MongoDB)
      next();
      
    } catch (error) {
      // If Redis crashes for some reason, just skip caching so the app doesn't break
      console.error('Redis cache middleware error:', error.message);
      next();
    }
  };
};

module.exports = { cache };


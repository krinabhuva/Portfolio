import NodeCache from 'node-cache';

/**
 * Shared NodeCache instance for Practical 9 In-Memory Caching
 * stdTTL: 60 seconds (Default Time-To-Live)
 * checkperiod: 120 seconds (Cleanup check interval for expired keys)
 */
const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

// Counters for Cache HITs and MISSes
let hitCount = 0;
let missCount = 0;

/**
 * Log Cache HIT and increment counter
 * @param {string} key 
 */
export const logHit = (key) => {
  hitCount++;
  console.log(`[CACHE HIT] Key: '${key}' | Total Hits: ${hitCount}`);
};

/**
 * Log Cache MISS and increment counter
 * @param {string} key 
 */
export const logMiss = (key) => {
  missCount++;
  console.log(`[CACHE MISS] Key: '${key}' | Total Misses: ${missCount}`);
};

/**
 * Get item from cache by key
 * Automatically logs HIT or MISS and updates stats
 * @param {string} key 
 * @returns {*} Cached data or undefined if MISS
 */
export const getFromCache = (key) => {
  try {
    const data = cache.get(key);
    if (data !== undefined) {
      logHit(key);
      return data;
    }
    logMiss(key);
    return undefined;
  } catch (error) {
    console.error(`[CACHE ERROR] Error retrieving key '${key}':`, error.message);
    return undefined;
  }
};

/**
 * Store item in cache with specified key and TTL
 * @param {string} key 
 * @param {*} data 
 * @param {number} ttl - TTL in seconds (default 60s)
 */
export const setInCache = (key, data, ttl = 60) => {
  try {
    cache.set(key, data, ttl);
    console.log(`[CACHE SET] Key: '${key}' stored with TTL = ${ttl}s`);
  } catch (error) {
    console.error(`[CACHE ERROR] Error setting key '${key}':`, error.message);
  }
};

/**
 * Invalidate key or array of keys from cache
 * @param {string|string[]} keyOrKeys 
 */
export const invalidateCache = (keyOrKeys) => {
  try {
    if (Array.isArray(keyOrKeys)) {
      keyOrKeys.forEach((key) => {
        if (cache.has(key)) {
          cache.del(key);
          console.log(`[CACHE INVALIDATED] Key: '${key}' removed`);
        }
      });
    } else if (keyOrKeys && cache.has(keyOrKeys)) {
      cache.del(keyOrKeys);
      console.log(`[CACHE INVALIDATED] Key: '${keyOrKeys}' removed`);
    }
  } catch (error) {
    console.error(`[CACHE ERROR] Error invalidating cache:`, error.message);
  }
};

/**
 * Flush all cached items
 */
export const flushCache = () => {
  try {
    cache.flushAll();
    console.log('[CACHE FLUSH] All keys flushed from cache');
  } catch (error) {
    console.error(`[CACHE ERROR] Error flushing cache:`, error.message);
  }
};

/**
 * Get debug statistics for /debug/cache endpoint
 * @returns {Object} Statistics payload
 */
export const getCacheStats = () => {
  const keys = cache.keys();
  const internalStats = cache.getStats();
  const totalRequests = hitCount + missCount;
  const hitRate = totalRequests > 0 
    ? `${((hitCount / totalRequests) * 100).toFixed(2)}%`
    : '0.00%';

  return {
    hits: hitCount,
    misses: missCount,
    totalRequests,
    hitRate,
    keysCount: keys.length,
    activeKeys: keys,
    ttlSeconds: 60,
    nodeCacheInternalStats: internalStats,
  };
};

export default cache;

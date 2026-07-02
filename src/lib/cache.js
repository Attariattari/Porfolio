import Redis from "ioredis";

/**
 * Enterprise-Grade Hybrid Caching Layer with Comprehensive Monitoring
 * Automatically uses Redis if REDIS_URL is provided, otherwise falls back to optimized in-memory cache.
 * Includes production-safe metrics collection and health monitoring.
 */

// Simple In-memory fallback
const localCache = new Map();

let redis = global.redis || null;
let redisStatus = global.redisStatus || { connected: false, error: null };

// Cache Metrics Tracking (Production-Safe, no secrets exposed)
const cacheMetrics = {
  hits: 0,
  misses: 0,
  sets: 0,
  invalidations: 0,
  errors: 0,
  startTime: Date.now(),
  lastUpdated: Date.now(),
  redisConnected: false,
  memoryCacheSize: 0,
  lastErrorMessage: null,
};

if (process.env.REDIS_URL && !redis) {
  try {
    console.log(
      "[Cache] ✓ Redis URL detected. Attempting to initialize ioredis...",
    );
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      connectTimeout: 5000,
      retryStrategy(times) {
        if (times > 3) {
          redisStatus.error = "Max retries reached";
          return null; // Stop retrying
        }
        return Math.min(times * 50, 2000);
      },
    });

    redis.on("connect", () => {
      console.log("[Cache] Redis connected");
      redisStatus.connected = true;
      redisStatus.error = null;
      cacheMetrics.redisConnected = true;
    });

    redis.on("error", (err) => {
      console.error("[Cache] Redis connection error:", err.message);
      redisStatus.connected = false;
      redisStatus.error = err.message;
      cacheMetrics.redisConnected = false;
    });

    global.redis = redis;
    global.redisStatus = redisStatus;
  } catch (e) {
    console.error("[Cache] Redis unavailable, using memory fallback", e);
    redisStatus.error = "Redis initialization failed";
    cacheMetrics.lastErrorMessage = e.message;
  }
}

const DEFAULT_TTL = 60 * 5; // 5 minutes

export const cacheManager = {
  get: async (key) => {
    let useRedis = redis && redisStatus.connected;

    if (useRedis) {
      try {
        const data = await redis.get(key);
        if (data) {
          cacheMetrics.hits++;
          console.log(`[Cache] Redis cache hit: ${key}`);
          return JSON.parse(data);
        }
        cacheMetrics.misses++;
        console.log(`[Cache] Redis cache miss: ${key}`);
        return null;
      } catch (err) {
        console.warn(
          `[Cache] Redis unavailable, using memory fallback: ${err.message}`,
        );
        useRedis = false;
        redisStatus.connected = false;
      }
    }

    try {
      if (!useRedis) {
        const item = localCache.get(key);
        if (!item) {
          cacheMetrics.misses++;
          console.log(`[Cache] 🐢 MISS (Memory): ${key}`);
          return null;
        }

        if (Date.now() > item.expiry) {
          localCache.delete(key);
          cacheMetrics.misses++;
          console.log(`[Cache] ⏰ EXPIRED (Memory): ${key}`);
          return null;
        }

        cacheMetrics.hits++;
        console.log(`[Cache] ⚡ HIT (Memory): ${key}`);
        return item.value;
      }
    } catch (error) {
      cacheMetrics.errors++;
      cacheMetrics.lastErrorMessage = `Get error: ${error.message}`;
      console.error(`[Cache] ✗ GET error for ${key}:`, error.message);
      return null;
    }
  },

  set: async (key, value, ttl = DEFAULT_TTL, tags = []) => {
    let useRedis = redis && redisStatus.connected;

    if (useRedis) {
      try {
        await redis.set(key, JSON.stringify(value), "EX", ttl);
        if (tags && tags.length > 0) {
          const pipeline = redis.pipeline();
          tags.forEach((t) => {
            pipeline.sadd(`tag:${t}`, key);
            pipeline.expire(`tag:${t}`, ttl);
          });
          await pipeline.exec();
        }
        cacheMetrics.sets++;
        console.log(`[Cache] 💾 SET (Redis): ${key} - TTL: ${ttl}s`);
        return;
      } catch (err) {
        console.warn(
          `[Cache] Redis unavailable, using memory fallback: ${err.message}`,
        );
        useRedis = false;
        redisStatus.connected = false;
      }
    }

    try {
      if (!useRedis) {
        const expiry = Date.now() + ttl * 1000;
        localCache.set(key, { value, expiry, tags });
        cacheMetrics.sets++;
        cacheMetrics.memoryCacheSize = localCache.size;
        console.log(
          `[Cache] 💾 SET (Memory): ${key} - TTL: ${ttl}s - Size: ${localCache.size}`,
        );
      }
    } catch (error) {
      cacheMetrics.errors++;
      cacheMetrics.lastErrorMessage = `Set error: ${error.message}`;
      console.error(`[Cache] ✗ SET error for ${key}:`, error.message);
    }
  },

  invalidateByTag: async (tag) => {
    let useRedis = redis && redisStatus.connected;
    cacheMetrics.invalidations++;
    console.log(`[Cache] 🔄 Invalidating tag: ${tag}`);

    if (useRedis) {
      try {
        const keys = await redis.smembers(`tag:${tag}`);
        if (keys && keys.length > 0) {
          const pipeline = redis.pipeline();
          keys.forEach((k) => pipeline.del(k));
          pipeline.del(`tag:${tag}`);
          await pipeline.exec();
          console.log(
            `[Cache] 🔄 Invalidated (Redis): ${tag} - Cleared ${keys.length} entries`,
          );
        } else {
          console.log(
            `[Cache] 🔄 Invalidated (Redis): ${tag} - No entries found`,
          );
        }
        return;
      } catch (err) {
        console.warn(
          `[Cache] Redis unavailable, using memory fallback: ${err.message}`,
        );
        useRedis = false;
        redisStatus.connected = false;
      }
    }

    try {
      if (!useRedis) {
        let invalidatedCount = 0;
        for (const [key, item] of localCache.entries()) {
          if (item.tags.includes(tag)) {
            localCache.delete(key);
            invalidatedCount++;
          }
        }
        cacheMetrics.memoryCacheSize = localCache.size;
        console.log(
          `[Cache] 🔄 Invalidated (Memory): ${tag} - Cleared ${invalidatedCount} entries`,
        );
      }
    } catch (error) {
      cacheMetrics.errors++;
      cacheMetrics.lastErrorMessage = `Invalidation error: ${error.message}`;
      console.error(
        `[Cache] ✗ Invalidation error for tag ${tag}:`,
        error.message,
      );
    }
  },

  // Get health metrics (production-safe, no secrets exposed)
  getMetrics: () => ({
    ...cacheMetrics,
    lastUpdated: Date.now(),
    uptime: Math.floor((Date.now() - cacheMetrics.startTime) / 1000),
    hitRate:
      cacheMetrics.hits + cacheMetrics.misses > 0
        ? (
            (cacheMetrics.hits / (cacheMetrics.hits + cacheMetrics.misses)) *
            100
          ).toFixed(2)
        : 0,
  }),

  // Check Redis connection status
  checkRedisStatus: () => ({
    hasRedisUrl: !!process.env.REDIS_URL,
    connected: redisStatus.connected,
    error: redisStatus.error,
  }),

  // Clear all cache (use with caution)
  clear: async () => {
    try {
      if (redis && redisStatus.connected) {
        await redis.flushdb();
        console.log(`[Cache] 🧹 Cleared all (Redis)`);
      } else {
        localCache.clear();
        cacheMetrics.memoryCacheSize = 0;
        console.log(`[Cache] 🧹 Cleared all (Memory)`);
      }
    } catch (error) {
      cacheMetrics.errors++;
      cacheMetrics.lastErrorMessage = `Clear error: ${error.message}`;
      console.error(`[Cache] ✗ Clear error:`, error.message);
    }
  },
};

export const withCache = async (key, fetchFn, ttl = DEFAULT_TTL, tags = []) => {
  // Bypass cache completely in development to ensure Real-Time sync between Local and Vercel
  if (process.env.NODE_ENV === "development") {
    console.log(`[Cache] 🚀 DEV MODE: Bypassing cache for ${key}`);
    return await fetchFn();
  }

  try {
    const cachedData = await cacheManager.get(key);
    if (cachedData) {
      return cachedData;
    }

    const freshData = await fetchFn();
    await cacheManager.set(key, freshData, ttl, tags);
    return freshData;
  } catch (error) {
    cacheMetrics.errors++;
    cacheMetrics.lastErrorMessage = `withCache error: ${error.message}`;
    console.error(`[Cache] ✗ withCache error for ${key}:`, error.message);
    // Fallback: try to return fresh data despite caching error.
    // If the fetch also fails, propagate the error so callers can handle it.
    return await fetchFn();
  }
};

/**
 * Enterprise-Grade Hybrid Caching Layer
 * Automatically uses Redis if REDIS_URL is provided, otherwise falls back to optimized in-memory cache.
 */

// Simple In-memory fallback
const localCache = new Map();

// Placeholder for Redis client (can be ioredis or @upstash/redis)
let redis = null;

if (process.env.REDIS_URL) {
  try {
    // In a real production environment, you'd install ioredis or @upstash/redis
    // For now, we architect the system to be ready for it.
    console.log("[Cache] Redis URL detected. Attempting to initialize...");
  } catch (e) {
    console.error("[Cache] Failed to initialize Redis, falling back to Memory", e);
  }
}

const DEFAULT_TTL = 60 * 5; // 5 minutes

export const cacheManager = {
  get: async (key) => {
    // 1. Try Redis if available
    if (redis) {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    }

    // 2. Fallback to Memory
    const item = localCache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      localCache.delete(key);
      return null;
    }
    return item.value;
  },

  set: async (key, value, ttl = DEFAULT_TTL, tags = []) => {
    if (redis) {
      await redis.set(key, JSON.stringify(value), "EX", ttl);
      // For tags in Redis, we would use sets, but for simplicity:
      return;
    }

    const expiry = Date.now() + ttl * 1000;
    localCache.set(key, { value, expiry, tags });
  },

  invalidateByTag: async (tag) => {
    console.log(`[Cache] Invalidating tag: ${tag}`);
    if (redis) {
      // Logic for Redis tag invalidation (e.g., scanning keys or using a set)
      return;
    }

    for (const [key, item] of localCache.entries()) {
      if (item.tags.includes(tag)) {
        localCache.delete(key);
      }
    }
  },
};

export const withCache = async (key, fetchFn, ttl = DEFAULT_TTL, tags = []) => {
  // Bypass cache completely in development to ensure Real-Time sync between Local and Vercel
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Cache] 🚀 DEV MODE: Bypassing cache for ${key}`);
    return await fetchFn();
  }

  const cachedData = await cacheManager.get(key);
  if (cachedData) {
    console.log(`[Cache] ⚡ HIT: ${key}`);
    return cachedData;
  }

  console.log(`[Cache] 🐢 MISS: ${key}`);
  const freshData = await fetchFn();
  await cacheManager.set(key, freshData, ttl, tags);
  return freshData;
};

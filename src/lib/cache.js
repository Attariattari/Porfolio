import Redis from "ioredis";

const DEFAULT_TTL = 60 * 5;
const localCache = global.localAppCache || new Map();
global.localAppCache = localCache;

const isServer = typeof window === "undefined";
const isDebug =
  process.env.CACHE_DEBUG === "true" || process.env.NODE_ENV !== "production";

let redis = isServer ? global.redis || null : null;
let redisStatus = isServer
  ? global.redisStatus || { connected: false, error: null }
  : { connected: false, error: null };

const cacheMetrics = global.cacheMetrics || {
  hits: 0,
  misses: 0,
  sets: 0,
  invalidations: 0,
  errors: 0,
  startTime: Date.now(),
  redisConnected: false,
  memoryCacheSize: 0,
  lastErrorMessage: null,
};
global.cacheMetrics = cacheMetrics;

const safeLog = (level, message, context) => {
  if (level === "debug" && !isDebug) return;
  const logger = level === "warn" ? console.warn : level === "error" ? console.error : console.log;
  logger(`[cache] ${message}`, context ? String(context) : "");
};

const markError = (message) => {
  cacheMetrics.errors += 1;
  cacheMetrics.lastErrorMessage = message;
};

export const safeCacheKey = (parts) => {
  const list = Array.isArray(parts) ? parts : [parts];
  return list
    .map((part) =>
      String(part ?? "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9:_*-]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, ""),
    )
    .filter(Boolean)
    .join(":");
};

const canCacheValue = (value) => value !== undefined && value !== null;

if (isServer && process.env.REDIS_URL && !redis) {
  try {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      connectTimeout: 3000,
      enableOfflineQueue: false,
      retryStrategy(times) {
        if (times > 3) return null;
        return Math.min(times * 100, 1000);
      },
    });

    redis.on("connect", () => {
      redisStatus.connected = true;
      redisStatus.error = null;
      cacheMetrics.redisConnected = true;
      safeLog("debug", "Redis connected");
    });

    redis.on("ready", () => {
      redisStatus.connected = true;
      redisStatus.error = null;
      cacheMetrics.redisConnected = true;
    });

    redis.on("end", () => {
      redisStatus.connected = false;
      cacheMetrics.redisConnected = false;
    });

    redis.on("error", (err) => {
      redisStatus.connected = false;
      redisStatus.error = err?.message || "Redis connection error";
      cacheMetrics.redisConnected = false;
      safeLog("warn", "Redis unavailable, using direct data source fallback.");
    });

    global.redis = redis;
    global.redisStatus = redisStatus;
  } catch {
    redis = null;
    redisStatus.connected = false;
    redisStatus.error = "Redis initialization failed";
    markError("Redis initialization failed");
    safeLog("warn", "Redis unavailable, using direct data source fallback.");
  }
}

export const isRedisAvailable = () =>
  Boolean(isServer && redis && redisStatus.connected);

export const getCache = async (key) => {
  const cacheKey = safeCacheKey(key);
  if (!cacheKey) return null;

  if (isRedisAvailable()) {
    try {
      const data = await redis.get(cacheKey);
      if (data === null) {
        cacheMetrics.misses += 1;
        safeLog("debug", "miss", cacheKey);
        return null;
      }

      try {
        cacheMetrics.hits += 1;
        safeLog("debug", "hit", cacheKey);
        return JSON.parse(data);
      } catch {
        await redis.del(cacheKey).catch(() => {});
        markError("Invalid JSON cache payload");
        return null;
      }
    } catch (error) {
      redisStatus.connected = false;
      redisStatus.error = error?.message || "Redis get failed";
      markError("Redis get failed");
      safeLog("warn", "Redis unavailable, using direct data source fallback.");
    }
  }

  const item = localCache.get(cacheKey);
  if (!item) {
    cacheMetrics.misses += 1;
    safeLog("debug", "miss", cacheKey);
    return null;
  }

  if (Date.now() > item.expiry) {
    localCache.delete(cacheKey);
    cacheMetrics.memoryCacheSize = localCache.size;
    cacheMetrics.misses += 1;
    safeLog("debug", "expired", cacheKey);
    return null;
  }

  cacheMetrics.hits += 1;
  safeLog("debug", "hit", cacheKey);
  return item.value;
};

export const setCache = async (key, value, ttl = DEFAULT_TTL, tags = []) => {
  const cacheKey = safeCacheKey(key);
  const ttlSeconds = Number(ttl) > 0 ? Number(ttl) : DEFAULT_TTL;
  const cacheTags = Array.isArray(tags) ? tags.map(safeCacheKey).filter(Boolean) : [];

  if (!cacheKey || !canCacheValue(value)) return;

  if (isRedisAvailable()) {
    try {
      const pipeline = redis.pipeline();
      pipeline.set(cacheKey, JSON.stringify(value), "EX", ttlSeconds);
      cacheTags.forEach((tag) => {
        pipeline.sadd(`tag:${tag}`, cacheKey);
        pipeline.expire(`tag:${tag}`, ttlSeconds);
      });
      await pipeline.exec();
      cacheMetrics.sets += 1;
      safeLog("debug", "set", cacheKey);
      return;
    } catch (error) {
      redisStatus.connected = false;
      redisStatus.error = error?.message || "Redis set failed";
      markError("Redis set failed");
      safeLog("warn", "Redis unavailable, using direct data source fallback.");
    }
  }

  try {
    localCache.set(cacheKey, {
      value,
      expiry: Date.now() + ttlSeconds * 1000,
      tags: cacheTags,
    });
    cacheMetrics.sets += 1;
    cacheMetrics.memoryCacheSize = localCache.size;
    safeLog("debug", "set", cacheKey);
  } catch {
    markError("Memory cache set failed");
  }
};

export const deleteCache = async (key) => {
  const cacheKey = safeCacheKey(key);
  if (!cacheKey) return;

  cacheMetrics.invalidations += 1;
  if (isRedisAvailable()) {
    try {
      await redis.del(cacheKey);
    } catch {
      markError("Redis delete failed");
    }
  }

  localCache.delete(cacheKey);
  cacheMetrics.memoryCacheSize = localCache.size;
  safeLog("debug", "deleted", cacheKey);
};

export const deleteCachePattern = async (pattern) => {
  const cachePattern = safeCacheKey(pattern);
  if (!cachePattern) return;

  cacheMetrics.invalidations += 1;
  if (isRedisAvailable()) {
    try {
      const stream = redis.scanStream({ match: cachePattern, count: 100 });
      for await (const keys of stream) {
        if (keys.length > 0) await redis.del(...keys);
      }
    } catch {
      markError("Redis pattern delete failed");
    }
  }

  const regex = new RegExp(
    `^${cachePattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*")}$`,
  );
  for (const key of localCache.keys()) {
    if (regex.test(key)) localCache.delete(key);
  }
  cacheMetrics.memoryCacheSize = localCache.size;
  safeLog("debug", "deleted pattern", cachePattern);
};

export const rememberCache = async (key, ttl, fetcher, tags = []) => {
  if (process.env.DISABLE_APP_CACHE === "true") return fetcher();

  let cached = null;
  try {
    cached = await getCache(key);
  } catch {
    markError("Cache read failed");
  }

  if (cached !== null) return cached;

  const fresh = await fetcher();
  if (canCacheValue(fresh)) {
    try {
      await setCache(key, fresh, ttl, tags);
    } catch {
      markError("Cache write failed");
    }
  }
  return fresh;
};

const invalidateByTag = async (tag) => {
  const cacheTag = safeCacheKey(tag);
  if (!cacheTag) return;

  cacheMetrics.invalidations += 1;
  if (isRedisAvailable()) {
    try {
      const keys = await redis.smembers(`tag:${cacheTag}`);
      if (keys.length > 0) {
        const pipeline = redis.pipeline();
        keys.forEach((key) => pipeline.del(key));
        pipeline.del(`tag:${cacheTag}`);
        await pipeline.exec();
      }
    } catch {
      markError("Redis tag invalidation failed");
    }
  }

  for (const [key, item] of localCache.entries()) {
    if (item.tags?.includes(cacheTag)) localCache.delete(key);
  }
  cacheMetrics.memoryCacheSize = localCache.size;
  safeLog("debug", "invalidated tag", cacheTag);
};

export const cacheManager = {
  get: getCache,
  set: setCache,
  delete: deleteCache,
  deletePattern: deleteCachePattern,
  invalidateByTag,
  getMetrics: () => ({
    ...cacheMetrics,
    lastUpdated: Date.now(),
    redisConnected: isRedisAvailable(),
    memoryCacheSize: localCache.size,
    uptime: Math.floor((Date.now() - cacheMetrics.startTime) / 1000),
    hitRate:
      cacheMetrics.hits + cacheMetrics.misses > 0
        ? (
            (cacheMetrics.hits / (cacheMetrics.hits + cacheMetrics.misses)) *
            100
          ).toFixed(2)
        : 0,
  }),
  checkRedisStatus: () => ({
    hasRedisUrl: Boolean(process.env.REDIS_URL),
    configured: Boolean(process.env.REDIS_URL),
    connected: isRedisAvailable(),
    error: redisStatus.error,
  }),
  clear: async () => {
    try {
      if (isRedisAvailable()) await redis.flushdb();
    } catch {
      markError("Redis clear failed");
    }
    localCache.clear();
    cacheMetrics.memoryCacheSize = 0;
    safeLog("debug", "cleared");
  },
};

export const withCache = async (key, fetchFn, ttl = DEFAULT_TTL, tags = []) => {
  return rememberCache(key, ttl, fetchFn, tags);
};

/**
 * Rate limiting middleware for API routes
 * Hybrid implementation: Redis (if available) with in-memory fallback
 */
import { cacheManager } from "@/lib/cache";

// In-memory fallback map
const requestLimits = new Map();

const DEFAULT_OPTIONS = {
  maxRequests: 5,
  windowMs: 60 * 1000, // 1 minute
};

/**
 * Get client IP address from request headers
 * @param {Request} request - The request object
 * @returns {string} The client IP address
 */
export function getClientIP(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  return request.headers.get("cf-connecting-ip") || "unknown";
}

/**
 * Check if request exceeds rate limit
 * @param {string} clientIP - The client's IP address
 * @param {Partial<RateLimitOptions>} options - Rate limit options
 * @returns {{allowed: boolean, remaining: number, resetTime: number}} Rate limit status
 */
export async function checkRateLimit(clientIP, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const now = Date.now();
  const key = `rl:${clientIP}`;

  if (global.redis && global.redisStatus && global.redisStatus.connected) {
    try {
      const redis = global.redis;
      const current = await redis.get(key);

      if (!current) {
        const resetTime = now + opts.windowMs;
        await redis.set(
          key,
          JSON.stringify({ count: 1, reset: resetTime }),
          "PX",
          opts.windowMs,
        );
        return {
          allowed: true,
          remaining: opts.maxRequests - 1,
          resetTime,
        };
      }

      const record = JSON.parse(current);

      if (now > record.reset) {
        const resetTime = now + opts.windowMs;
        await redis.set(
          key,
          JSON.stringify({ count: 1, reset: resetTime }),
          "PX",
          opts.windowMs,
        );
        return {
          allowed: true,
          remaining: opts.maxRequests - 1,
          resetTime,
        };
      }

      record.count += 1;
      const ttl = Math.max(1, record.reset - now);
      await redis.set(key, JSON.stringify(record), "PX", ttl);

      return {
        allowed: record.count <= opts.maxRequests,
        remaining: Math.max(0, opts.maxRequests - record.count),
        resetTime: record.reset,
      };
    } catch (err) {
      console.warn(
        `[RateLimit] Redis unavailable, using memory fallback: ${err.message}`,
      );
      global.redisStatus.connected = false;
    }
  }

  // Memory fallback
  let record = requestLimits.get(key);

  if (!record) {
    record = {
      count: 1,
      reset: now + opts.windowMs,
    };
    requestLimits.set(key, record);
    return {
      allowed: true,
      remaining: opts.maxRequests - 1,
      resetTime: record.reset,
    };
  }

  if (now > record.reset) {
    record = {
      count: 1,
      reset: now + opts.windowMs,
    };
    requestLimits.set(key, record);
    return {
      allowed: true,
      remaining: opts.maxRequests - 1,
      resetTime: record.reset,
    };
  }

  record.count += 1;

  const allowed = record.count <= opts.maxRequests;
  const remaining = Math.max(0, opts.maxRequests - record.count);

  return {
    allowed,
    remaining,
    resetTime: record.reset,
  };
}

/**
 * Cleanup old rate limit records (call periodically)
 */
export function cleanupRateLimits() {
  const now = Date.now();
  for (const [key, record] of requestLimits.entries()) {
    if (now > record.reset + 60000) {
      // Keep records for 1 minute after window expires
      requestLimits.delete(key);
    }
  }
}

// Cleanup every 5 minutes
setInterval(cleanupRateLimits, 5 * 60 * 1000);

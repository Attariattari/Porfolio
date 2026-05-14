/**
 * Rate limiting middleware for API routes
 * Simple in-memory rate limiter (can be upgraded to Redis in production)
 */

const requestLimits = new Map();

/**
 * @typedef {Object} RateLimitOptions
 * @property {number} maxRequests - Max requests per window
 * @property {number} windowMs - Time window in milliseconds
 */

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
  // Try to get IP from headers (works behind proxy)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Fallback
  return request.headers.get('cf-connecting-ip') || 'unknown';
}

/**
 * Check if request exceeds rate limit
 * @param {string} clientIP - The client's IP address
 * @param {Partial<RateLimitOptions>} options - Rate limit options
 * @returns {{allowed: boolean, remaining: number, resetTime: number}} Rate limit status
 */
export function checkRateLimit(
  clientIP,
  options = {},
) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const now = Date.now();
  const key = `rl:${clientIP}`;

  let record = requestLimits.get(key);

  // Create new record if doesn't exist
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

  // Check if window expired
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

  // Increment count
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

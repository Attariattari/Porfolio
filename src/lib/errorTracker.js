/**
 * Enterprise Error Tracking System
 * Production-safe error logging with safe data sanitization
 */

const MAX_STORED_ERRORS = 100;
const ERROR_RETENTION_TIME = 24 * 60 * 60 * 1000; // 24 hours
const SENSITIVE_KEYS = ["password", "token", "secret", "apiKey", "authorization"];

// In-memory error store (can be replaced with database in the future)
let errorStore = {
  errors: [],
  stats: {
    total: 0,
    byType: {},
    byRoute: {},
  },
};

/**
 * Sanitize error data to prevent exposing sensitive information
 */
function sanitizeError(error, context = {}) {
  const sanitized = {
    type: error?.name || "Unknown Error",
    message: sanitizeString(error?.message || "Unknown error"),
    stack: error?.stack ? sanitizeString(error.stack) : undefined,
    context: {
      route: context.route || "unknown",
      method: context.method || "unknown",
      timestamp: new Date().toISOString(),
      userAgent: sanitizeUserAgent(context.userAgent),
      url: sanitizeUrl(context.url),
      userId: context.userId || "anonymous",
    },
    severity: determineSeverity(error),
  };

  return sanitized;
}

/**
 * Sanitize strings to remove secrets and sensitive paths
 */
function sanitizeString(str) {
  if (!str) return str;
  
  let sanitized = str
    // Remove file paths
    .replace(/\/[a-zA-Z0-9._\/-]*\.(js|jsx|ts|tsx|env)/g, "[FILE_PATH]")
    // Remove email addresses
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[EMAIL]")
    // Remove URLs
    .replace(/https?:\/\/[^\s]+/g, "[URL]")
    // Remove hex strings that might be tokens
    .replace(/[a-f0-9]{32,}/g, "[TOKEN]");

  return sanitized;
}

/**
 * Sanitize user agent string
 */
function sanitizeUserAgent(userAgent) {
  if (!userAgent) return "unknown";
  // Keep only essential browser/OS info
  return userAgent.substring(0, 100);
}

/**
 * Sanitize URL to hide query parameters with sensitive data
 */
function sanitizeUrl(url) {
  if (!url) return "unknown";
  
  try {
    const parsed = new URL(url, "http://localhost");
    const query = new URLSearchParams(parsed.search);
    
    // Remove sensitive query params
    SENSITIVE_KEYS.forEach(key => {
      if (query.has(key)) {
        query.set(key, "[REDACTED]");
      }
    });
    
    parsed.search = query.toString();
    return parsed.pathname + parsed.search;
  } catch {
    return "invalid-url";
  }
}

/**
 * Determine error severity level
 */
function determineSeverity(error) {
  const message = error?.message || "";
  const type = error?.name || "";

  if (type === "SyntaxError" || type === "ReferenceError") return "critical";
  if (message.includes("timeout") || message.includes("TimeoutError")) return "high";
  if (message.includes("unauthorized") || message.includes("403")) return "high";
  if (message.includes("not found") || message.includes("404")) return "medium";
  return "low";
}

/**
 * Main error tracking function
 */
export const errorTracker = {
  /**
   * Track an error
   */
  track: async (error, context = {}) => {
    try {
      const sanitized = sanitizeError(error, context);

      // Add to in-memory store
      errorStore.errors.unshift(sanitized);
      errorStore.stats.total++;

      // Update type stats
      errorStore.stats.byType[sanitized.type] =
        (errorStore.stats.byType[sanitized.type] || 0) + 1;

      // Update route stats
      const route = sanitized.context.route;
      errorStore.stats.byRoute[route] = (errorStore.stats.byRoute[route] || 0) + 1;

      // Keep only recent errors
      if (errorStore.errors.length > MAX_STORED_ERRORS) {
        errorStore.errors = errorStore.errors.slice(0, MAX_STORED_ERRORS);
      }

      console.log("[ErrorTracker] ✓ Error tracked:", sanitized.type, "-", sanitized.context.route);

      // In production, you could send to an error tracking service here
      // await sendToErrorTrackingService(sanitized);
    } catch (err) {
      console.error("[ErrorTracker] ✗ Failed to track error:", err.message);
    }
  },

  /**
   * Get recent errors
   */
  getRecentErrors: (limit = 50) => {
    return errorStore.errors.slice(0, Math.min(limit, MAX_STORED_ERRORS));
  },

  /**
   * Get error statistics
   */
  getStats: () => ({
    totalErrors: errorStore.stats.total,
    errorsByType: errorStore.stats.byType,
    errorsByRoute: errorStore.stats.byRoute,
    timestamp: new Date().toISOString(),
  }),

  /**
   * Get errors by type
   */
  getByType: (type) => {
    return errorStore.errors.filter((e) => e.type === type);
  },

  /**
   * Get errors by route
   */
  getByRoute: (route) => {
    return errorStore.errors.filter((e) => e.context.route === route);
  },

  /**
   * Get errors by severity
   */
  getBySeverity: (severity) => {
    return errorStore.errors.filter((e) => e.severity === severity);
  },

  /**
   * Clear all errors
   */
  clear: () => {
    errorStore = {
      errors: [],
      stats: {
        total: 0,
        byType: {},
        byRoute: {},
      },
    };
  },

  /**
   * Get health status
   */
  getHealth: () => {
    const stats = errorStore.stats;
    const critical = errorStore.errors.filter((e) => e.severity === "critical").length;
    const high = errorStore.errors.filter((e) => e.severity === "high").length;

    let status = "🟢 Healthy";
    if (critical > 0) status = "🔴 Critical";
    else if (high > 5) status = "🟠 Degraded";
    else if (stats.total > 50) status = "🟡 Caution";

    return {
      status,
      totalErrors: stats.total,
      criticalErrors: critical,
      highSeverity: high,
      recentErrors: errorStore.errors.slice(0, 10),
    };
  },
};

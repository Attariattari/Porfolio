/**
 * Cache Health Monitor API
 * Provides production-safe cache metrics and health status
 * Protected endpoint - returns aggregated metrics only, no sensitive data
 */

import { NextResponse } from "next/server";
import { cacheManager } from "@/lib/cache";
import { apiResponse } from "@/lib/apiResponse";

export async function GET(request) {
  try {
    // Get cache metrics
    const metrics = cacheManager.getMetrics();
    const redisStatus = cacheManager.checkRedisStatus();

    // Determine overall cache health
    const hitRate = parseFloat(metrics.hitRate) || 0;
    let health = "🔴 Critical";
    let status = "unhealthy";

    if (hitRate >= 80) {
      health = "🟢 Excellent";
      status = "healthy";
    } else if (hitRate >= 60) {
      health = "🟡 Good";
      status = "healthy";
    } else if (hitRate >= 40) {
      health = "🟠 Fair";
      status = "degraded";
    } else if (hitRate === 0 && (metrics.hits + metrics.misses === 0)) {
      health = "⚪ No Activity";
      status = "idle";
    }

    // Build comprehensive response
    const cacheHealthReport = {
      status,
      health,
      timestamp: new Date().toISOString(),
      uptime: `${metrics.uptime}s`,
      metrics: {
        cacheHits: metrics.hits,
        cacheMisses: metrics.misses,
        hitRate: `${metrics.hitRate}%`,
        totalRequests: metrics.hits + metrics.misses,
        cacheWrites: metrics.sets,
        cacheInvalidations: metrics.invalidations,
        cacheErrors: metrics.errors,
      },
      memory: {
        cacheSize: metrics.memoryCacheSize,
        unit: "entries",
      },
      redis: {
        configured: redisStatus.hasRedisUrl,
        connected: redisStatus.connected,
        error: redisStatus.error || null,
      },
      lastError: metrics.lastErrorMessage || null,
      recommendations: generateRecommendations(hitRate, metrics, redisStatus),
    };

    return apiResponse.success(cacheHealthReport, "Cache health report generated");
  } catch (error) {
    console.error("[Cache Health API] Error:", error.message);
    return apiResponse.error("Failed to generate cache health report", 500, error.message);
  }
}

/**
 * Generate actionable recommendations based on cache metrics
 */
function generateRecommendations(hitRate, metrics, redisStatus) {
  const recommendations = [];

  // Redis recommendations
  if (!redisStatus.configured) {
    recommendations.push({
      type: "info",
      message: "Redis is not configured. Consider setting REDIS_URL for production scalability.",
    });
  } else if (!redisStatus.connected && redisStatus.hasRedisUrl) {
    recommendations.push({
      type: "warning",
      message: "Redis URL is configured but connection failed. Check Redis server status.",
    });
  }

  // Hit rate recommendations
  if (hitRate < 40 && metrics.hits + metrics.misses > 0) {
    recommendations.push({
      type: "warning",
      message: "Cache hit rate is low. Consider increasing TTL or reviewing cache keys.",
    });
  }

  if (hitRate === 0 && metrics.hits + metrics.misses > 100) {
    recommendations.push({
      type: "error",
      message: "Zero cache hits detected despite high traffic. Check cache initialization.",
    });
  }

  // Error tracking
  if (metrics.errors > 10) {
    recommendations.push({
      type: "warning",
      message: `${metrics.errors} cache errors detected. Review error logs for details.`,
    });
  }

  // Memory size warnings
  if (metrics.memoryCacheSize > 1000) {
    recommendations.push({
      type: "info",
      message: `Memory cache is large (${metrics.memoryCacheSize} entries). Consider Redis or adjusting TTL.`,
    });
  }

  // If everything looks good
  if (recommendations.length === 0) {
    recommendations.push({
      type: "success",
      message: "Cache system is operating optimally.",
    });
  }

  return recommendations;
}

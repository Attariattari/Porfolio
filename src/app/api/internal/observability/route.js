/**
 * Production Observability Metrics API
 * Serves performance and health metrics
 */

import { NextResponse } from "next/server";
import { observabilityTracker } from "@/lib/observabilityTracker";
import { apiResponse } from "@/lib/apiResponse";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "metrics";

    let data;

    if (action === "health") {
      data = observabilityTracker.getHealth();
    } else if (action === "metrics") {
      data = observabilityTracker.getMetrics();
    } else {
      return apiResponse.error("Invalid action", 400);
    }

    return apiResponse.success(data, "Observability metrics retrieved");
  } catch (error) {
    console.error("[Observability API] Error:", error.message);
    return apiResponse.error("Failed to retrieve observability metrics", 500);
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { type, data } = body;

    if (!type || !data) {
      return apiResponse.error("type and data fields required", 400);
    }

    switch (type) {
      case "webVitals":
        observabilityTracker.recordWebVitals(data);
        break;
      case "apiResponseTime":
        observabilityTracker.recordApiResponseTime(data.responseTime);
        break;
      case "dbQueryTime":
        observabilityTracker.recordDbQueryTime(data.queryTime);
        break;
      case "cacheHitRate":
        observabilityTracker.recordCacheHitRate(data.hitRate);
        break;
      case "memoryUsage":
        observabilityTracker.recordMemoryUsage(data.memoryMb);
        break;
      default:
        return apiResponse.error("Unknown metric type", 400);
    }

    return apiResponse.success(null, "Metric recorded");
  } catch (error) {
    console.error("[Observability API] Error:", error.message);
    return apiResponse.error("Failed to record metric", 500);
  }
}

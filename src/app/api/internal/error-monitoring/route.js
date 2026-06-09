/**
 * Error Monitoring API
 * Provides production-safe error tracking and metrics
 */

import { NextResponse } from "next/server";
import { errorTracker } from "@/lib/errorTracker";
import { apiResponse } from "@/lib/apiResponse";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "all";
    const type = searchParams.get("type");
    const route = searchParams.get("route");
    const severity = searchParams.get("severity");
    const limit = Math.min(parseInt(searchParams.get("limit")) || 50, 100);

    let data;

    switch (action) {
      case "health":
        data = errorTracker.getHealth();
        break;

      case "stats":
        data = errorTracker.getStats();
        break;

      case "by-type":
        if (!type) {
          return apiResponse.error("type query parameter required", 400);
        }
        data = {
          type,
          errors: errorTracker.getByType(type),
          count: errorTracker.getByType(type).length,
        };
        break;

      case "by-route":
        if (!route) {
          return apiResponse.error("route query parameter required", 400);
        }
        data = {
          route,
          errors: errorTracker.getByRoute(route),
          count: errorTracker.getByRoute(route).length,
        };
        break;

      case "by-severity":
        if (!severity) {
          return apiResponse.error("severity query parameter required", 400);
        }
        data = {
          severity,
          errors: errorTracker.getBySeverity(severity),
          count: errorTracker.getBySeverity(severity).length,
        };
        break;

      case "recent":
      case "all":
      default:
        data = {
          recent: errorTracker.getRecentErrors(limit),
          count: errorTracker.getRecentErrors(limit).length,
          total: errorTracker.getStats().totalErrors,
          limit,
        };
        break;
    }

    return apiResponse.success(data, "Error monitoring data retrieved");
  } catch (error) {
    console.error("[Error Monitoring API] Error:", error.message);
    return apiResponse.error("Failed to retrieve error monitoring data", 500, error.message);
  }
}

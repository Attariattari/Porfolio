/**
 * API Error Tracking Wrapper
 * Wraps API route handlers to automatically track errors
 */

import { errorTracker } from "@/lib/errorTracker";
import { apiResponse } from "@/lib/apiResponse";

export function withErrorTracking(handler) {
  return async (request, ...args) => {
    try {
      return await handler(request, ...args);
    } catch (error) {
      // Extract context from request
      const url = new URL(request.url, "http://localhost");
      const context = {
        route: url.pathname,
        method: request.method,
        userAgent: request.headers.get("user-agent") || "unknown",
        url: url.toString(),
        userId: request.headers.get("x-user-id") || "anonymous",
      };

      // Track the error
      errorTracker.track(error, context);

      // Return safe error response
      console.error(`[API Error] ${request.method} ${url.pathname}:`, error.message);
      return apiResponse.error(
        "An error occurred processing your request",
        500,
        process.env.NODE_ENV === "development" ? error.message : undefined
      );
    }
  };
}

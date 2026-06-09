"use client";

/**
 * Client-Side Error Tracker Hook
 * Captures and reports client-side errors to the server
 */

import { useEffect } from "react";

export function useClientErrorTracking() {
  useEffect(() => {
    // Track unhandled errors
    const handleError = (event) => {
      const error = event.error || new Error(event.message);
      trackClientError(error, {
        type: "uncaught",
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    };

    // Track unhandled promise rejections
    const handleUnhandledRejection = (event) => {
      const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
      trackClientError(error, {
        type: "unhandledRejection",
      });
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);
}

/**
 * Track a client error
 */
async function trackClientError(error, additionalContext = {}) {
  try {
    // Don't track in development for cleaner console
    if (process.env.NODE_ENV === "development") {
      console.warn("[ClientErrorTracker]", error.message);
      return;
    }

    const context = {
      route: window.location.pathname,
      method: "GET",
      userAgent: navigator.userAgent,
      url: window.location.href,
      ...additionalContext,
    };

    // Send to server endpoint
    await fetch("/api/internal/error-monitoring-client", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
        context,
      }),
    }).catch((err) => {
      console.error("[ClientErrorTracker] Failed to send error:", err.message);
    });
  } catch (err) {
    console.error("[ClientErrorTracker] Error:", err.message);
  }
}

export { trackClientError };

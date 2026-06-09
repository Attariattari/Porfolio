/**
 * Client Error Tracking Endpoint
 * Receives and tracks errors from client-side
 */

import { NextResponse } from "next/server";
import { errorTracker } from "@/lib/errorTracker";
import { apiResponse } from "@/lib/apiResponse";

export async function POST(request) {
  try {
    const body = await request.json();
    const { error, context } = body;

    if (!error || !error.message) {
      return apiResponse.error("Invalid error data", 400);
    }

    // Track the error
    const errorObj = new Error(error.message);
    errorObj.name = error.name;
    errorObj.stack = error.stack;

    errorTracker.track(errorObj, context);

    return apiResponse.success(null, "Client error tracked");
  } catch (err) {
    console.error("[Client Error Endpoint] Error:", err.message);
    return apiResponse.error("Failed to track client error", 500);
  }
}

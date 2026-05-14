import { NextResponse } from "next/server";

/**
 * Standard API Response format
 */
export const apiResponse = {
  success: (data = null, message = "Success", status = 200) => {
    return NextResponse.json(
      {
        success: true,
        message,
        data,
      },
      { status }
    );
  },

  error: (message = "Internal Server Error", status = 500, errors = null) => {
    // Log error for internal monitoring
    if (status === 500) {
      console.error(`[API ERROR] ${message}`, errors);
    }

    return NextResponse.json(
      {
        success: false,
        message,
        errors,
      },
      { status }
    );
  },
};

/**
 * Global API Error Wrapper
 */
export const withErrorHandling = (handler) => {
  return async (...args) => {
    try {
      return await handler(...args);
    } catch (error) {
      console.error("[CRITICAL API FAILURE]", error);
      
      // Handle Zod errors specifically
      if (error.name === "ZodError") {
        return apiResponse.error("Validation failed", 400, error.errors);
      }

      return apiResponse.error(error.message || "An unexpected error occurred", 500);
    }
  };
};

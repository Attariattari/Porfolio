import { NextResponse } from "next/server";
import { ContactController } from "@/controllers/ContactController";
import { ContactFormSchema } from "@/lib/validation";
import { getClientIP, checkRateLimit } from "@/lib/rateLimit";
import { ZodError } from "zod";

// CORS headers for public endpoint
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

/**
 * GET /api/contact - Legacy endpoint for compatibility (PUBLIC)
 */
export async function GET() {
  return NextResponse.json(
    {
      success: true,
      message:
        "Contact form API is operational (PUBLIC - No authentication required)",
      status: "ready",
    },
    {
      status: 200,
      headers: corsHeaders,
    },
  );
}

/**
 * POST /api/contact - Submit a new contact form message
 * PUBLIC ENDPOINT - No authentication required
 * Rate limited: 5 requests per minute per IP
 */
export async function POST(request) {
  // Outermost safety net — guarantees we ALWAYS return valid JSON.
  // If our own catch block throws (e.g. error.errors.map on undefined),
  // Next.js would silently emit an empty 500 body causing client-side
  // 'Unexpected end of JSON input'. This prevents that.
  try {
    return await handleContactPost(request);
  } catch (fatalError) {
    console.error("[ContactRoute] Unhandled fatal error:", fatalError);
    return NextResponse.json(
      {
        success: false,
        message: "❌ An unexpected error occurred. Please try again.",
        ...(process.env.NODE_ENV === "development" && {
          debug: fatalError?.message,
        }),
      },
      { status: 500, headers: corsHeaders },
    );
  }
}

async function handleContactPost(request) {
  try {
    // Get client IP for rate limiting
    const clientIP = getClientIP(request);

    // Check rate limit
    const rateLimit = await checkRateLimit(clientIP, {
      maxRequests: 5,
      windowMs: 60 * 1000, // 1 minute
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: "Too many requests. Please try again later.",
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: corsHeaders,
        },
      );
    }

    // Parse and validate request body
    const body = await request.json();

    const validatedData = ContactFormSchema.parse({ ...body });

    // Create the message
    const message = await ContactController.create({
      ...validatedData,
      ipAddress: clientIP,
      userAgent: request.headers.get("user-agent") || "unknown",
    });

    return NextResponse.json(
      {
        success: true,
        message: "✅ Communication established successfully. We'll respond within 24 hours.",
        data: message,
      },
      { status: 201, headers: corsHeaders },
    );
  } catch (error) {
    // Handle Zod validation errors — guard against error.errors being undefined
    if (error instanceof ZodError) {
      const fieldErrors = Array.isArray(error.errors)
        ? error.errors.map((err) => ({
            field: err.path?.join(".") ?? "unknown",
            message: err.message,
          }))
        : [];

      const primaryMessage =
        fieldErrors[0]?.message || "Validation error — Please check your input";

      return NextResponse.json(
        {
          success: false,
          message: primaryMessage,
          errors: fieldErrors,
        },
        { status: 400, headers: corsHeaders },
      );
    }

    // All other errors — log server-side, never leak internals to client
    console.error("[ContactRoute] Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "❌ Message submission failed. Please try again.",
        ...(process.env.NODE_ENV === "development" && { debug: error?.message }),
      },
      { status: 500, headers: corsHeaders },
    );
  }
}

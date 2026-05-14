/**
 * GET /api/admin/messages - Get all messages with filters and pagination
 * Protected: Admin/Super-admin only
 */

import { NextResponse } from "next/server";
import { ContactController } from "@/controllers/ContactController";
import { MessageQuerySchema } from "@/lib/validation";
import { authenticateAdminRequest } from "@/lib/adminAuth";
import { ZodError } from "zod";

export async function GET(request) {
  try {
    // Authenticate admin user
    const auth = await authenticateAdminRequest(request);
    if (auth.error) {
      console.log("[Messages API] Auth error:", auth.error.message);
      return NextResponse.json(
        { success: false, message: auth.error.message },
        { status: auth.error.status }
      );
    }

    console.log("[Messages API] User authenticated:", auth.userId);

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryData = Object.fromEntries(searchParams.entries());

    console.log("[Messages API] Raw query data:", queryData);

    const validatedQuery = MessageQuerySchema.parse(queryData);

    console.log("[Messages API] Validated query:", validatedQuery);

    // Fetch messages
    const result = await ContactController.getAll(validatedQuery);

    return NextResponse.json(
      {
        success: true,
        data: result.data,
        pagination: result.pagination,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      console.error("[Messages API] Validation error:", error.errors);
      return NextResponse.json(
        {
          success: false,
          message: "Invalid query parameters",
          errors: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
            code: e.code,
          })),
        },
        { status: 400 }
      );
    }

    console.error("[Messages API] Server error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch messages",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

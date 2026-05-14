/**
 * POST /api/admin/messages/reply - Send admin reply to a message
 * Protected: Admin/Super-admin only
 * Body: { messageId, reply }
 */

import { NextResponse } from "next/server";
import { ContactController } from "@/controllers/ContactController";
import { AdminReplySchema } from "@/lib/validation";
import { authenticateAdminRequest } from "@/lib/adminAuth";
import { ZodError } from "zod";

export async function POST(request) {
  try {
    // Authenticate admin user
    const auth = await authenticateAdminRequest(request);
    if (auth.error) {
      return NextResponse.json(
        { success: false, message: auth.error.message },
        { status: auth.error.status }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = AdminReplySchema.parse(body);

    // Send reply and email
    const result = await ContactController.sendReply(
      validatedData.messageId,
      validatedData.reply,
      auth.userId
    );

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.error || "Failed to send reply",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: result.message,
        data: {
          replied: true,
          mailSent: !result.mocked,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation error",
          errors: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    if (error.message === "Message not found") {
      return NextResponse.json(
        { success: false, message: "Message not found" },
        { status: 404 }
      );
    }

    console.error("Send reply error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to send reply",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

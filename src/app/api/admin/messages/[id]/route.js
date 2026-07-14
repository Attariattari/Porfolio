/**
 * GET /api/admin/messages/:id - Get single message and mark as read
 * DELETE /api/admin/messages/:id - Delete a message
 * Protected: Admin/Super-admin only
 */

import { NextResponse } from "next/server";
import { ContactController } from "@/controllers/ContactController";
import { authenticateAdminRequest } from "@/lib/adminAuth";

export async function GET(request, { params }) {
  try {
    // Authenticate admin user
    const auth = await authenticateAdminRequest(request);
    if (auth.error) {
      return NextResponse.json(
        { success: false, message: auth.error.message },
        { status: auth.error.status }
      );
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;
    console.log("[GET /messages/:id] Accessing ID:", id);

    if (!id || id === "undefined" || id === "null") {
      return NextResponse.json(
        { success: false, message: "Valid message ID is required" },
        { status: 400 }
      );
    }

    const message = await ContactController.getById(id);

    return NextResponse.json(
      {
        success: true,
        data: message,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error.message === "Message not found") {
      return NextResponse.json(
        { success: false, message: "Message not found" },
        { status: 404 }
      );
    }

    console.error("Get message error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch message",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    // Authenticate admin user (super-admin only for delete)
    const auth = await authenticateAdminRequest(request);
    if (auth.error) {
      return NextResponse.json(
        { success: false, message: auth.error.message },
        { status: auth.error.status }
      );
    }

    // Only super-admins can delete messages
    if (!["super-admin", "root-super-admin"].includes(auth.role)) {
      return NextResponse.json(
        { success: false, message: "Only super-admins can delete messages" },
        { status: 403 }
      );
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;
    console.log("[DELETE /messages/:id] Accessing ID:", id);

    if (!id || id === "undefined" || id === "null") {
      return NextResponse.json(
        { success: false, message: "Valid message ID is required" },
        { status: 400 }
      );
    }

    const result = await ContactController.delete(id);

    return NextResponse.json(
      {
        success: true,
        message: result.message,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error.message === "Message not found") {
      return NextResponse.json(
        { success: false, message: "Message not found" },
        { status: 404 }
      );
    }

    console.error("Delete message error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete message",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/messages/stats - Get message statistics
 * Protected: Admin/Super-admin only
 */

import { NextResponse } from "next/server";
import { ContactController } from "@/controllers/ContactController";
import { authenticateAdminRequest } from "@/lib/adminAuth";

export async function GET(request) {
  try {
    // Authenticate admin user
    const auth = await authenticateAdminRequest(request);
    if (auth.error) {
      return NextResponse.json(
        { success: false, message: auth.error.message },
        { status: auth.error.status }
      );
    }

    const stats = await ContactController.getStats();

    return NextResponse.json(
      {
        success: true,
        data: stats,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get stats error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch statistics",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * API: GET /api/admin/transfer-super-admin/status
 * Get the status of a transfer session
 * Query: sessionId
 */

import { authenticateAdminRequest } from "@/lib/adminAuth";
import { TransferSuperAdminController } from "@/controllers/TransferSuperAdminController";
import { apiResponse } from "@/lib/apiResponse";

export async function GET(request) {
  try {
    // 1. Authenticate user
    const auth = await authenticateAdminRequest(request);
    if (auth.error) {
      return apiResponse.error(auth.error.message, auth.error.status);
    }

    // 2. Get sessionId from query
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return apiResponse.error("Session ID is required", 400);
    }

    // 3. Get session status
    const status = await TransferSuperAdminController.getSessionStatus(sessionId);

    return apiResponse.success(status, "Transfer session status retrieved");
  } catch (error) {
    console.error("[Transfer/Status] Error:", error.message);
    return apiResponse.error(error.message, 400);
  }
}

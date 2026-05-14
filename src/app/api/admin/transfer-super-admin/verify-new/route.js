/**
 * API: POST /api/admin/transfer-super-admin/verify-new
 * Verifies the OTP sent to the new Super Admin email
 * Requires: JWT authentication
 * Body: { sessionId: string, code: string }
 */

import { authenticateAdminRequest } from "@/lib/adminAuth";
import { TransferSuperAdminController } from "@/controllers/TransferSuperAdminController";
import { apiResponse } from "@/lib/apiResponse";
import dbConnect from "@/lib/dbConnect";
import { SuperAdminTransferSession } from "@/models/Portfolio";

// In-memory store for OTP attempt counting (in production, use Redis)
const otpAttempts = new Map();

export async function POST(request) {
  try {
    // 1. Authenticate user
    const auth = await authenticateAdminRequest(request);
    if (auth.error) {
      return apiResponse.error(auth.error.message, auth.error.status);
    }

    // 2. Get request body
    const body = await request.json();
    if (!body.sessionId || !body.code) {
      return apiResponse.error("Session ID and OTP code are required", 400);
    }

    // 3. Rate limiting for OTP attempts
    await dbConnect();
    const session = await SuperAdminTransferSession.findOne({ sessionId: body.sessionId });
    if (!session) {
      return apiResponse.error("Invalid transfer session", 400);
    }

    const attemptKey = `${body.sessionId}:new`;
    const attempts = otpAttempts.get(attemptKey) || 0;
    if (attempts >= 5) {
      return apiResponse.error("Too many OTP verification attempts. Please try again later.", 429);
    }

    // 4. Verify new email OTP
    try {
      const result = await TransferSuperAdminController.verifyNewEmail(
        body.sessionId,
        body.code
      );

      console.log("[Transfer/VerifyNew] Verification successful");
      otpAttempts.delete(attemptKey); // Clear attempts on success
      return apiResponse.success(result, "New email verified successfully");
    } catch (error) {
      otpAttempts.set(attemptKey, attempts + 1);
      throw error;
    }
  } catch (error) {
    console.error("[Transfer/VerifyNew] Error:", error.message);
    return apiResponse.error(error.message, 400);
  }
}

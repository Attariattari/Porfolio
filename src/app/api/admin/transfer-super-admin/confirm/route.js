/**
 * API: POST /api/admin/transfer-super-admin/confirm
 * Final confirmation - completes the Super Admin email transfer
 * Requires: JWT authentication as current Super Admin
 * Body: { sessionId: string, confirmationCode: string }
 */

import { authenticateAdminRequest } from "@/lib/adminAuth";
import { TransferSuperAdminController } from "@/controllers/TransferSuperAdminController";
import { apiResponse } from "@/lib/apiResponse";
import dbConnect from "@/lib/dbConnect";
import { SuperAdminTransferSession, SiteConfig } from "@/models/Portfolio";

export async function POST(request) {
  try {
    // 1. Authenticate user
    const auth = await authenticateAdminRequest(request);
    if (auth.error) {
      return apiResponse.error(auth.error.message, auth.error.status);
    }

    // 2. Get request body
    const body = await request.json();
    if (!body.sessionId || !body.confirmationCode) {
      return apiResponse.error("Session ID and confirmation code are required", 400);
    }

    // 3. Additional security: Verify user is still current Super Admin
    await dbConnect();
    const siteConfig = await SiteConfig.findOne();
    if (!siteConfig) {
      return apiResponse.error("Site configuration error", 500);
    }

    const session = await SuperAdminTransferSession.findOne({ sessionId: body.sessionId });
    if (!session) {
      return apiResponse.error("Invalid transfer session", 400);
    }

    // Verify the user initiating is still the current Super Admin
    if (auth.user.email.toLowerCase() !== siteConfig.superAdminEmail.toLowerCase()) {
      console.warn(
        "[Transfer/Confirm] User attempting to confirm is not current Super Admin:",
        auth.user.email
      );
      return apiResponse.error(
        "Only the current Super Admin can confirm the transfer",
        403
      );
    }

    // 4. Confirm transfer
    const result = await TransferSuperAdminController.confirmTransfer(
      body.sessionId,
      body.confirmationCode
    );

    console.log("[Transfer/Confirm] Transfer confirmed successfully");
    return apiResponse.success(result, "Super Admin transfer completed");
  } catch (error) {
    console.error("[Transfer/Confirm] Error:", error.message);
    return apiResponse.error(error.message, 400);
  }
}

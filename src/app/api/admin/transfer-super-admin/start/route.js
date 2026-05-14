/**
 * API: POST /api/admin/transfer-super-admin/start
 * Initiates the Super Admin email transfer process
 * Requires: JWT authentication as current Super Admin
 * Body: { newEmail: string }
 */

import { NextResponse } from "next/server";
import { authenticateAdminRequest } from "@/lib/adminAuth";
import { TransferSuperAdminController } from "@/controllers/TransferSuperAdminController";
import { getClientIPFromRequest, getUserAgentFromRequest } from "@/lib/transferUtils";
import { apiResponse } from "@/lib/apiResponse";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(request) {
  try {
    // 1. Authenticate user
    const auth = await authenticateAdminRequest(request);
    if (auth.error) {
      return apiResponse.error(auth.error.message, auth.error.status);
    }

    // 2. Get request body
    const body = await request.json();
    if (!body.newEmail) {
      return apiResponse.error("New email address is required", 400);
    }

    // 3. Rate limiting - max 5 transfer initiations per hour per IP
    const ipAddress = getClientIPFromRequest(request);
    const rateLimitCheck = checkRateLimit(ipAddress, {
      maxRequests: 5,
      windowMs: 60 * 60 * 1000, // 1 hour
    });

    if (!rateLimitCheck.allowed) {
      console.warn("[Transfer/Start] Rate limit exceeded for IP:", ipAddress);
      return apiResponse.error(
        "Too many transfer attempts. Please try again later.",
        429,
        { resetTime: rateLimitCheck.resetTime }
      );
    }

    // 4. Get user agent
    const userAgent = getUserAgentFromRequest(request);

    // 5. Initiate transfer
    const result = await TransferSuperAdminController.initiateTransfer(
      { newEmail: body.newEmail },
      auth.user,
      ipAddress,
      userAgent
    );

    console.log("[Transfer/Start] Transfer initiated successfully");
    return apiResponse.success(result, "Transfer process initiated");
  } catch (error) {
    console.error("[Transfer/Start] Error:", error.message);
    return apiResponse.error(error.message, 400);
  }
}

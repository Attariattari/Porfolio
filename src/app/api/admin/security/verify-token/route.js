/**
 * API: POST /api/admin/security/verify-token
 * Verifies a password reset token is valid and returns user email
 * No authentication required (token IS the authentication)
 * Body: { token: string }
 */

import { NextResponse } from "next/server";
import { verifyPasswordResetToken } from "@/lib/passwordReset";
import { apiResponse } from "@/lib/apiResponse";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/AdminModels";

export async function POST(request) {
  try {
    // 1. Get request body
    const body = await request.json();
    if (!body.token) {
      return apiResponse.error("Reset token is required", 400);
    }

    // 2. Verify token signature and expiration
    const tokenVerification = await verifyPasswordResetToken(body.token);
    if (!tokenVerification.valid) {
      console.warn("[Security/VerifyToken] Invalid token:", tokenVerification.error);
      return apiResponse.error(tokenVerification.error, 400);
    }

    // 3. Connect to database
    await dbConnect();

    // 4. Verify user exists and token matches
    const user = await User.findOne({ email: tokenVerification.email });
    if (!user) {
      return apiResponse.error("User not found", 404);
    }

    // 5. Check if token has already been used
    if (user.passwordResetUsed) {
      console.warn("[Security/VerifyToken] Token already used:", tokenVerification.email);
      return apiResponse.error("This reset link has already been used. Please request a new one.", 400);
    }

    // 6. Check if token matches stored token
    if (user.passwordResetToken !== body.token) {
      console.warn("[Security/VerifyToken] Token mismatch for user:", tokenVerification.email);
      return apiResponse.error("Invalid or expired token", 400);
    }

    // 7. Check if token has expired
    if (user.passwordResetExpires && new Date() > user.passwordResetExpires) {
      console.warn("[Security/VerifyToken] Token expired for user:", tokenVerification.email);
      return apiResponse.error("Reset token has expired. Please request a new one.", 400);
    }

    console.log("[Security/VerifyToken] ✅ Token verified successfully for:", tokenVerification.email);

    // 8. Return token is valid
    return apiResponse.success(
      {
        valid: true,
        email: user.email,
        expiresAt: user.passwordResetExpires,
      },
      "Token is valid"
    );
  } catch (error) {
    console.error("[Security/VerifyToken] Error:", error.message);
    return apiResponse.error("Token verification failed", 500);
  }
}

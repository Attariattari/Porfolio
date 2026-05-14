/**
 * API: POST /api/admin/security/change-passkey
 * Changes the user's passkey securely using reset token
 * Uses one-time reset token for verification
 * Body: { token: string, currentPasskey?: string, newPasskey: string, confirmPasskey: string }
 */

import { NextResponse } from "next/server";
import { verifyPasswordResetToken, validatePasskeyStrength, hashPasskey } from "@/lib/passwordReset";
import { apiResponse } from "@/lib/apiResponse";
import { invalidateUserSessions } from "@/lib/sessionInvalidation";
import { login } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/AdminModels";
import crypto from "crypto";

export async function POST(request) {
  try {
    // 1. Get request body
    const body = await request.json();
    if (!body.token) {
      return apiResponse.error("Reset token is required", 400);
    }

    if (!body.newPasskey || !body.confirmPasskey) {
      return apiResponse.error("New passkey and confirmation are required", 400);
    }

    // 2. Verify token signature and expiration
    const tokenVerification = await verifyPasswordResetToken(body.token);
    if (!tokenVerification.valid) {
      console.warn("[Security/ChangePasskey] Invalid token:", tokenVerification.error);
      return apiResponse.error(tokenVerification.error, 400);
    }

    // 3. Validate passkey strength
    const passkeyValidation = validatePasskeyStrength(body.newPasskey);
    if (!passkeyValidation.valid) {
      return apiResponse.error(
        `Passkey is too weak. Requirements: ${passkeyValidation.errors.join(", ")}`,
        400,
        { metrics: passkeyValidation.metrics }
      );
    }

    // 4. Verify passkeys match
    if (body.newPasskey !== body.confirmPasskey) {
      return apiResponse.error("Passkeys do not match", 400);
    }

    // 5. Connect to database
    await dbConnect();

    // 6. Get user
    const user = await User.findOne({ email: tokenVerification.email });
    if (!user) {
      return apiResponse.error("User not found", 404);
    }

    // 7. Verify token has not been used
    if (user.passwordResetUsed) {
      console.warn("[Security/ChangePasskey] Token already used:", tokenVerification.email);
      return apiResponse.error("This reset link has already been used. Please request a new one.", 400);
    }

    // 8. Verify token matches
    if (user.passwordResetToken !== body.token) {
      console.warn("[Security/ChangePasskey] Token mismatch for user:", tokenVerification.email);
      return apiResponse.error("Invalid or expired token", 400);
    }

    // 9. Verify token expiration
    if (user.passwordResetExpires && new Date() > user.passwordResetExpires) {
      console.warn("[Security/ChangePasskey] Token expired for user:", tokenVerification.email);
      return apiResponse.error("Reset token has expired. Please request a new one.", 400);
    }

    // 10. ✅ All verifications passed - Update passkey
    const hashedPasskey = hashPasskey(body.newPasskey);
    
    user.passkey = hashedPasskey;
    user.passwordResetToken = null; // Clear the token
    user.passwordResetExpires = null;
    user.passwordResetUsed = true; // Mark as used
    user.lastPasswordChangedAt = new Date();
    user.passwordChangeReason = 'user_initiated';
    user.passwordChangeInvalidatesSessionsBefore = new Date();
    
    await user.save();
    
    console.log("[Security/ChangePasskey] ✅ Passkey changed successfully for:", user.email);

    // 11. Invalidate all sessions for this user (they need to login again with new passkey)
    invalidateUserSessions(user.email);
    console.log("[Security/ChangePasskey] ✅ All sessions invalidated for:", user.email);

    // 12. ✅ Auto-login user with the NEW passkey
    // This generates fresh secure sessions/cookies immediately
    console.log("[Security/ChangePasskey] 🔄 Attempting auto-login...");
    const loginResult = await login(user.email, body.newPasskey);
    
    if (!loginResult.success) {
      console.warn("[Security/ChangePasskey] ⚠️ Auto-login failed, but passkey was changed.");
    } else {
      console.log("[Security/ChangePasskey] ✅ Auto-login successful for:", user.email);
    }

    // 13. Return success with token and user info for client-side storage
    return apiResponse.success(
      {
        success: true,
        email: user.email,
        message: "Passkey changed successfully. You are now logged in.",
        changedAt: user.lastPasswordChangedAt,
        token: loginResult.token, // Return new JWT token
        user: {
          email: user.email,
          role: user.role,
        }
      },
      "Passkey updated and session established"
    );
  } catch (error) {
    console.error("[Security/ChangePasskey] Error:", error.message);
    return apiResponse.error("Failed to change passkey", 500);
  }
}

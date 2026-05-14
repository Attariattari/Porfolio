/**
 * TransferSuperAdminController
 * Manages the complete Super Admin email transfer workflow
 * Handles verification, session management, and audit logging
 */

import dbConnect from "@/lib/dbConnect";
import { SiteConfig, SuperAdminOTP, SuperAdminTransferSession } from "@/models/Portfolio";
import User from "@/models/AdminModels";
import { sendEmail } from "@/lib/mailer";
import {
  generateOTPCode,
  generateTransferSessionId,
  hashOTP,
  verifyOTP,
  getOTPExpirationTime,
  getTransferSessionExpirationTime,
  validateEmail,
  isDisposableEmail,
  sanitizeEmail,
  isCurrentSuperAdmin,
  isTransferFrequencyAllowed,
  generateOTPEmailContent,
  generateTransferCompletionEmail,
  generateSecurityAlertEmail,
  createAuditLogEntry,
  maskEmail,
  getSuperAdminConfigWithFallback,
} from "@/lib/transferUtils";
import {
  generateTemporaryPasskey,
  generatePasswordResetToken,
  generatePasswordChangeEmailContent,
  generateSessionInvalidationNotice,
} from "@/lib/passwordReset";
import { invalidateUserSessions } from "@/lib/sessionInvalidation";

export const TransferSuperAdminController = {
  /**
   * STEP 1: Initialize transfer process
   * - Verify current user is Super Admin
   * - Validate new email
   * - Create transfer session
   * - Send OTP to current Super Admin email
   */
  initiateTransfer: async (data, userFromJWT, ipAddress, userAgent) => {
    try {
      console.log("[TransferController.initiateTransfer] Starting...");

      await dbConnect();

      // 1. Get current site config with fallback to .env
      const siteConfigResult = await getSuperAdminConfigWithFallback(dbConnect, SiteConfig);
      let siteConfig = await SiteConfig.findOne();
      
      // If SiteConfig was just initialized, refresh it
      if (!siteConfig || siteConfigResult.isInitialized) {
        siteConfig = await SiteConfig.findOne();
      }

      if (!siteConfig) {
        throw new Error("Site configuration could not be initialized");
      }

      console.log("[TransferController] Current Super Admin Email:", siteConfigResult.superAdminEmail, "From DB:", siteConfigResult.isFromDatabase);

      // 2. Verify user is current Super Admin
      if (!isCurrentSuperAdmin(userFromJWT, siteConfig)) {
        console.warn("[TransferController] User is not current Super Admin:", userFromJWT.email);
        throw new Error("Only the current Super Admin can initiate transfers");
      }

      // 3. Validate new email
      const newEmail = sanitizeEmail(data.newEmail);
      if (!validateEmail(newEmail)) {
        throw new Error("Invalid email format");
      }

      if (newEmail === siteConfig.superAdminEmail) {
        throw new Error("New email must be different from current Super Admin email");
      }

      if (isDisposableEmail(newEmail)) {
        throw new Error("Disposable/temporary email addresses are not allowed");
      }

      // 4. Check transfer frequency
      if (!isTransferFrequencyAllowed(siteConfig.superAdminTransferHistory)) {
        throw new Error("Super Admin transfers can only occur once every 24 hours");
      }

      // 5. ⭐ PROFESSIONAL CHECK: Verify user exists in database
      // User MUST be registered before they can become Super Admin
      const existingUser = await User.findOne({ email: newEmail });
      
      if (!existingUser) {
        console.warn("[TransferController] User not found in database:", newEmail);
        throw new Error(
          `User with email "${newEmail}" not found. They must register an account first before becoming Super Admin.`
        );
      }

      // 6. Verify existing user is not already a Super Admin
      if (existingUser.role === 'super-admin') {
        console.warn("[TransferController] Email already is Super Admin:", newEmail);
        throw new Error("This email is already a Super Admin");
      }

      console.log("[TransferController] ✅ User exists and is eligible for Super Admin transfer:", newEmail);

      // 6. Create transfer session
      const sessionId = generateTransferSessionId();
      const transferSession = new SuperAdminTransferSession({
        sessionId,
        currentEmail: siteConfig.superAdminEmail,
        newEmail,
        initiatedBy: userFromJWT.email,
        status: 'pending',
        ipAddress,
        userAgent,
        expiresAt: getTransferSessionExpirationTime(24),
      });

      await transferSession.save();
      console.log("[TransferController] Transfer session created:", sessionId);

      // 7. Generate OTP for current Super Admin
      const otpCode = generateOTPCode();
      const hashedOTP = hashOTP(otpCode);
      const otpRecord = new SuperAdminOTP({
        email: siteConfig.superAdminEmail,
        code: hashedOTP,
        plainCode: otpCode, // For logging/debugging (cleanup after 1 min)
        type: 'transfer_current',
        transferSessionId: sessionId,
        expiresAt: getOTPExpirationTime(3),
        maxAttempts: 5,
      });

      await otpRecord.save();
      console.log("[TransferController] OTP created for current Super Admin");

      // 8. Send OTP email to current Super Admin
      const emailContent = generateOTPEmailContent(otpCode, 'current', newEmail);
      const emailResult = await sendEmail({
        to: siteConfig.superAdminEmail,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
        fromName: "Muhyo Tech - Security",
      });

      if (!emailResult.success) {
        console.error("[TransferController] Failed to send OTP email:", emailResult.error);
        throw new Error(`Failed to send verification email: ${emailResult.error}. Please check your mail configuration.`);
      }

      // 9. Create audit log
      const auditLog = createAuditLogEntry({
        action: 'transfer_initiated',
        currentEmail: siteConfig.superAdminEmail,
        newEmail,
        initiatedBy: userFromJWT.email,
        ipAddress,
        userAgent,
        status: 'success',
      });

      console.log("[TransferController] Audit log:", auditLog);

      return {
        success: true,
        sessionId,
        message: `OTP sent to ${maskEmail(siteConfig.superAdminEmail)}. Check email for verification code.`,
        maskedEmail: maskEmail(siteConfig.superAdminEmail),
        expiresIn: 3, // minutes
      };
    } catch (err) {
      console.error("[TransferController.initiateTransfer] Error:", err.message);
      throw err;
    }
  },

  /**
   * STEP 2: Verify current Super Admin OTP
   */
  verifyCurrentEmail: async (sessionId, otpCode) => {
    try {
      console.log("[TransferController.verifyCurrentEmail] Starting...");

      await dbConnect();

      // 1. Get transfer session
      const session = await SuperAdminTransferSession.findOne({ sessionId });
      if (!session) {
        throw new Error("Invalid or expired transfer session");
      }

      if (session.status !== 'pending') {
        throw new Error(`Transfer session is already in status: ${session.status}`);
      }

      if (new Date() > session.expiresAt) {
        throw new Error("Transfer session has expired");
      }

      // 2. Get OTP record
      const otpRecord = await SuperAdminOTP.findOne({
        transferSessionId: sessionId,
        type: 'transfer_current',
        email: session.currentEmail,
      });

      if (!otpRecord) {
        throw new Error("OTP not found for this transfer session");
      }

      if (new Date() > otpRecord.expiresAt) {
        throw new Error("OTP code has expired");
      }

      if (otpRecord.verified) {
        throw new Error("Current email has already been verified");
      }

      // 3. Check attempt count
      if (otpRecord.attempts >= otpRecord.maxAttempts) {
        await SuperAdminTransferSession.updateOne(
          { sessionId },
          { status: 'failed', failureReason: 'Max OTP attempts exceeded' }
        );
        throw new Error("Maximum verification attempts exceeded. Transfer cancelled.");
      }

      // 4. Verify OTP
      if (!verifyOTP(otpCode, otpRecord.code)) {
        otpRecord.attempts += 1;
        await otpRecord.save();
        throw new Error(`Invalid OTP code. ${otpRecord.maxAttempts - otpRecord.attempts} attempts remaining.`);
      }

      // 5. Mark OTP as verified
      otpRecord.verified = true;
      otpRecord.verifiedAt = new Date();
      await otpRecord.save();

      // 6. Update transfer session
      session.currentEmailVerified = true;
      session.currentEmailVerifiedAt = new Date();
      session.status = 'current_verified';
      await session.save();

      console.log("[TransferController] Current email verified for session:", sessionId);

      // 7. Generate OTP for new email
      const newOtpCode = generateOTPCode();
      const hashedNewOTP = hashOTP(newOtpCode);
      const newOtpRecord = new SuperAdminOTP({
        email: session.newEmail,
        code: hashedNewOTP,
        plainCode: newOtpCode,
        type: 'transfer_new',
        transferSessionId: sessionId,
        expiresAt: getOTPExpirationTime(3),
        maxAttempts: 5,
      });

      await newOtpRecord.save();
      console.log("[TransferController] OTP created for new email");

      // 8. Send OTP to new email
      const emailContent = generateOTPEmailContent(newOtpCode, 'new', session.newEmail);
      const emailResult = await sendEmail({
        to: session.newEmail,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
        fromName: "Muhyo Tech - Security",
      });

      if (!emailResult.success) {
        console.error("[TransferController] Failed to send OTP to new email:", emailResult.error);
        throw new Error(`Failed to send verification email to ${session.newEmail}: ${emailResult.error}`);
      }

      return {
        success: true,
        message: `Verification code sent to ${maskEmail(session.newEmail)}`,
        maskedEmail: maskEmail(session.newEmail),
        nextStep: 'verify_new_email',
        expiresIn: 3,
      };
    } catch (err) {
      console.error("[TransferController.verifyCurrentEmail] Error:", err.message);
      throw err;
    }
  },

  /**
   * STEP 3: Verify new email OTP
   */
  verifyNewEmail: async (sessionId, otpCode) => {
    try {
      console.log("[TransferController.verifyNewEmail] Starting...");

      await dbConnect();

      // 1. Get transfer session
      const session = await SuperAdminTransferSession.findOne({ sessionId });
      if (!session) {
        throw new Error("Invalid or expired transfer session");
      }

      if (session.status !== 'current_verified') {
        throw new Error("Current email must be verified first");
      }

      if (new Date() > session.expiresAt) {
        throw new Error("Transfer session has expired");
      }

      // 2. Get OTP record for new email
      const otpRecord = await SuperAdminOTP.findOne({
        transferSessionId: sessionId,
        type: 'transfer_new',
        email: session.newEmail,
      });

      if (!otpRecord) {
        throw new Error("OTP not found for new email");
      }

      if (new Date() > otpRecord.expiresAt) {
        throw new Error("OTP code has expired");
      }

      if (otpRecord.verified) {
        throw new Error("New email has already been verified");
      }

      // 3. Check attempt count
      if (otpRecord.attempts >= otpRecord.maxAttempts) {
        await SuperAdminTransferSession.updateOne(
          { sessionId },
          { status: 'failed', failureReason: 'Max OTP attempts exceeded for new email' }
        );
        throw new Error("Maximum verification attempts exceeded. Transfer cancelled.");
      }

      // 4. Verify OTP
      if (!verifyOTP(otpCode, otpRecord.code)) {
        otpRecord.attempts += 1;
        await otpRecord.save();
        throw new Error(`Invalid OTP code. ${otpRecord.maxAttempts - otpRecord.attempts} attempts remaining.`);
      }

      // 5. Mark OTP as verified
      otpRecord.verified = true;
      otpRecord.verifiedAt = new Date();
      await otpRecord.save();

      // 6. Update transfer session
      session.newEmailVerified = true;
      session.newEmailVerifiedAt = new Date();
      session.status = 'new_verified';
      await session.save();

      console.log("[TransferController] New email verified for session:", sessionId);

      return {
        success: true,
        message: "New email verified successfully",
        nextStep: 'final_confirmation',
        warning: "After final confirmation, your current Super Admin status will be transferred and all sessions will be invalidated.",
      };
    } catch (err) {
      console.error("[TransferController.verifyNewEmail] Error:", err.message);
      throw err;
    }
  },

  /**
   * STEP 4: Final confirmation - complete the transfer
   * PROFESSIONAL CREDENTIAL TRANSITION:
   * - Keeps old Super Admin's credentials intact
   * - Generates TEMPORARY passkey for new Super Admin
   * - Sends secure link to create custom passkey
   * - Invalidates all old sessions
   * - Enterprise-grade security
   */
  confirmTransfer: async (sessionId, confirmationCode) => {
    try {
      console.log("[TransferController.confirmTransfer] Starting professional credential transition...");

      await dbConnect();

      // 1. Validate confirmation code (must be 'CONFIRM' to prevent accidental clicks)
      if (confirmationCode !== 'CONFIRM') {
        throw new Error("Invalid confirmation code");
      }

      // 2. Get transfer session
      const session = await SuperAdminTransferSession.findOne({ sessionId });
      if (!session) {
        throw new Error("Invalid or expired transfer session");
      }

      if (session.status !== 'new_verified') {
        throw new Error("Both emails must be verified before final confirmation");
      }

      if (new Date() > session.expiresAt) {
        throw new Error("Transfer session has expired");
      }

      // 3. Get latest site config
      const siteConfig = await SiteConfig.findOne();
      if (!siteConfig) {
        throw new Error("Site configuration not found");
      }

      // 4. ATOMIC: Start the transfer process
      // Update SiteConfig with new Super Admin email
      siteConfig.superAdminEmail = session.newEmail;
      siteConfig.superAdminTransferHistory = siteConfig.superAdminTransferHistory || [];
      siteConfig.superAdminTransferHistory.push({
        oldEmail: session.currentEmail,
        newEmail: session.newEmail,
        transferredAt: new Date(),
        transferredBy: session.initiatedBy,
        ipAddress: session.ipAddress,
        verified: true,
      });

      await siteConfig.save();
      console.log("[TransferController] ✅ SiteConfig updated with new Super Admin");

      // 5. ⭐ PROFESSIONAL: Generate TEMPORARY passkey for new Super Admin
      const temporaryPasskey = generateTemporaryPasskey();
      console.log("[TransferController] ✅ Generated temporary passkey for new Super Admin (16 chars)");

      // 6. ⭐ PROFESSIONAL: Generate secure password reset token (JWT-based, 15 min validity)
      const passwordResetToken = await generatePasswordResetToken(session.newEmail, 15);
      console.log("[TransferController] ✅ Generated password reset token (15 min validity)");

      // 7. Update existing user to Super Admin (user MUST already exist)
      const newAdminUser = await User.findOne({ email: session.newEmail });
      
      if (!newAdminUser) {
        throw new Error(
          `User with email "${session.newEmail}" not found. This should have been validated during transfer initiation.`
        );
      }

      // Update the existing user to super-admin with TEMPORARY passkey
      newAdminUser.role = 'super-admin';
      newAdminUser.status = 'approved';
      newAdminUser.name = 'SuperAdmin';
      newAdminUser.passkey = temporaryPasskey;
      
      // ⭐ PROFESSIONAL: Store password reset token for secure passkey change
      newAdminUser.passwordResetToken = passwordResetToken;
      newAdminUser.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      newAdminUser.passwordResetUsed = false;
      newAdminUser.passwordChangeReason = 'admin_transfer';
      
      await newAdminUser.save();
      console.log("[TransferController] ✅ Updated existing user to Super Admin with temporary passkey");

      // 8. ⭐ PROFESSIONAL: Keep old Super Admin's credentials intact (IMPORTANT!)
      // Only downgrade their role, DO NOT change their passkey
      const oldAdminUser = await User.findOne({ email: session.currentEmail });
      if (oldAdminUser && oldAdminUser.role === 'super-admin') {
        oldAdminUser.role = 'admin';
        // NOTE: Passkey is NOT changed here - this is the key fix!
        await oldAdminUser.save();
        console.log("[TransferController] ✅ Downgraded old Super Admin to admin (credentials preserved)");
      }

      // 9. Update transfer session
      session.status = 'completed';
      session.completedAt = new Date();
      await session.save();

      // 10. ⭐ PROFESSIONAL: Generate reset link with secure token
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      const resetLink = `${baseUrl}/admin/security/change-passkey?token=${encodeURIComponent(passwordResetToken)}`;
      console.log("[TransferController] ✅ Generated password reset link (token embedded)");

      // 11. ⭐ PROFESSIONAL: Send comprehensive email to NEW Super Admin
      // Includes both temporary passkey AND reset link
      const newAdminEmailContent = generatePasswordChangeEmailContent({
        email: session.newEmail,
        temporaryPasskey,
        resetLink,
        expirationMinutes: 15,
      });

      const emailResult1 = await sendEmail({
        to: session.newEmail,
        subject: newAdminEmailContent.subject,
        html: newAdminEmailContent.html,
        text: newAdminEmailContent.text,
        fromName: "Muhyo Tech - Security",
      });

      if (!emailResult1.success) {
        console.error("[TransferController] Failed to send credentials email to new Super Admin");
        throw new Error(`Failed to send credentials to new Super Admin: ${emailResult1.error}`);
      }

      console.log("[TransferController] ✅ Sent credentials & reset link email to new Super Admin");

      // 12. Send notification to OLD Super Admin
      // Inform them about the transfer and their credential status
      const oldAdminNotification = generateSessionInvalidationNotice(session.currentEmail);
      
      await sendEmail({
        to: session.currentEmail,
        subject: oldAdminNotification.subject,
        html: oldAdminNotification.html,
        text: oldAdminNotification.text,
        fromName: "Muhyo Tech - Security",
      });

      console.log("[TransferController] ✅ Sent session invalidation notice to old Super Admin");

      // 13. Invalidate all old Super Admin sessions
      invalidateUserSessions(session.currentEmail);
      console.log("[TransferController] ✅ Invalidated all old Super Admin sessions");

      // 14. Return success with transfer details
      return {
        success: true,
        message: "Super Admin transfer completed successfully with professional credential transition",
        oldEmail: session.currentEmail,
        newEmail: session.newEmail,
        temporaryPasskey, // For display in UI (if needed)
        resetLinkValid: true,
        resetLinkExpiration: 15, // minutes
        action: 'LOGOUT_ALL_USERS', // Signal to frontend to logout
      };
    } catch (err) {
      console.error("[TransferController.confirmTransfer] Error:", err.message);

      // Update session with failure reason
      try {
        await SuperAdminTransferSession.updateOne(
          { sessionId },
          { status: 'failed', failureReason: err.message }
        );
      } catch (updateErr) {
        console.error("Failed to update session status:", updateErr);
      }

      throw err;
    }
  },

  /**
   * Get transfer session status
   */
  getSessionStatus: async (sessionId) => {
    try {
      await dbConnect();

      const session = await SuperAdminTransferSession.findOne({ sessionId });
      if (!session) {
        throw new Error("Transfer session not found");
      }

      if (new Date() > session.expiresAt) {
        return {
          status: 'expired',
          message: 'Transfer session has expired',
        };
      }

      return {
        status: session.status,
        currentEmail: maskEmail(session.currentEmail),
        newEmail: maskEmail(session.newEmail),
        currentEmailVerified: session.currentEmailVerified,
        newEmailVerified: session.newEmailVerified,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
      };
    } catch (err) {
      console.error("[TransferController.getSessionStatus] Error:", err.message);
      throw err;
    }
  },

  /**
   * Cancel transfer session
   */
  cancelTransfer: async (sessionId, reason = 'User cancelled') => {
    try {
      await dbConnect();

      const session = await SuperAdminTransferSession.findOne({ sessionId });
      if (!session) {
        throw new Error("Transfer session not found");
      }

      session.status = 'cancelled';
      session.failureReason = reason;
      await session.save();

      // Clean up OTP records
      await SuperAdminOTP.deleteMany({ transferSessionId: sessionId });

      console.log("[TransferController] Transfer cancelled:", sessionId);

      return {
        success: true,
        message: 'Transfer process cancelled',
      };
    } catch (err) {
      console.error("[TransferController.cancelTransfer] Error:", err.message);
      throw err;
    }
  },
};

/**
 * Super Admin Email Transfer Utility Functions
 * Handles OTP generation, validation, session management, and security
 */

import crypto from 'crypto';

const getCurrentYear = () => new Date().getFullYear();

/**
 * Generate a secure 6-digit OTP code
 * @returns {string} Random 6-digit code
 */
export function generateOTPCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generate a secure session ID for transfer process
 * @returns {string} UUID-like session ID
 */
export function generateTransferSessionId() {
  return `transfer_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
}

/**
 * Hash OTP code for secure storage (one-way encryption)
 * @param {string} code - Plain OTP code
 * @returns {string} Hashed code
 */
export function hashOTP(code) {
  return crypto
    .createHash('sha256')
    .update(code + process.env.OTP_SALT || 'otp_salt_key_2026')
    .digest('hex');
}

/**
 * Verify OTP code against hash
 * @param {string} plainCode - Plain OTP code from user
 * @param {string} hashedCode - Stored hashed code
 * @returns {boolean} True if codes match
 */
export function verifyOTP(plainCode, hashedCode) {
  const computedHash = hashOTP(plainCode);
  return computedHash === hashedCode;
}

/**
 * Generate OTP expiration time (3 minutes from now)
 * @returns {Date} Expiration datetime
 */
export function getOTPExpirationTime(minutesFromNow = 3) {
  return new Date(Date.now() + minutesFromNow * 60 * 1000);
}

/**
 * Generate transfer session expiration time (24 hours from now)
 * @returns {Date} Expiration datetime
 */
export function getTransferSessionExpirationTime(hoursFromNow = 24) {
  return new Date(Date.now() + hoursFromNow * 60 * 60 * 1000);
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

/**
 * Check if email is disposable/temporary
 * @param {string} email - Email to check
 * @returns {boolean} True if appears to be disposable
 */
export function isDisposableEmail(email) {
  const disposableDomains = [
    'tempmail.com',
    'guerrillamail.com',
    '10minutemail.com',
    'mailinator.com',
    'throwaway.email',
    'yopmail.com',
    'temp-mail.org',
  ];

  const domain = email.split('@')[1]?.toLowerCase();
  return disposableDomains.includes(domain);
}

/**
 * Sanitize email for database storage
 * @param {string} email - Raw email
 * @returns {string} Sanitized email
 */
export function sanitizeEmail(email) {
  return email.trim().toLowerCase();
}

/**
 * Verify current user is Super Admin
 * @param {Object} user - User object from JWT
 * @param {Object} siteConfig - Site config with superAdminEmail
 * @returns {boolean} True if user is current Super Admin
 */
export function isCurrentSuperAdmin(user, siteConfig) {
  if (!user || !siteConfig) return false;
  return user.email?.toLowerCase() === siteConfig.superAdminEmail?.toLowerCase();
}

/**
 * Get rate limit key for transfer OTP attempts
 * @param {string} email - Email attempting OTP
 * @returns {string} Rate limit key
 */
export function getOTPRateLimitKey(email) {
  return `otp_attempts:${sanitizeEmail(email)}`;
}

/**
 * Get rate limit key for transfer initiations
 * @param {string} ipAddress - Client IP
 * @returns {string} Rate limit key
 */
export function getTransferRateLimitKey(ipAddress) {
  return `transfer_init:${ipAddress}`;
}

/**
 * Extract client IP from request
 * @param {Request} request - Next.js request object
 * @returns {string} Client IP address
 */
export function getClientIPFromRequest(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  return request.headers.get('cf-connecting-ip') || 'unknown';
}

/**
 * Get User-Agent from request
 * @param {Request} request - Next.js request object
 * @returns {string} User agent string
 */
export function getUserAgentFromRequest(request) {
  return request.headers.get('user-agent') || 'unknown';
}

/**
 * Create audit log entry
 * @param {Object} data - Log data
 * @returns {Object} Formatted audit log
 */
export function createAuditLogEntry({
  action,
  currentEmail,
  newEmail,
  initiatedBy,
  ipAddress,
  userAgent,
  status,
  reason,
}) {
  return {
    action, // 'transfer_initiated', 'transfer_verified', 'transfer_completed', etc.
    currentEmail: sanitizeEmail(currentEmail),
    newEmail: sanitizeEmail(newEmail),
    initiatedBy: sanitizeEmail(initiatedBy),
    ipAddress,
    userAgent,
    status, // 'success', 'failed', 'cancelled'
    reason,
    timestamp: new Date(),
  };
}

/**
 * Mask email for display (security best practice)
 * @param {string} email - Email to mask
 * @returns {string} Masked email
 */
export function maskEmail(email) {
  const [local, domain] = email.split('@');
  const masked = local.substring(0, 2) + '*'.repeat(Math.max(0, local.length - 4)) + local.substring(local.length - 2);
  return `${masked}@${domain}`;
}

/**
 * Check if transfer is too frequent (prevent abuse)
 * @param {Array} transferHistory - Previous transfers from SiteConfig
 * @returns {boolean} True if transfer attempted too recently
 */
export function isTransferFrequencyAllowed(transferHistory = []) {
  if (transferHistory.length === 0) return true;

  const lastTransfer = transferHistory[transferHistory.length - 1];
  if (!lastTransfer.transferredAt) return true;

  const minsSinceLastTransfer = (Date.now() - new Date(lastTransfer.transferredAt).getTime()) / (1000 * 60);
  // Allow transfer only if at least 1 minute has passed (Dev mode)
  return minsSinceLastTransfer >= 1;
}

/**
 * Generate OTP email content
 * @param {string} code - OTP code
 * @param {string} type - 'current' or 'new'
 * @param {string} newEmail - New email (for context)
 * @returns {Object} { subject, html, text }
 */
export function generateOTPEmailContent(code, type, newEmail = null) {
  if (type === 'current') {
    return {
      subject: '🔐 Verify Super Admin Transfer Request - 6-Digit Code',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb; border-radius: 12px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px; color: white; text-align: center; margin-bottom: 20px;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 700;">Super Admin Verification</h1>
            <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">Verify your current account ownership</p>
          </div>

          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e5e7eb;">
            <p style="margin: 0 0 16px 0; color: #1f2937; font-size: 14px;">
              You've requested to transfer Super Admin authority. As the current Super Admin, please verify this action using the code below:
            </p>

            <div style="background: #f3f4f6; padding: 24px; border-radius: 8px; text-align: center; margin: 16px 0; border: 2px dashed #d1d5db;">
              <p style="margin: 0 0 12px 0; font-size: 12px; color: #6b7280; letter-spacing: 2px; font-weight: 600;">YOUR VERIFICATION CODE</p>
              <p style="margin: 0; font-size: 32px; color: #667eea; font-weight: 700; letter-spacing: 4px; font-family: 'Courier New', monospace;">${code}</p>
              <p style="margin: 8px 0 0 0; font-size: 12px; color: #9ca3af;">This code expires in 3 minutes</p>
            </div>

            <div style="background: #fef3c7; padding: 12px; border-radius: 6px; border-left: 4px solid #f59e0b; margin: 16px 0;">
              <p style="margin: 0; font-size: 13px; color: #92400e;">
                <strong>⚠️ Security Notice:</strong> If you didn't request this, immediately contact your team!
              </p>
            </div>
          </div>

          <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 20px;">
            <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #1f2937; font-weight: 600;">What happens next?</h3>
            <ol style="margin: 0; padding-left: 20px; font-size: 13px; color: #4b5563; line-height: 1.8;">
              <li>Submit this code in the verification page</li>
              <li>The new email owner will verify their account</li>
              <li>Final confirmation will be requested</li>
              <li>Transfer completes with full session reset</li>
            </ol>
          </div>

          <div style="background: #f0f9ff; padding: 16px; border-radius: 8px; border-left: 4px solid #3b82f6; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 12px; color: #1e40af;">
              <strong>🔒 This is a secure verification email.</strong> Do not share this code with anyone.
            </p>
          </div>

          <div style="border-top: 1px solid #e5e7eb; padding-top: 16px; text-align: center;">
            <p style="margin: 0; font-size: 11px; color: #6b7280;">
              © ${getCurrentYear()} Muhyo Tech. All rights reserved.
            </p>
          </div>
        </div>
      `,
      text: `
        SUPER ADMIN VERIFICATION
        
        You've requested to transfer Super Admin authority. Verify this action:
        
        CODE: ${code}
        (Expires in 3 minutes)
        
        If you didn't request this, contact your team immediately!
        
        Do not share this code with anyone.
      `,
    };
  }

  // type === 'new'
  return {
    subject: '🔐 Verify Your New Super Admin Email - 6-Digit Code',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb; border-radius: 12px;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 12px; color: white; text-align: center; margin-bottom: 20px;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 700;">Email Verification</h1>
          <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">Verify your new Super Admin account</p>
        </div>

        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e5e7eb;">
          <p style="margin: 0 0 16px 0; color: #1f2937; font-size: 14px;">
            Welcome! Your email has been selected as the new Super Admin account. Verify this email ownership using the code below:
          </p>

          <div style="background: #f3f4f6; padding: 24px; border-radius: 8px; text-align: center; margin: 16px 0; border: 2px dashed #d1d5db;">
            <p style="margin: 0 0 12px 0; font-size: 12px; color: #6b7280; letter-spacing: 2px; font-weight: 600;">VERIFICATION CODE</p>
            <p style="margin: 0; font-size: 32px; color: #10b981; font-weight: 700; letter-spacing: 4px; font-family: 'Courier New', monospace;">${code}</p>
            <p style="margin: 8px 0 0 0; font-size: 12px; color: #9ca3af;">This code expires in 3 minutes</p>
          </div>

          <div style="background: #fef3c7; padding: 12px; border-radius: 6px; border-left: 4px solid #f59e0b; margin: 16px 0;">
            <p style="margin: 0; font-size: 13px; color: #92400e;">
              <strong>⚠️ Security Notice:</strong> You will become the primary Super Admin after verification.
            </p>
          </div>
        </div>

        <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 20px;">
          <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #1f2937; font-weight: 600;">What does this mean?</h3>
          <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #4b5563; line-height: 1.8;">
            <li>You'll have full administrative access</li>
            <li>All user and system management permissions</li>
            <li>Access to all settings and configurations</li>
            <li>Responsibility for system security</li>
          </ul>
        </div>

        <div style="background: #f0f9ff; padding: 16px; border-radius: 8px; border-left: 4px solid #3b82f6; margin-bottom: 20px;">
          <p style="margin: 0; font-size: 12px; color: #1e40af;">
            <strong>🔒 Secure Transfer Process:</strong> Your email ownership has been pre-verified by the current Super Admin.
          </p>
        </div>

        <div style="border-top: 1px solid #e5e7eb; padding-top: 16px; text-align: center;">
          <p style="margin: 0; font-size: 11px; color: #6b7280;">
            © ${getCurrentYear()} Muhyo Tech. All rights reserved.
          </p>
        </div>
      </div>
    `,
    text: `
      EMAIL VERIFICATION

      Welcome! Your email has been selected as the new Super Admin account. Verify this email:

      CODE: ${code}
      (Expires in 3 minutes)

      After verification, you'll have full administrative access.
      
      Do not share this code with anyone.
    `,
  };
}

/**
 * Generate transfer completion notification email
 * @param {string} oldEmail - Previous Super Admin email
 * @param {string} newEmail - New Super Admin email
 * @returns {Object} { subject, html, text }
 */
export function generateTransferCompletionEmail(oldEmail, newEmail) {
  return {
    subject: '✅ Super Admin Transfer Completed Successfully',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb; border-radius: 12px;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 12px; color: white; text-align: center; margin-bottom: 20px;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 700;">✅ Transfer Complete</h1>
          <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">Super Admin authority has been successfully transferred</p>
        </div>

        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e5e7eb;">
          <p style="margin: 0 0 16px 0; color: #1f2937; font-size: 14px;">
            The Super Admin authority transfer has been completed successfully.
          </p>

          <div style="background: #f0fdf4; padding: 16px; border-radius: 8px; border: 1px solid #dcfce7; margin: 16px 0;">
            <p style="margin: 0; font-size: 13px; color: #166534;"><strong>Previous Super Admin:</strong> ${oldEmail}</p>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #166534;"><strong>New Super Admin:</strong> ${newEmail}</p>
          </div>

          <div style="background: #fef3c7; padding: 12px; border-radius: 6px; border-left: 4px solid #f59e0b; margin: 16px 0;">
            <p style="margin: 0; font-size: 13px; color: #92400e;">
              <strong>🔔 Important:</strong> All active sessions have been terminated for security. Please log in again with your Super Admin account.
            </p>
          </div>
        </div>

        <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 20px;">
          <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #1f2937; font-weight: 600;">What changed?</h3>
          <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #4b5563; line-height: 1.8;">
            <li>New email is now the primary Super Admin account</li>
            <li>All authentication tokens have been regenerated</li>
            <li>Previous Super Admin login credentials are inactive</li>
            <li>Full audit logs have been recorded</li>
          </ul>
        </div>

        <div style="background: #f0f9ff; padding: 16px; border-radius: 8px; border-left: 4px solid #3b82f6; margin-bottom: 20px;">
          <p style="margin: 0; font-size: 12px; color: #1e40af;">
            <strong>🔒 Security:</strong> This transfer has been fully logged and audited. Original Super Admin has been notified.
          </p>
        </div>

        <div style="border-top: 1px solid #e5e7eb; padding-top: 16px; text-align: center;">
          <p style="margin: 0; font-size: 11px; color: #6b7280;">
            © ${getCurrentYear()} Muhyo Tech. All rights reserved.
          </p>
        </div>
      </div>
    `,
    text: `
      SUPER ADMIN TRANSFER COMPLETED

      Transfer completed successfully!

      Previous Super Admin: ${oldEmail}
      New Super Admin: ${newEmail}

      IMPORTANT: All active sessions have been terminated.
      Please log in again with the new Super Admin account.

      This transfer has been fully logged and audited.
    `,
  };
}

/**
 * Generate security alert email for suspicious activity
 * @param {string} email - Email to alert
 * @param {Object} details - Transfer details
 * @returns {Object} { subject, html, text }
 */
export function generateSecurityAlertEmail(email, details) {
  return {
    subject: '⚠️ Super Admin Transfer Attempt - Action Required',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb; border-radius: 12px;">
        <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; border-radius: 12px; color: white; text-align: center; margin-bottom: 20px;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 700;">⚠️ Security Alert</h1>
          <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">Super Admin transfer attempt detected</p>
        </div>

        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e5e7eb;">
          <p style="margin: 0 0 16px 0; color: #1f2937; font-size: 14px;">
            A Super Admin transfer has been initiated for your account. If this wasn't authorized, take action immediately.
          </p>

          <div style="background: #fef2f2; padding: 16px; border-radius: 8px; border: 1px solid #fee2e2; margin: 16px 0;">
            <p style="margin: 0; font-size: 13px; color: #991b1b;"><strong>Transfer From:</strong> ${details.currentEmail || 'Unknown'}</p>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #991b1b;"><strong>Transfer To:</strong> ${details.newEmail || 'Unknown'}</p>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #991b1b;"><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #991b1b;"><strong>From IP:</strong> ${details.ipAddress || 'Unknown'}</p>
          </div>
        </div>

        <div style="background: #fef3c7; padding: 16px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 16px 0;">
          <p style="margin: 0 0 12px 0; font-size: 13px; color: #92400e;">
            <strong>✅ If this is authorized:</strong> No action needed. The transfer will complete with both email verifications.
          </p>
          <p style="margin: 12px 0 0 0; font-size: 13px; color: #92400e;">
            <strong>❌ If this is NOT authorized:</strong> The transfer will be automatically cancelled if not verified within 3 minutes. All sessions remain secure.
          </p>
        </div>

        <div style="border-top: 1px solid #e5e7eb; padding-top: 16px; text-align: center;">
          <p style="margin: 0; font-size: 11px; color: #6b7280;">
            © ${getCurrentYear()} Muhyo Tech. All rights reserved.
          </p>
        </div>
      </div>
    `,
    text: `
      SECURITY ALERT - Super Admin Transfer

      A Super Admin transfer has been initiated:

      From: ${details.currentEmail || 'Unknown'}
      To: ${details.newEmail || 'Unknown'}
      Time: ${new Date().toLocaleString()}
      IP: ${details.ipAddress || 'Unknown'}

      If authorized: No action needed. Transfer will complete with email verifications.
      If NOT authorized: The transfer will auto-cancel. Your sessions are secure.

      Contact your team immediately if suspicious!
    `,
  };
}

/**
 * Professional Super Admin Configuration with Fallback System
 * This ensures we ALWAYS have a valid superAdminEmail:
 * 1. Database first (SiteConfig.superAdminEmail)
 * 2. Then environment variable fallback (.env SUPER_ADMIN_EMAIL)
 * 3. On first run, auto-initializes SiteConfig with .env values
 * 
 * @param {Object} dbConnect - Database connection function
 * @param {Object} SiteConfigModel - Mongoose SiteConfig model
 * @returns {Object} { superAdminEmail, superAdminName, isFromDatabase, isInitialized }
 * 
 * @example
 * const config = await getSuperAdminConfigWithFallback(dbConnect, SiteConfig);
 * console.log(config.superAdminEmail); // 'admin@example.com'
 * console.log(config.isFromDatabase); // true or false
 */
export async function getSuperAdminConfigWithFallback(dbConnect, SiteConfigModel) {
  try {
    // Environment variable fallbacks
    const ENV_SUPER_ADMIN_EMAIL = (
      process.env.SUPER_ADMIN_EMAIL ||
      process.env.SUPERADMIN_EMAIL ||
      "attariattari549@gmail.com"
    ).toLowerCase();

    const ENV_SUPER_ADMIN_NAME = (
      process.env.SUPER_ADMIN_NAME ||
      process.env.SUPERADMIN_NAME ||
      "Pir Ghulam Muhyo Din"
    );

    // Ensure DB connection
    await dbConnect();

    // Try to get existing SiteConfig
    let siteConfig = await SiteConfigModel.findOne();

    // If no SiteConfig exists, create one with .env values (first run)
    if (!siteConfig) {
      console.log("[getSuperAdminConfigWithFallback] First run: Creating SiteConfig with .env values");
      
      siteConfig = await SiteConfigModel.create({
        siteTitle: "Muhyo Tech",
        siteAccent: "Tech",
        adminName: ENV_SUPER_ADMIN_NAME,
        email: ENV_SUPER_ADMIN_EMAIL,
        superAdminEmail: ENV_SUPER_ADMIN_EMAIL,
        superAdminTransferHistory: [],
      });

      console.log("[getSuperAdminConfigWithFallback] ✅ SiteConfig initialized from .env:", {
        email: siteConfig.superAdminEmail,
        name: siteConfig.adminName,
      });

      return {
        superAdminEmail: siteConfig.superAdminEmail,
        superAdminName: siteConfig.adminName,
        isFromDatabase: true,
        isInitialized: true, // First initialization
      };
    }

    // SiteConfig exists, verify superAdminEmail is set
    let superAdminEmail = siteConfig.superAdminEmail || ENV_SUPER_ADMIN_EMAIL;

    // If superAdminEmail is empty, update with .env value
    if (!siteConfig.superAdminEmail) {
      console.log("[getSuperAdminConfigWithFallback] ⚠️ SiteConfig missing superAdminEmail, updating from .env");
      
      siteConfig.superAdminEmail = ENV_SUPER_ADMIN_EMAIL;
      await siteConfig.save();

      superAdminEmail = ENV_SUPER_ADMIN_EMAIL;
    }

    return {
      superAdminEmail: superAdminEmail.toLowerCase(),
      superAdminName: siteConfig.adminName || ENV_SUPER_ADMIN_NAME,
      isFromDatabase: true,
      isInitialized: false,
    };
  } catch (error) {
    console.error("[getSuperAdminConfigWithFallback] Error:", error.message);

    // Final fallback - return .env value if DB fails
    const ENV_SUPER_ADMIN_EMAIL = (
      process.env.SUPER_ADMIN_EMAIL ||
      process.env.SUPERADMIN_EMAIL ||
      "attariattari549@gmail.com"
    ).toLowerCase();

    return {
      superAdminEmail: ENV_SUPER_ADMIN_EMAIL,
      superAdminName: process.env.SUPER_ADMIN_NAME || "Pir Ghulam Muhyo Din",
      isFromDatabase: false, // Using fallback
      isInitialized: false,
    };
  }
}

/**
 * Professional Password Reset System
 * Handles secure token generation, validation, and passkey management
 * Enterprise-grade security for Super Admin credential transitions
 */

import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { getAuthSecretValue } from '@/lib/authSecret';

const getCurrentYear = () => new Date().getFullYear();

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || getAuthSecretValue()
);

/**
 * Generate a secure random temporary passkey
 * Strong entropy, suitable for immediate use
 * @returns {string} Random temporary passkey (16 chars)
 */
export function generateTemporaryPasskey() {
  return crypto.randomBytes(12).toString('hex').toUpperCase();
}

/**
 * Generate a secure password reset token (JWT-based)
 * Includes user email, expiration, and one-time use validation
 * @param {string} email - User email
 * @param {number} expirationMinutes - Token validity in minutes (default 15)
 * @returns {string} Signed JWT token
 */
export async function generatePasswordResetToken(email, expirationMinutes = 15) {
  if (!email) {
    throw new Error('Email is required to generate reset token');
  }

  const token = await new SignJWT({
    email: email.toLowerCase(),
    type: 'password_reset',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${expirationMinutes}m`)
    .sign(JWT_SECRET);

  return token;
}

/**
 * Verify and decode password reset token
 * Validates signature, expiration, and type
 * @param {string} token - JWT token from reset link
 * @returns {Object} { valid: boolean, email: string, error: string }
 */
export async function verifyPasswordResetToken(token) {
  try {
    if (!token) {
      return { valid: false, error: 'Token is required' };
    }

    const { payload: decoded } = await jwtVerify(token, JWT_SECRET);

    // Validate token type
    if (decoded.type !== 'password_reset') {
      return { valid: false, error: 'Invalid token type' };
    }

    // Validate email
    if (!decoded.email) {
      return { valid: false, error: 'Invalid token: missing email' };
    }

    return {
      valid: true,
      email: decoded.email,
      issuedAt: decoded.iat ? new Date(decoded.iat * 1000) : null,
    };
  } catch (error) {
    if (error.code === 'ERR_JWT_EXPIRED') {
      return { valid: false, error: 'Token has expired' };
    }
    if (error.code === 'ERR_JWS_SIGNATURE_VERIFICATION_FAILED' || error.code === 'ERR_JWT_INVALID') {
      return { valid: false, error: 'Invalid or tampered token' };
    }
    return { valid: false, error: `Token validation failed: ${error.message}` };
  }
}

/**
 * Generate reset link for email
 * Creates full URL with token
 * @param {string} token - JWT token
 * @param {string} baseUrl - Website base URL (e.g., https://muhyo-tech.com)
 * @returns {string} Full reset link
 */
export function generatePasswordResetLink(token, baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000') {
  const cleanBaseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
  return `${cleanBaseUrl}/admin/security/change-passkey?token=${encodeURIComponent(token)}`;
}

/**
 * Validate passkey strength
 * Ensures minimum security standards
 * @param {string} passkey - Passkey to validate
 * @returns {Object} { valid: boolean, strength: 'weak'|'medium'|'strong', errors: string[] }
 */
export function validatePasskeyStrength(passkey) {
  const errors = [];

  if (!passkey || passkey.length === 0) {
    errors.push('Passkey is required');
    return { valid: false, strength: 'weak', errors };
  }

  if (passkey.length < 8) {
    errors.push('Passkey must be at least 8 characters long');
  }

  if (passkey.length > 128) {
    errors.push('Passkey must not exceed 128 characters');
  }

  const hasUpperCase = /[A-Z]/.test(passkey);
  const hasLowerCase = /[a-z]/.test(passkey);
  const hasNumbers = /\d/.test(passkey);
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(passkey);

  let strength = 'weak';
  if (hasUpperCase && hasLowerCase && hasNumbers) {
    strength = 'medium';
  }
  if (hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChars) {
    strength = 'strong';
  }

  return {
    valid: errors.length === 0,
    strength,
    errors,
    metrics: {
      length: passkey.length,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChars,
    },
  };
}

/**
 * Hash passkey for secure storage using bcrypt
 * @param {string} passkey - Plain passkey
 * @returns {string} Hashed passkey
 */
export function hashPasskey(passkey) {
  if (!passkey) {
    throw new Error('Passkey is required for hashing');
  }

  const saltRounds = 10;
  return bcrypt.hashSync(passkey, saltRounds);
}

/**
 * Verify passkey against hash using bcrypt.compare
 * @param {string} plainPasskey - Plain passkey from user
 * @param {string} hashedPasskey - Stored hashed passkey
 * @returns {Promise<Object>} { valid: boolean, method: 'bcrypt'|'sha256'|'plain'|null }
 */
export async function verifyPasskey(plainPasskey, hashedPasskey) {
  if (!plainPasskey || !hashedPasskey) {
    return { valid: false, method: null };
  }

  try {
    // 1. Try bcrypt verification (Preferred/Current)
    if (hashedPasskey.startsWith('$2a$') || hashedPasskey.startsWith('$2b$') || hashedPasskey.startsWith('$2y$')) {
      const valid = await bcrypt.compare(plainPasskey, hashedPasskey);
      return { valid, method: valid ? 'bcrypt' : null };
    }

    // 2. Fallback to Legacy SHA-256 (Migration Path)
    if (/^[a-f0-9]{64}$/i.test(hashedPasskey)) {
      const salt = process.env.PASSKEY_SALT || 'passkey_salt_key_2026';
      const legacyHash = crypto
        .createHash('sha256')
        .update(plainPasskey + salt)
        .digest('hex');
      
      const match = crypto.timingSafeEqual(
        Buffer.from(legacyHash, 'hex'),
        Buffer.from(hashedPasskey, 'hex')
      );

      if (match) {
        console.log('[Security] Legacy SHA-256 hash verified. Migration recommended.');
      }
      return { valid: match, method: match ? 'sha256' : null };
    }

    // 3. Final Fallback: Plain Text (Dangerous, but handles unhashed legacy data)
    const plainMatch = plainPasskey === hashedPasskey;
    if (plainMatch) {
      console.warn('[Security] Plain-text passkey verified. IMMEDIATE MIGRATION REQUIRED.');
    }
    return { valid: plainMatch, method: plainMatch ? 'plain' : null };

  } catch (error) {
    console.error('[Security] Passkey verification error:', error);
    return { valid: false, method: null };
  }
}

/**
 * Generate reset link expiration time
 * @param {number} minutesFromNow - Minutes until expiration (default 15)
 * @returns {Date} Expiration datetime
 */
export function getResetLinkExpirationTime(minutesFromNow = 15) {
  return new Date(Date.now() + minutesFromNow * 60 * 1000);
}

/**
 * Create professional password change email content
 * Includes temporary passkey and secure reset link
 * @param {Object} data - { email, temporaryPasskey, resetLink, expirationMinutes }
 * @returns {Object} { subject, html, text }
 */
export function generatePasswordChangeEmailContent(data) {
  const {
    email,
    temporaryPasskey,
    resetLink,
    expirationMinutes = 15,
  } = data;

  const subject = '🔐 Your Super Admin Credentials - Temporary Access & Custom Passkey';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
        body { 
            margin: 0; 
            padding: 0; 
            background-color: #f1f5f9;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            -webkit-font-smoothing: antialiased;
        }
        .wrapper { 
            width: 100%; 
            background-color: #f1f5f9; 
            padding: 40px 20px; 
        }
        .main { 
            background-color: #ffffff; 
            margin: 0 auto; 
            width: 100%; 
            max-width: 600px; 
            border-radius: 24px; 
            overflow: hidden;
            box-shadow: 0 20px 50px rgba(0,0,0,0.08);
            border: 1px solid rgba(0,0,0,0.05);
        }
        .header { 
            background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
            color: #ffffff; 
            padding: 48px 40px; 
            text-align: center; 
        }
        .logo { 
            font-size: 24px; 
            font-weight: 800; 
            letter-spacing: -0.05em; 
            text-transform: uppercase; 
            font-style: italic; 
        }
        .logo span { color: #ffffff; }
        .header h1 {
            margin: 16px 0 0 0;
            font-size: 28px;
            font-weight: 800;
            line-height: 1.2;
        }
        .header p {
            margin: 12px 0 0 0;
            font-size: 14px;
            opacity: 0.95;
        }
        .content { 
            padding: 48px 40px; 
        }
        .section { 
            margin-bottom: 32px; 
        }
        .section-title {
            font-size: 14px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #0ea5e9;
            margin-bottom: 16px;
        }
        .p { 
            font-size: 16px; 
            line-height: 1.7; 
            color: #475569; 
            margin: 0 0 16px 0; 
        }
        .credential-box {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            border: 2px solid #0ea5e9;
            border-radius: 12px;
            padding: 24px;
            margin: 16px 0;
        }
        .credential-label {
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #0369a1;
            margin-bottom: 8px;
            display: block;
        }
        .credential-value {
            font-size: 16px;
            font-weight: 700;
            font-family: 'Monaco', 'Courier New', monospace;
            color: #0c4a6e;
            word-break: break-all;
            background: #ffffff;
            padding: 12px;
            border-radius: 6px;
            border: 1px solid #cffafe;
        }
        .cta-button { 
            background-color: #0ea5e9; 
            color: #ffffff !important; 
            padding: 16px 32px; 
            text-decoration: none; 
            border-radius: 12px; 
            font-size: 14px; 
            font-weight: 800; 
            text-transform: uppercase; 
            letter-spacing: 0.1em; 
            display: inline-block;
            box-shadow: 0 4px 15px rgba(14, 165, 233, 0.3);
            margin-top: 12px;
        }
        .cta-button:hover {
            background-color: #0284c7;
        }
        .warning-box {
            background: #fef3c7;
            border: 1px solid #fcd34d;
            border-radius: 8px;
            padding: 16px;
            margin: 16px 0;
        }
        .warning-title {
            color: #92400e;
            font-weight: 800;
            font-size: 13px;
            margin: 0 0 8px 0;
        }
        .warning-text {
            color: #78350f;
            font-size: 13px;
            line-height: 1.6;
            margin: 0;
        }
        .steps {
            background: #f8fafc;
            border-left: 4px solid #0ea5e9;
            padding: 16px;
            border-radius: 4px;
            margin: 16px 0;
        }
        .step-item {
            margin-bottom: 12px;
            font-size: 14px;
            line-height: 1.6;
            color: #334155;
        }
        .step-number {
            display: inline-block;
            background: #0ea5e9;
            color: white;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            text-align: center;
            line-height: 24px;
            font-weight: 700;
            margin-right: 8px;
        }
        .footer { 
            text-align: center; 
            padding: 32px 40px; 
            font-size: 12px; 
            color: #94a3b8; 
            line-height: 1.6;
            background: #f8fafc;
            border-top: 1px solid #e2e8f0;
        }
        .footer a {
            color: #0ea5e9;
            text-decoration: none;
        }
        .divider {
            height: 1px;
            background: #e2e8f0;
            margin: 24px 0;
        }
        @media screen and (max-width: 600px) {
            .content { padding: 32px 24px; }
            .header { padding: 32px 24px; }
            .footer { padding: 24px 20px; }
            .header h1 { font-size: 24px; }
        }
    </style>
</head>
<body>
<div class="wrapper">
    <div class="main">
        <div class="header">
            <div class="logo">muhyo <span>tech</span></div>
            <h1>🔐 Super Admin Transfer Complete</h1>
            <p>Your secure credentials are ready</p>
        </div>

        <div class="content">
            <div class="section">
                <p class="p" style="font-size: 17px; color: #1e293b; font-weight: 600;">
                    Congratulations! You are now the official Super Admin of Muhyo Tech.
                </p>
            </div>

            <div class="divider"></div>

            <div class="section">
                <div class="section-title">🎟️ Temporary Access Credentials</div>
                <p class="p">
                    Use these credentials to login immediately while you set up your custom passkey:
                </p>
                <div class="credential-box">
                    <label class="credential-label">📧 Email</label>
                    <div class="credential-value">${email}</div>
                    
                    <label class="credential-label" style="margin-top: 12px;">🔑 Temporary Passkey</label>
                    <div class="credential-value">${temporaryPasskey}</div>
                </div>
                <p class="p" style="font-size: 13px; color: #64748b; margin-top: 12px;">
                    Save this temporary passkey somewhere safe. This is your immediate access credential.
                </p>
            </div>

            <div class="divider"></div>

            <div class="section">
                <div class="section-title">🛡️ Create Your Custom Passkey</div>
                <p class="p">
                    For enhanced security, we recommend creating your own custom passkey immediately. This one-time secure link is valid for <strong>${expirationMinutes} minutes</strong>.
                </p>
                <a href="${resetLink}" class="cta-button">
                    ✓ Create Custom Passkey Now
                </a>
                <p class="p" style="font-size: 13px; color: #64748b; margin-top: 12px;">
                    Link expires in ${expirationMinutes} minutes for security reasons.
                </p>
            </div>

            <div class="divider"></div>

            <div class="section">
                <div class="section-title">📋 Next Steps</div>
                <div class="steps">
                    <div class="step-item">
                        <span class="step-number">1</span>
                        Copy your temporary passkey
                    </div>
                    <div class="step-item">
                        <span class="step-number">2</span>
                        Visit /admin/login and authenticate with your email
                    </div>
                    <div class="step-item">
                        <span class="step-number">3</span>
                        Click "Create Custom Passkey" link to set your own credentials
                    </div>
                    <div class="step-item">
                        <span class="step-number">4</span>
                        Use your custom passkey for future logins
                    </div>
                </div>
            </div>

            <div class="warning-box">
                <div class="warning-title">⚠️ Security Alert</div>
                <div class="warning-text">
                    <strong>New Session Started:</strong> All previous Super Admin sessions have been invalidated for security. You may need to login on any connected devices.
                </div>
            </div>

            <div class="warning-box" style="background: #f0fdf4; border-color: #bbf7d0;">
                <div class="warning-title" style="color: #166534;">✓ Secure Design</div>
                <div class="warning-text" style="color: #15803d;">
                    This email contains sensitive credentials. Do not forward or share. Delete after saving your credentials securely.
                </div>
            </div>
        </div>

        <div class="footer">
            <p style="margin: 0 0 12px 0;">
                <strong style="color: #1e293b;">Muhyo Tech</strong> — Professional Full Stack Development
            </p>
            <p style="margin: 0;">
                If you didn't authorize this transfer, contact support immediately.
            </p>
        </div>
    </div>
</div>
</body>
</html>
  `;

  const text = `
SUPER ADMIN TRANSFER COMPLETE

Congratulations! You are now the official Super Admin of Muhyo Tech.

TEMPORARY ACCESS CREDENTIALS:
Email: ${email}
Temporary Passkey: ${temporaryPasskey}

Save this passkey somewhere safe for immediate login access.

CREATE YOUR CUSTOM PASSKEY:
For enhanced security, create your own custom passkey using this secure link:
${resetLink}

This link is valid for ${expirationMinutes} minutes.

NEXT STEPS:
1. Copy your temporary passkey
2. Visit /admin/login and authenticate
3. Click "Create Custom Passkey" to set your own credentials
4. Use your custom passkey for future logins

SECURITY ALERT:
All previous Super Admin sessions have been invalidated.
You may need to login on any connected devices.

Do not forward this email or share these credentials.

---
© ${getCurrentYear()} Muhyo Tech - Professional Development
If you didn't authorize this, contact support immediately.
  `;

  return { subject, html, text };
}

/**
 * Generate session invalidation notice for security alerts
 * @param {string} email - User email
 * @returns {Object} { subject, html, text }
 */
export function generateSessionInvalidationNotice(email) {
  const subject = '🔐 Security Alert: Your Sessions Have Been Invalidated';

  const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, sans-serif; background: #f1f5f9; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; }
        .header { color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 20px; }
        .h1 { margin: 0; font-size: 24px; font-weight: 700; }
        .content { color: #475569; line-height: 1.7; }
        .alert { background: #fef3c7; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #f59e0b; }
        .alert strong { color: #92400e; }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <div class="h1">🔐 Session Security Notice</div>
    </div>
    <div class="content">
        <p>Your Super Admin credentials have been transferred and all active sessions have been invalidated for security.</p>
        <div class="alert">
            <strong>What this means:</strong> You have been logged out on all devices. This is normal and expected after a Super Admin transfer.
        </div>
        <p>You can login again with your new credentials at any time.</p>
        <p>If you did not expect this, contact your team immediately.</p>
    </div>
</div>
</body>
</html>
  `;

  const text = `
SESSION SECURITY NOTICE

Your Super Admin credentials have been transferred and all active sessions have been invalidated for security.

What this means: You have been logged out on all devices. This is normal and expected after a Super Admin transfer.

You can login again with your new credentials at any time.

If you did not expect this, contact your team immediately.
  `;

  return { subject, html, text };
}

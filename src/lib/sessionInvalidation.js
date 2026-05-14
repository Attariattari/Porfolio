/**
 * Session Invalidation Utilities
 * Handles logout and session cleanup for security transfers
 */

import { jwtVerify, SignJWT } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "fallback_muhyo_secret_32_chars_long_!!!",
);

/**
 * Generate a logout token (essentially an invalidation marker)
 * In production, store these in Redis/DB to prevent token reuse
 */
export async function generateLogoutToken() {
  const now = Math.floor(Date.now() / 1000);

  const token = await new SignJWT({
    type: "logout_marker",
    timestamp: now,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(now + 86400) // 24 hours
    .sign(SECRET);

  return token;
}

/**
 * Invalidate all sessions for a user by their email
 * In production, implement with Redis:
 * 
 * redis.setex(`invalidate:${email}`, 86400, Date.now())
 * 
 * Then check in verifyAuth:
 * const invalidated = redis.get(`invalidate:${email}`)
 * if (invalidated && invalidated > tokenIssuedAt) { throw new Error("Session invalidated") }
 */
export function invalidateUserSessions(email) {
  // This would be called server-side in production
  // For now, this marks the user for invalidation
  console.log("[SessionInvalidation] Marked for invalidation:", email);
  return {
    action: "INVALIDATE_ALL_SESSIONS",
    email: email.toLowerCase(),
    timestamp: new Date(),
  };
}

/**
 * Invalidate a specific token
 * In production with Redis:
 * redis.setex(`blacklist:${token}`, 86400, true)
 */
export function invalidateSpecificToken(token) {
  console.log("[SessionInvalidation] Token marked for blacklist");
  return {
    action: "BLACKLIST_TOKEN",
    timestamp: new Date(),
  };
}

/**
 * Generate client-side logout script
 * This clears all auth cookies and storage
 */
export function generateLogoutScript() {
  return `
    (function() {
      console.log('[SessionInvalidation] Executing client-side logout');
      
      // Clear cookies
      const cookies = document.cookie.split(';');
      cookies.forEach(cookie => {
        const name = cookie.split('=')[0].trim();
        if (name.includes('auth') || name.includes('token') || name.includes('admin')) {
          document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/admin;';
        }
      });
      
      // Clear localStorage
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.includes('auth') || key.includes('token') || key.includes('admin')) {
          localStorage.removeItem(key);
        }
      });
      
      // Clear sessionStorage
      sessionStorage.clear();
      
      // Redirect to login
      window.location.href = '/admin/login';
    })();
  `;
}

/**
 * Generate response with logout instruction
 */
export function createLogoutResponse(message = "All sessions have been invalidated") {
  return {
    success: true,
    message,
    action: "LOGOUT_ALL_USERS",
    timestamp: new Date(),
  };
}

/**
 * Admin Authentication Middleware
 * Verifies JWT token and admin/super-admin role
 */

import { jwtVerify } from "jose";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/AdminModels";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "fallback_muhyo_secret_32_chars_long_!!!",
);

const ROOT_ADMIN_EMAIL = (process.env.SUPER_ADMIN_EMAIL || "attariattari549@gmail.com").toLowerCase();

/**
 * Verify JWT token and extract user info
 */
export async function verifyAuth(request) {
  try {
    // Try multiple methods to get the token
    let token = null;

    // Method 1: Check Authorization header (Bearer token)
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.slice(7);
      console.log("[AUTH] Token found in Authorization header");
    }

    // Method 2: Check cookies
    if (!token) {
      const cookieHeader = request.headers.get("cookie");
      if (cookieHeader) {
        console.log("[AUTH] Parsing cookies...");
        // Split by semicolon and find the token
        const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
          const [name, ...valueParts] = cookie.split("=");
          const trimmedName = name.trim();
          const value = valueParts.join("=").trim();
          if (value) {
            try {
              acc[trimmedName] = decodeURIComponent(value);
            } catch (e) {
              acc[trimmedName] = value;
            }
          }
          return acc;
        }, {});

        console.log("[AUTH] Cookies found:", Object.keys(cookies));
        
        // Try all possible cookie names (priority order)
        token = 
          cookies.admin_auth_token ||  // httpOnly cookie 
          cookies.admin_token ||       // Non-httpOnly cookie (for client access)
          cookies.auth_token || 
          cookies.authToken || 
          cookies.token;

        if (token) {
          console.log("[AUTH] Token found in cookies");
        }
      }
    }

    // Method 3: Check URL query parameter (for testing)
    if (!token && request.nextUrl?.searchParams) {
      token = request.nextUrl.searchParams.get("token");
      if (token) {
        console.log("[AUTH] Token found in query params");
      }
    }

    if (!token) {
      console.warn("[AUTH] ❌ No token found in headers, cookies, or query");
      return { authorized: false, error: "❌ No authentication token provided. Please login first." };
    }

    console.log("[AUTH] ✓ Token found, verifying JWT...");

    // Verify JWT
    const verified = await jwtVerify(token, SECRET);
    const payload = verified.payload;

    console.log("[AUTH] ✓ JWT verified, userId:", payload.userId);

    // Connect to DB and verify user still exists and has admin role
    await dbConnect();
    const user = await User.findById(payload.userId).lean();

    if (!user) {
      console.warn("[AUTH] ❌ User not found in database:", payload.userId);
      return { authorized: false, error: "❌ User not found" };
    }

    if (user.status !== "approved") {
      console.warn("[AUTH] ❌ User not approved:", user._id, user.status);
      return { authorized: false, error: "❌ User account not approved" };
    }

    // ⭐ ROOT AUTHORITY PROTECTION: Email from .env ALWAYS overrides DB role
    let finalRole = user.role;
    if (user.email?.toLowerCase() === ROOT_ADMIN_EMAIL) {
      finalRole = "root-super-admin";
    }

    // Check if user has staff/admin or super-admin role
    // 'user' in this system refers to a base-level staff member
    if (!["user", "admin", "super-admin", "root-super-admin"].includes(finalRole)) {
      console.warn("[AUTH] ❌ Insufficient permissions. Role:", finalRole);
      return { authorized: false, error: "❌ Insufficient permissions. Staff access required." };
    }

    console.log("[AUTH] ✅ Authentication successful for:", user.email);

    return {
      authorized: true,
      userId: user._id.toString(),
      role: finalRole,
      user: { ...user, role: finalRole },
    };
  } catch (error) {
    console.error("[AUTH] ❌ Verification error:", error.message);
    if (error.message.includes("invalid signature")) {
      return { authorized: false, error: "❌ Invalid or expired token. Please login again." };
    }
    if (error.message.includes("exp claim")) {
      return { authorized: false, error: "❌ Token expired. Please login again." };
    }
    return { authorized: false, error: "❌ Authentication failed. Please login." };
  }
}

/**
 * Middleware wrapper for API routes
 * Usage: const auth = await authenticateAdminRequest(request);
 * 
 * Returns:
 * - Success: { authorized: true, userId, role, user }
 * - Failure: { error: { message: "...", status: 401 } }
 */
export async function authenticateAdminRequest(request) {
  const auth = await verifyAuth(request);

  if (!auth.authorized) {
    return {
      error: {
        message: auth.error || "❌ Authentication required",
        status: 401,
      },
    };
  }

  return auth;
}

/**
 * Enterprise Security & Authentication Middleware
 * 
 * - Full Server-Side Authentication & Session Sliding for /admin and /api/admin
 * - Role-Based Access Control (RBAC) enforcement
 * - Search Engine Crawl Isolation (X-Robots-Tag: noindex, nofollow, noarchive)
 * - Enterprise Security Headers (CSP, HSTS, X-Frame-Options, etc.)
 */

import { NextResponse } from "next/server";
import { jwtVerify, SignJWT } from "jose";
import { getAuthSecretKey } from "@/lib/authSecret";
import {
  ADMIN_SESSION_COOKIE_OPTIONS,
  AUTH_SESSION_MAX_AGE,
} from "@/lib/authSessionConfig";

const SECRET = getAuthSecretKey();

const PUBLIC_AUTH_PATHS = [
  "/admin/login",
  "/admin/signup",
  "/admin/security/change-passkey",
];

const SUPER_ADMIN_PATHS = [
  "/admin/users",
  "/admin/settings",
  "/admin/notifications",
];

function applySecurityHeaders(response, request) {
  const { pathname } = request.nextUrl;

  // 1. Robots Tag: Strict No-Index for all admin, private, and internal api routes
  const isPrivatePath =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/admin") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/messages") ||
    pathname.startsWith("/blog-image-upload");

  if (isPrivatePath) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet, noimageindex");
  }

  // 2. Content Security Policy (CSP)
  response.headers.set(
    "Content-Security-Policy",
    `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://vercel.live https://www.googletagmanager.com;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      font-src 'self' https://fonts.gstatic.com data:;
      img-src 'self' data: https: http:;
      media-src 'self' https:;
      connect-src 'self' https: http: wss: ws: https://www.google-analytics.com https://analytics.google.com;
      frame-src 'self' https://www.youtube.com https://www.google.com;
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
    `.replace(/\s+/g, " ").trim()
  );

  // 3. Browser & MIME Protection Headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=(), payment=(), usb=()"
  );
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );
  response.headers.set("Server", "Enterprise");

  return response;
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");

  // ==========================================
  // 1. ADMIN AUTHENTICATION & ROUTE ISOLATION
  // ==========================================
  if (isAdminPage || isAdminApi) {
    const isPublicAuthRoute = PUBLIC_AUTH_PATHS.some((path) => pathname.startsWith(path));

    // Allow public auth pages (login, signup, passkey reset)
    if (isPublicAuthRoute) {
      const response = NextResponse.next();
      return applySecurityHeaders(response, request);
    }

    const token = request.cookies.get("admin_auth_token")?.value;

    // No Token: Block & Redirect unauthenticated requests
    if (!token) {
      if (isAdminApi) {
        const unauthResponse = NextResponse.json(
          { success: false, error: "Unauthorized access: Admin authentication required." },
          { status: 401 }
        );
        return applySecurityHeaders(unauthResponse, request);
      }
      const loginRedirect = NextResponse.redirect(new URL("/admin/login", request.url));
      return applySecurityHeaders(loginRedirect, request);
    }

    try {
      // Verify JWT Token Signature and Expiration
      const { payload } = await jwtVerify(token, SECRET);

      // RBAC Check for SuperAdmin-only paths
      const isSuperAdminPath = SUPER_ADMIN_PATHS.some((path) => pathname.startsWith(path));
      if (isSuperAdminPath && payload.role !== "super-admin" && payload.role !== "root-super-admin") {
        console.warn(`[Security] Forbidden access to ${pathname} by non-superadmin: ${payload.email}`);
        const forbiddenRedirect = NextResponse.redirect(new URL("/admin/dashboard", request.url));
        return applySecurityHeaders(forbiddenRedirect, request);
      }

      // Sliding Session: Renew active token on every authenticated request
      const renewedToken = await new SignJWT({
        role: payload.role,
        email: payload.email,
        userId: payload.userId,
        name: payload.name,
        avatar: payload.avatar || "",
        authSource: payload.authSource,
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(Math.floor(Date.now() / 1000) + AUTH_SESSION_MAX_AGE)
        .sign(SECRET);

      const response = NextResponse.next();
      response.cookies.set("admin_auth_token", renewedToken, {
        ...ADMIN_SESSION_COOKIE_OPTIONS,
        httpOnly: true,
      });
      response.cookies.set("admin_token", renewedToken, {
        ...ADMIN_SESSION_COOKIE_OPTIONS,
        httpOnly: false,
      });

      return applySecurityHeaders(response, request);
    } catch (err) {
      // Invalid or Expired Token -> Clear cookies and redirect to login
      let expiredResponse;
      if (isAdminApi) {
        expiredResponse = NextResponse.json(
          { success: false, error: "Session expired. Please log in again." },
          { status: 401 }
        );
      } else {
        expiredResponse = NextResponse.redirect(new URL("/admin/login", request.url));
      }

      expiredResponse.cookies.delete("admin_auth_token");
      expiredResponse.cookies.delete("admin_token");
      return applySecurityHeaders(expiredResponse, request);
    }
  }

  // ==========================================
  // 2. PUBLIC ROUTES & GENERAL ASSETS
  // ==========================================
  const response = NextResponse.next();
  return applySecurityHeaders(response, request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, images, fonts, public static assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|css|js)$).*)",
  ],
};

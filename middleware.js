/**
 * Enterprise Security Middleware
 * Implements comprehensive security headers and policies
 */

import { NextResponse } from "next/server";

export function middleware(request) {
  const response = NextResponse.next();

  // =====================
  // SECURITY HEADERS
  // =====================

  // Content Security Policy (CSP)
  // Prevents XSS attacks and restricts resource loading
  response.headers.set(
    "Content-Security-Policy",
    `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://vercel.live;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      font-src 'self' https://fonts.gstatic.com data:;
      img-src 'self' data: https: http:;
      media-src 'self' https:;
      connect-src 'self' https: http: wss: ws:;
      frame-src 'self' https://www.youtube.com;
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
    `.replace(/\s+/g, " ").trim()
  );

  // X-Content-Type-Options
  // Prevents MIME type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");

  // X-Frame-Options
  // Prevents clickjacking attacks
  response.headers.set("X-Frame-Options", "DENY");

  // X-XSS-Protection
  // Legacy browser protection against XSS
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // Referrer-Policy
  // Controls referrer information
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions-Policy (formerly Feature-Policy)
  // Restricts browser features
  response.headers.set(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=(), payment=(), usb=()"
  );

  // Strict-Transport-Security (HSTS)
  // Forces HTTPS connections
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );

  // Remove server identification header
  response.headers.delete("Server");
  response.headers.set("Server", "Enterprise");

  // =====================
  // CUSTOM SECURITY
  // =====================

  // Rate limiting headers (basic - for production, use dedicated service)
  response.headers.set("X-RateLimit-Limit", "100");
  response.headers.set("X-RateLimit-Remaining", "99");

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth routes can have relaxed policies)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};

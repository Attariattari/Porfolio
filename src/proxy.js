import { NextResponse } from "next/server";
import { jwtVerify, SignJWT } from "jose";
import { getAuthSecretKey } from "@/lib/authSecret";
import {
  ADMIN_SESSION_COOKIE_OPTIONS,
  AUTH_SESSION_MAX_AGE,
} from "@/lib/authSessionConfig";

const SECRET = getAuthSecretKey();

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");

  // Whitelist: Allow access to change-passkey route without auth token
  // This is required for ownership transfer credential setup
  if (pathname === "/admin/security/change-passkey") {
    return NextResponse.next();
  }

  // Protect all admin pages except the public auth pages. API routes are also
  // included so normal dashboard polling keeps the sliding session alive.
  if (
    (isAdminPage && !pathname.startsWith("/admin/login") && !pathname.startsWith("/admin/signup")) ||
    isAdminApi
  ) {
    const token = request.cookies.get("admin_auth_token")?.value;

    if (!token) {
      return isAdminApi
        ? NextResponse.next()
        : NextResponse.redirect(new URL("/admin/login", request.url));
    }

    try {
      // Basic validation of the token structure/signature
      const { payload } = await jwtVerify(token, SECRET);
      
      // RBAC: Professional role-based visibility system
      // Paths requiring super-admin or root-super-admin role
      const superAdminPaths = ['/admin/users', '/admin/settings', '/admin/notifications'];
      if (superAdminPaths.some(path => pathname.startsWith(path))) {
        if (payload.role !== 'super-admin' && payload.role !== 'root-super-admin') {
          console.warn(`[Security Alert] Unauthorized access attempt to ${pathname} by user ${payload.email}`);
          return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        }
      }

      // Sliding session: every valid admin visit restarts the inactivity window.
      // Only trusted claims from the verified token are copied into the renewal.
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
      return response;
    } catch (err) {
      // Invalid or expired token
      const response = isAdminApi
        ? NextResponse.next()
        : NextResponse.redirect(new URL("/admin/login", request.url));
      response.cookies.delete("admin_auth_token");
      response.cookies.delete("admin_token");
      return response;
    }
  }

  return NextResponse.next();
}

// Ensure proxy runs on matching paths
export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

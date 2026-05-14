import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "fallback_muhyo_secret_32_chars_long_!!!"
);

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  // Whitelist: Allow access to change-passkey route without auth token
  // This is required for ownership transfer credential setup
  if (pathname === "/admin/security/change-passkey") {
    return NextResponse.next();
  }

  // Protect all /admin routes except /admin/login
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = request.cookies.get("admin_auth_token")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
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

      return NextResponse.next();
    } catch (err) {
      // Invalid or expired token
      const response = NextResponse.redirect(new URL("/admin/login", request.url));
      response.cookies.delete("admin_auth_token");
      return response;
    }
  }

  return NextResponse.next();
}

// Ensure proxy runs on matching paths
export const config = {
  matcher: ["/admin/:path*"],
};

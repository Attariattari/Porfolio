import { NextResponse } from "next/server";
import { checkRateLimit, getClientIP } from "@/lib/rateLimit";
import {
  buildGoogleAuthUrl,
  createRawToken,
  sanitizeInternalRedirect,
  setOAuthStateCookie,
} from "@/lib/googleOAuth";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const ip = getClientIP(request);
  const limit = await checkRateLimit(`google-oauth-start:${ip}`, {
    maxRequests: 12,
    windowMs: 60 * 1000,
  });

  if (!limit.allowed) {
    return NextResponse.redirect(new URL("/admin/login?googleError=rate-limited", request.url));
  }

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return NextResponse.redirect(new URL("/admin/login?googleError=not-configured", request.url));
  }

  const { searchParams } = new URL(request.url);
  const callbackUrl = sanitizeInternalRedirect(searchParams.get("callbackUrl"));
  const state = createRawToken(24);
  const response = NextResponse.redirect(
    buildGoogleAuthUrl({ request, state, callbackUrl }),
  );

  setOAuthStateCookie(response, state, callbackUrl);
  return response;
}

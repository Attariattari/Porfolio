import { NextResponse } from "next/server";
import { checkRateLimit, getClientIP } from "@/lib/rateLimit";
import {
  exchangeGoogleCode,
  fetchGoogleProfile,
  handleGoogleProfile,
  readOAuthStateCookie,
  redirectWithGoogleError,
  sanitizeInternalRedirect,
} from "@/lib/googleOAuth";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const ip = getClientIP(request);
  const limit = await checkRateLimit(`google-oauth-callback:${ip}`, {
    maxRequests: 20,
    windowMs: 60 * 1000,
  });

  if (!limit.allowed) return redirectWithGoogleError(request, "rate-limited");

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const storedState = readOAuthStateCookie(request);

  if (error) return redirectWithGoogleError(request, "cancelled");
  if (!code || !state || !storedState || storedState.state !== state) {
    return redirectWithGoogleError(request, "unauthorized");
  }

  try {
    const tokenSet = await exchangeGoogleCode(request, code);
    const profile = await fetchGoogleProfile(tokenSet.access_token);
    const result = await handleGoogleProfile(
      profile,
      sanitizeInternalRedirect(storedState.callbackUrl),
    );

    if (result.type === "error") {
      return redirectWithGoogleError(request, result.code);
    }

    if (result.type === "link_required") {
      const linkUrl = new URL("/admin/login", request.url);
      linkUrl.searchParams.set("linkToken", result.linkToken);
      linkUrl.searchParams.set("oauthEmail", result.email);
      linkUrl.searchParams.set("callbackUrl", sanitizeInternalRedirect(storedState.callbackUrl));
      const response = NextResponse.redirect(linkUrl);
      response.cookies.delete("google_oauth_state");
      return response;
    }

    const response = NextResponse.redirect(
      new URL(result.redirectTo || "/admin/dashboard", request.url),
    );
    response.cookies.delete("google_oauth_state");
    return response;
  } catch (e) {
    return redirectWithGoogleError(request, "failed");
  }
}

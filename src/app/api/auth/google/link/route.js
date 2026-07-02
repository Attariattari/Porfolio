import { NextResponse } from "next/server";
import { checkRateLimit, getClientIP } from "@/lib/rateLimit";
import { confirmGoogleLink } from "@/lib/googleOAuth";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const ip = getClientIP(request);
  const limit = await checkRateLimit(`google-oauth-link:${ip}`, {
    maxRequests: 8,
    windowMs: 60 * 1000,
  });

  if (!limit.allowed) {
    return NextResponse.json(
      { success: false, message: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  try {
    const { token, passkey } = await request.json();
    const result = await confirmGoogleLink({ token, passkey });

    if (!result.success) {
      return NextResponse.json(
        { success: false, code: result.code, message: result.message },
        { status: result.code === "EXPIRED" ? 410 : 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Google account linked successfully.",
      token: result.token,
      user: result.user,
      redirectTo: result.redirectTo,
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, message: "Google account linking failed. Please try again." },
      { status: 500 },
    );
  }
}

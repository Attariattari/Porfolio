import crypto from "crypto";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User, { GoogleOAuthLinkRequest } from "@/models/AdminModels";
import { createAdminSession, getDefaultAuthRedirect, formatName } from "@/lib/auth";
import { verifyPasskey } from "@/lib/passwordReset";
import { ActivityController } from "@/controllers/ActivityController";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";
const LINK_TOKEN_TTL_MS = 10 * 60 * 1000;

export function getAppUrlFromRequest(request) {
  const configured = process.env.APP_URL || process.env.NEXT_PUBLIC_SITE_URL;
  return (configured || new URL(request.url).origin).replace(/\/$/, "");
}

export function getGoogleRedirectUri(request) {
  return (
    process.env.GOOGLE_REDIRECT_URI ||
    `${getAppUrlFromRequest(request)}/api/auth/google/callback`
  );
}

export function sanitizeInternalRedirect(value, fallback = "/admin/dashboard") {
  if (!value) return fallback;
  try {
    const decoded = decodeURIComponent(value);
    if (decoded.startsWith("/") && !decoded.startsWith("//")) return decoded;
  } catch (e) {}
  return fallback;
}

export function hashOAuthToken(token) {
  const secret =
    process.env.SESSION_SECRET ||
    process.env.AUTH_SECRET ||
    "fallback_muhyo_secret_32_chars_long_!!!";
  return crypto.createHmac("sha256", secret).update(token).digest("hex");
}

export function createRawToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("base64url");
}

export function buildGoogleAuthUrl({ request, state, callbackUrl }) {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID || "",
    redirect_uri: getGoogleRedirectUri(request),
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
    access_type: "offline",
  });

  if (callbackUrl) params.set("login_hint", "");
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export function setOAuthStateCookie(response, state, callbackUrl) {
  response.cookies.set(
    "google_oauth_state",
    JSON.stringify({ state, callbackUrl: sanitizeInternalRedirect(callbackUrl) }),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 10 * 60,
      path: "/",
    },
  );
}

export function readOAuthStateCookie(request) {
  const raw = request.cookies.get("google_oauth_state")?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export async function exchangeGoogleCode(request, code) {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      redirect_uri: getGoogleRedirectUri(request),
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) throw new Error("GOOGLE_TOKEN_EXCHANGE_FAILED");
  return response.json();
}

export async function fetchGoogleProfile(accessToken) {
  const response = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) throw new Error("GOOGLE_PROFILE_FAILED");
  const profile = await response.json();

  return {
    googleId: profile.sub,
    email: String(profile.email || "").toLowerCase(),
    emailVerified: profile.email_verified === true,
    name: profile.name || formatName(String(profile.email || "").split("@")[0]),
    avatar: profile.picture || "",
  };
}

function hasGoogleProvider(user, googleId) {
  return (
    user.googleId === googleId ||
    user.authProviders?.some(
      (provider) =>
        provider.provider === "google" && provider.providerId === googleId,
    )
  );
}

function isPrivilegedAdmin(user) {
  const rootAdminEmail = (
    process.env.SUPER_ADMIN_EMAIL || "attariattari549@gmail.com"
  ).toLowerCase();
  const email = user.email?.toLowerCase();
  return (
    email === rootAdminEmail ||
    user.role === "super-admin" ||
    user.role === "root-super-admin"
  );
}

function addOrUpdateGoogleProvider(user, profile) {
  user.googleId = profile.googleId;
  user.avatar = profile.avatar || user.avatar;
  user.emailVerified = true;
  user.provider = user.provider || "google";
  user.isOAuthUser = true;
  user.lastLoginAt = new Date();
  user.authProviders = Array.isArray(user.authProviders) ? user.authProviders : [];

  const existing = user.authProviders.find(
    (provider) => provider.provider === "google",
  );
  if (existing) {
    existing.providerId = profile.googleId;
    existing.email = profile.email;
    existing.linkedAt = existing.linkedAt || new Date();
  } else {
    user.authProviders.push({
      provider: "google",
      providerId: profile.googleId,
      email: profile.email,
      linkedAt: new Date(),
    });
  }
}

async function logOAuth(action, user, details) {
  await ActivityController.log({
    user: {
      name: user?.name || "Google OAuth",
      email: user?.email || "unknown",
      role: user?.role || "user",
    },
    action: "LOGIN",
    module: "USERS",
    details: `${action}: ${details}`,
    targetId: user?._id,
  });
}

export async function createGoogleLinkRequest({ profile, callbackUrl }) {
  const rawToken = createRawToken();
  const tokenHash = hashOAuthToken(rawToken);
  const link = await GoogleOAuthLinkRequest.create({
    tokenHash,
    email: profile.email,
    googleId: profile.googleId,
    googleEmail: profile.email,
    name: profile.name,
    avatar: profile.avatar,
    callbackUrl: sanitizeInternalRedirect(callbackUrl),
    expiresAt: new Date(Date.now() + LINK_TOKEN_TTL_MS),
  });

  return { rawToken, link };
}

export async function handleGoogleProfile(profile, callbackUrl) {
  await dbConnect();

  if (!profile.email || !profile.googleId) {
    throw new Error("GOOGLE_PROFILE_INCOMPLETE");
  }

  if (!profile.emailVerified) {
    return { type: "error", code: "unverified" };
  }

  const linkedUser = await User.findOne({
    $or: [
      { googleId: profile.googleId },
      { authProviders: { $elemMatch: { provider: "google", providerId: profile.googleId } } },
    ],
  });

  if (linkedUser) {
    if (linkedUser.status !== "approved") {
      await logOAuth("google_login_failed", linkedUser, "Google-linked account is not approved.");
      return { type: "error", code: "not-approved" };
    }
    addOrUpdateGoogleProvider(linkedUser, profile);
    await linkedUser.save();
    const session = await createAdminSession(linkedUser, "google");
    await logOAuth("google_login_success", linkedUser, "Google login successful.");
    return {
      type: "login",
      redirectTo: getDefaultAuthRedirect(linkedUser, callbackUrl),
      session,
    };
  }

  const existingUser = await User.findOne({ email: profile.email });
  if (existingUser) {
    if (existingUser.status !== "approved") {
      await logOAuth("google_login_failed", existingUser, "Existing account is not approved.");
      return { type: "error", code: "not-approved" };
    }

    if (hasGoogleProvider(existingUser, profile.googleId)) {
      addOrUpdateGoogleProvider(existingUser, profile);
      await existingUser.save();
      const session = await createAdminSession(existingUser, "google");
      return {
        type: "login",
        redirectTo: getDefaultAuthRedirect(existingUser, callbackUrl),
        session,
      };
    }

    if (!isPrivilegedAdmin(existingUser)) {
      addOrUpdateGoogleProvider(existingUser, profile);
      await existingUser.save();
      const session = await createAdminSession(existingUser, "google");
      await logOAuth(
        "google_account_link_success",
        existingUser,
        "Existing account linked automatically after verified Google login.",
      );
      return {
        type: "login",
        redirectTo: getDefaultAuthRedirect(existingUser, callbackUrl),
        session,
      };
    }

    const { rawToken } = await createGoogleLinkRequest({ profile, callbackUrl });
    await logOAuth(
      "google_account_link_requested",
      existingUser,
      "Google login matched an existing Super Admin account and requires passkey confirmation.",
    );
    return { type: "link_required", linkToken: rawToken, email: profile.email };
  }

  const user = await User.create({
    email: profile.email,
    name: profile.name || formatName(profile.email.split("@")[0]),
    role: "user",
    status: "approved",
    googleId: profile.googleId,
    avatar: profile.avatar,
    emailVerified: true,
    provider: "google",
    isOAuthUser: true,
    lastLoginAt: new Date(),
    authProviders: [{
      provider: "google",
      providerId: profile.googleId,
      email: profile.email,
      linkedAt: new Date(),
    }],
  });

  const session = await createAdminSession(user, "google");
  await logOAuth("google_signup_success", user, "New Google account created.");
  return {
    type: "signup",
    redirectTo: getDefaultAuthRedirect(user, callbackUrl),
    session,
  };
}

export async function confirmGoogleLink({ token, passkey }) {
  await dbConnect();
  const tokenHash = hashOAuthToken(token || "");
  const link = await GoogleOAuthLinkRequest.findOne({ tokenHash, status: "pending" });

  if (!link || link.expiresAt.getTime() <= Date.now()) {
    if (link) {
      link.status = "expired";
      await link.save();
    }
    return { success: false, code: "EXPIRED", message: "Account linking expired. Please try again." };
  }

  const user = await User.findOne({ email: link.email });
  if (!user || user.status !== "approved") {
    return { success: false, code: "UNAUTHORIZED", message: "Unauthorized request." };
  }

  const { valid } = await verifyPasskey(passkey, user.passkey);
  if (!valid) {
    await logOAuth("google_account_link_failed", user, "Passkey confirmation failed.");
    return { success: false, code: "INVALID", message: "Passkey confirmation failed." };
  }

  addOrUpdateGoogleProvider(user, {
    googleId: link.googleId,
    email: link.googleEmail,
    emailVerified: true,
    name: link.name,
    avatar: link.avatar,
  });
  user.emailVerified = true;
  await user.save();

  link.status = "used";
  link.usedAt = new Date();
  await link.save();

  const session = await createAdminSession(user, "google");
  await logOAuth("google_account_link_success", user, "Google account linked after passkey confirmation.");

  return {
    success: true,
    token: session.token,
    user: { email: session.email, role: session.role },
    redirectTo: sanitizeInternalRedirect(link.callbackUrl),
  };
}

export function redirectWithGoogleError(request, code = "failed") {
  const url = new URL("/admin/login", request.url);
  url.searchParams.set("googleError", code);
  return NextResponse.redirect(url);
}

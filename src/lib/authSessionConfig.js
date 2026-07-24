const DEFAULT_SESSION_DAYS = 7;

function getConfiguredSessionDays() {
  const parsed = Number.parseInt(process.env.AUTH_SESSION_DAYS || "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_SESSION_DAYS;
}

export const AUTH_SESSION_DAYS = getConfiguredSessionDays();
export const AUTH_SESSION_MAX_AGE = AUTH_SESSION_DAYS * 24 * 60 * 60;

export const ADMIN_SESSION_COOKIE_OPTIONS = {
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: AUTH_SESSION_MAX_AGE,
  path: "/",
};

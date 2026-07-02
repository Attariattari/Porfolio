function normalizeSiteUrl(value) {
  const url = value || "";
  return url.replace(/\/$/, "");
}

function isLocalhostUrl(value) {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(value);
}

const configuredSiteUrl =
  process.env.APP_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_BASE_URL || "";

const isProduction = process.env.NODE_ENV === "production";

const resolvedSiteUrl = isProduction
  ? configuredSiteUrl && !isLocalhostUrl(configuredSiteUrl)
    ? configuredSiteUrl
    : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://www.muhyotech.com"
  : configuredSiteUrl || "http://localhost:3000";

export const SITE_URL = normalizeSiteUrl(resolvedSiteUrl);

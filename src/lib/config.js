function normalizeSiteUrl(value) {
  const url = value || "";
  return url.replace(/\/$/, "");
}

const defaultSiteUrl =
  process.env.NODE_ENV === "production"
    ? "https://www.muhyotech.com"
    : "http://localhost:3000";

export const SITE_URL = normalizeSiteUrl(
  process.env.APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : defaultSiteUrl),
);

function normalizeSiteUrl(value) {
  const url = value || "";
  return url.replace(/\/$/, "");
}

export const SITE_URL = normalizeSiteUrl(
  process.env.APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://www.muhyotech.com"),
);

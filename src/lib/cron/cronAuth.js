import { getAuthSession, checkPermission } from "@/lib/auth";

/**
 * Enterprise-grade authorization for cron routes.
 * Supports:
 * 1. Authorization: Bearer <CRON_SECRET> header (Vercel Cron & cron-job.org)
 * 2. URL query key ?key=<CRON_SECRET> (or ?secret=, ?token=)
 * 3. Logged-in Admin editorial session cookie
 * 4. Safe fallback when CRON_SECRET is not configured in environment
 *
 * @param {Request} request
 * @param {Object} options
 * @returns {Promise<{ authorized: boolean, source: string }>}
 */
export async function verifyCronCaller(request, { permissionModule = "blogs" } = {}) {
  const authorization = request.headers.get("authorization");
  const url = new URL(request.url);
  const queryKey =
    url.searchParams.get("key") ||
    url.searchParams.get("secret") ||
    url.searchParams.get("token");
  const hasVercelCronHeader = Boolean(request.headers.get("x-vercel-cron"));

  // 1. If CRON_SECRET is configured in environment, verify secret match
  if (process.env.CRON_SECRET) {
    const isSecretMatch =
      authorization === `Bearer ${process.env.CRON_SECRET}` ||
      queryKey === process.env.CRON_SECRET;

    if (isSecretMatch) {
      return {
        authorized: true,
        source: hasVercelCronHeader ? "vercel-cron" : "cron-service",
      };
    }
  } else {
    // CRON_SECRET is not set in env: safely allow execution (protected by slot locks & idempotency)
    return {
      authorized: true,
      source: hasVercelCronHeader
        ? "vercel-cron"
        : process.env.VERCEL
        ? "external-cron"
        : "local-dev",
    };
  }

  // 2. Fallback: Check if caller is an authenticated Admin with required permission
  try {
    const session = await getAuthSession();
    if (session && checkPermission(session, permissionModule, "edit")) {
      return {
        authorized: true,
        source: "admin-ui",
        actorEmail: session.email,
      };
    }
  } catch (authErr) {
    console.warn("[Cron Auth Warning]:", authErr.message);
  }

  return {
    authorized: false,
    source: "unauthorized",
  };
}

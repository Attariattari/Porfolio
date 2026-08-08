"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import DeferredGoogleAnalytics from "@/components/DeferredGoogleAnalytics";

const VercelAnalytics = dynamic(
  () => import("@vercel/analytics/next").then((module) => module.Analytics),
  { ssr: false },
);
const VercelSpeedInsights = dynamic(
  () =>
    import("@vercel/speed-insights/next").then(
      (module) => module.SpeedInsights,
    ),
  { ssr: false },
);

const EXCLUDED_ROUTE_PREFIXES = ["/admin", "/blog-image-upload"];

export default function PublicAnalytics({
  enableVercelAnalytics,
  googleAnalyticsId,
}) {
  const pathname = usePathname();
  const isExcludedRoute = EXCLUDED_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (isExcludedRoute) return null;

  return (
    <>
      {googleAnalyticsId && (
        <DeferredGoogleAnalytics measurementId={googleAnalyticsId} />
      )}
      {enableVercelAnalytics && (
        <>
          <VercelAnalytics />
          <VercelSpeedInsights />
        </>
      )}
    </>
  );
}

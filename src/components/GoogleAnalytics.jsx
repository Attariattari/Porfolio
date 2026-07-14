"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

export default function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_ID;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent || "";
    const isAutomatedTraffic =
      window.navigator.webdriver ||
      /bot|crawler|spider|headless|lighthouse|pagespeed|google-inspectiontool/i.test(userAgent);
    if (isAutomatedTraffic) return undefined;

    const enable = () => setReady(true);
    const timer = window.setTimeout(enable, 15000);
    const events = ["pointerdown", "keydown", "touchstart"];
    events.forEach((eventName) =>
      window.addEventListener(eventName, enable, { once: true, passive: true }),
    );

    return () => {
      window.clearTimeout(timer);
      events.forEach((eventName) =>
        window.removeEventListener(eventName, enable),
      );
    };
  }, []);

  if (!measurementId || !ready) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}');
        `}
      </Script>
    </>
  );
}

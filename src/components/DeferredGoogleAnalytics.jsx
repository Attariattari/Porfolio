"use client";

import { useEffect } from "react";

export default function DeferredGoogleAnalytics({ measurementId }) {
  useEffect(() => {
    if (!measurementId || window.__muhyoAnalyticsLoaded) return undefined;

    let loaded = false;
    let idleId;
    let timeoutId;

    const loadAnalytics = () => {
      if (loaded || window.__muhyoAnalyticsLoaded) return;
      loaded = true;
      window.__muhyoAnalyticsLoaded = true;
      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag() {
        window.dataLayer.push(arguments);
      };
      window.gtag("js", new Date());
      window.gtag("config", measurementId);

      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
      document.head.appendChild(script);
    };

    const onFirstInteraction = () => loadAnalytics();
    const events = ["pointerdown", "keydown", "touchstart"];
    events.forEach((event) => window.addEventListener(event, onFirstInteraction, { once: true, passive: true }));

    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(loadAnalytics, { timeout: 8000 });
    } else {
      timeoutId = window.setTimeout(loadAnalytics, 8000);
    }

    return () => {
      events.forEach((event) => window.removeEventListener(event, onFirstInteraction));
      if (idleId) window.cancelIdleCallback?.(idleId);
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [measurementId]);

  return null;
}


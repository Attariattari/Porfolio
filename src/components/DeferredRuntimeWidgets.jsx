"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const VisitorTracker = dynamic(() => import("./VisitorTracker"), {
  ssr: false,
});

const NetworkListener = dynamic(() => import("./NetworkListener"), {
  ssr: false,
});

export default function DeferredRuntimeWidgets() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const load = () => setEnabled(true);

    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(load, { timeout: 3000 });
      return () => window.cancelIdleCallback?.(idleId);
    }

    const timer = window.setTimeout(load, 1500);
    return () => window.clearTimeout(timer);
  }, []);

  if (!enabled) return null;

  return (
    <>
      <NetworkListener />
      <VisitorTracker />
    </>
  );
}

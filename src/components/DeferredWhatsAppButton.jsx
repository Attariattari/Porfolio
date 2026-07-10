"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const WhatsAppButton = dynamic(() => import("./WhatsAppButton"), {
  ssr: false,
});

export default function DeferredWhatsAppButton() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const load = () => setEnabled(true);

    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(load, { timeout: 2500 });
      return () => window.cancelIdleCallback?.(idleId);
    }

    const timer = window.setTimeout(load, 1500);
    return () => window.clearTimeout(timer);
  }, []);

  return enabled ? <WhatsAppButton /> : null;
}

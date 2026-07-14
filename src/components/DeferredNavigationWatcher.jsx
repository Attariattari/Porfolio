"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const NavigationWatcher = dynamic(() => import("./NavigationWatcher"), {
  ssr: false,
});

export default function DeferredNavigationWatcher() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const enable = () => setEnabled(true);
    let idleId;
    let timer;
    if ("requestIdleCallback" in window) {
      timer = window.setTimeout(() => {
        idleId = window.requestIdleCallback(enable, { timeout: 5000 });
      }, 10000);
    } else {
      timer = window.setTimeout(enable, 10000);
    }

    return () => {
      window.clearTimeout(timer);
      if (idleId !== undefined) window.cancelIdleCallback?.(idleId);
    };
  }, []);

  return enabled ? <NavigationWatcher /> : null;
}

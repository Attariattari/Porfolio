"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Toaster = dynamic(
  () => import("sonner").then((module) => module.Toaster),
  { ssr: false },
);

export default function DeferredToaster() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const enable = () => setEnabled(true);
    const events = ["pointerdown", "keydown", "touchstart"];
    events.forEach((eventName) =>
      window.addEventListener(eventName, enable, { once: true, passive: true }),
    );

    let idleId;
    let timer;
    if ("requestIdleCallback" in window) {
      timer = window.setTimeout(() => {
        idleId = window.requestIdleCallback(enable, { timeout: 5000 });
      }, 15000);
    } else {
      timer = window.setTimeout(enable, 15000);
    }

    return () => {
      if (idleId !== undefined) window.cancelIdleCallback?.(idleId);
      if (timer !== undefined) window.clearTimeout(timer);
      events.forEach((eventName) => window.removeEventListener(eventName, enable));
    };
  }, []);

  if (!enabled) return null;

  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: "color-mix(in srgb, var(--popover) 95%, transparent)",
          color: "var(--popover-foreground)",
          backdropFilter: "blur(10px)",
          border: "1px solid var(--border)",
        },
        className: "rounded-xl shadow-2xl",
      }}
    />
  );
}

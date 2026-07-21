"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function InitialLoader() {
  const [loading, setLoading] = useState(true);
  const [isCompactMobile, setIsCompactMobile] = useState(false);

  useEffect(() => {
    // P0 OPTIMIZATION: Skip loader on repeat visits (same session)
    const hasVisited = sessionStorage.getItem("hasVisited");
    const compactMobile = window.matchMedia("(max-width: 767px)").matches;

    // The route-level loading UI already covers the server wait. Replaying a
    // second overlay after hydration only delays the mobile content paint.
    if (compactMobile) {
      sessionStorage.setItem("hasVisited", "true");
      const frame = window.requestAnimationFrame(() => {
        setIsCompactMobile(true);
        setLoading(false);
      });
      return () => window.cancelAnimationFrame(frame);
    }

    const frame = window.requestAnimationFrame(() => {
      setIsCompactMobile(compactMobile);
      if (hasVisited) setLoading(false);
    });

    if (hasVisited) {
      return () => window.cancelAnimationFrame(frame);
    }

    // Keep the complete loader experience, but use a shorter presentation on
    // smaller screens where prolonged animation competes with hydration.
    const timer = setTimeout(() => {
      setLoading(false);
      sessionStorage.setItem("hasVisited", "true");
    }, 700);

    return () => {
      window.cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: {
              duration: isCompactMobile ? 0.25 : 0.45,
              ease: "easeInOut",
            },
          }}
          className="initial-loader-shell fixed inset-0 z-[10000] hidden items-center justify-center bg-background md:flex"
        >
          <div className="absolute h-[600px] w-[600px] rounded-full bg-accent/20 opacity-15 blur-[150px]" />

          <div className="relative flex flex-col items-center">
            {/* Logo Animation */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative mb-12"
            >
              <div className="w-32 h-32 flex items-center justify-center glass rounded-[2.5rem] border border-accent/20 shadow-[0_0_80px_rgba(var(--accent-rgb),0.15)] overflow-hidden">
                <Image
                  src="/logo.webp"
                  alt="Muhyo Tech logo"
                  width={80}
                  height={80}
                  loading="eager"
                  className="w-20 h-20 object-contain animate-pulse"
                  sizes="80px"
                />
                <div className="absolute inset-[-30px] animate-spin rounded-full border border-dashed border-accent/10 [animation-duration:12s]" />
              </div>
            </motion.div>

            {/* Loading Indicator */}
            <div className="w-48 space-y-4">
              <div className="h-1 w-full bg-muted overflow-hidden rounded-full relative">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{
                    duration: isCompactMobile ? 0.58 : 0.9,
                    ease: "easeInOut",
                  }}
                  className="absolute top-0 left-0 h-full bg-accent shadow-[0_0_15px_rgba(var(--accent-rgb),0.4)]"
                />
              </div>
              <div className="flex justify-center items-center text-small font-black tracking-[0.4em] text-muted-foreground/40">
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center"
                >
                  Loading
                  <span className="flex ml-1">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="animate-pulse"
                        style={{ animationDelay: `${i * 0.2}s` }}
                      >
                        .
                      </span>
                    ))}
                  </span>
                </motion.span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

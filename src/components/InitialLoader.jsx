"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function InitialLoader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // P0 OPTIMIZATION: Skip loader on repeat visits (same session)
    const hasVisited = sessionStorage.getItem("hasVisited");
    if (hasVisited) {
      setLoading(false);
      return;
    }

    // First visit: show loader for max 1000ms (reduced from 2500ms)
    // TTI target: 1000ms (reduced by 60%)
    const timer = setTimeout(() => {
      setLoading(false);
      sessionStorage.setItem("hasVisited", "true");
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: 0.8, ease: "easeInOut" },
          }}
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-background"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute w-[600px] h-[600px] bg-accent/20 rounded-full blur-[150px]"
          />

          <div className="relative flex flex-col items-center">
            {/* Logo Animation */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative mb-12"
            >
              <div className="w-32 h-32 flex items-center justify-center glass rounded-[2.5rem] border border-accent/20 shadow-[0_0_80px_rgba(var(--accent-rgb),0.15)] overflow-hidden">
                <img
                  src="/logo.png"
                  alt="Logo"
                  className="w-20 h-20 object-contain animate-pulse"
                />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute inset-[-30px] border border-accent/10 rounded-full border-dashed"
                />
              </div>
            </motion.div>

            {/* Loading Indicator */}
            <div className="w-48 space-y-4">
              <div className="h-1 w-full bg-muted overflow-hidden rounded-full relative">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.9, ease: "easeInOut" }}
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
                      <motion.span
                        key={i}
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      >
                        .
                      </motion.span>
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

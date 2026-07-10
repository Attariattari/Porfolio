"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-accent/5 rounded-full blur-[100px]" />

      <div className="relative flex flex-col items-center gap-12 max-w-xs w-full">
        {/* Orbital Ring Logo Area */}
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-[-20px] border border-accent/20 rounded-full border-dashed"
          />
          <div className="relative w-24 h-24 flex items-center justify-center glass rounded-full border border-accent/20 overflow-hidden shadow-[0_0_50px_rgba(var(--accent-rgb),0.1)]">
            <Image
              src="/logo.webp"
              alt="Muhyo Tech logo"
              width={64}
              height={64}
              className="w-16 h-16 object-contain animate-pulse"
              priority
            />
          </div>
        </div>

        {/* Triple-Layer Futuristic Progress */}
        <div className="w-full space-y-4">
          <div className="relative h-1 w-full bg-muted overflow-hidden rounded-full">
            {/* Primary Motion Bar */}
            <div className="absolute top-0 left-0 h-full w-full bg-accent animate-progress-wide shadow-[0_0_15px_rgba(var(--accent-rgb),0.4)]" />

            {/* Secondary Tracer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "200%" }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-transparent via-foreground/20 to-transparent"
            />
          </div>

          <div className="flex justify-center items-center px-1">
            <span className="text-small font-black tracking-[0.4em] text-muted-foreground/40 flex items-center">
              Initializing Experience
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
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useTheme } from "./ThemeProvider";
import { motion } from "framer-motion";

export const AnimatedBackground = () => {
  const { isDark } = useTheme();

  return (
    <div className="fixed inset-0 -z-50 overflow-hidden bg-background pointer-events-none">
      {/* Base Gradient Background */}
      <div
        className={`absolute inset-0 opacity-40 transition-colors duration-1000 ${
          isDark
            ? "bg-gradient-to-br from-[#0a0f1c] via-[#111827] to-[#0a0f1c]"
            : "bg-gradient-to-br from-slate-50 via-white to-blue-50"
        }`}
      />

      {/* Animated Glowing Orbs */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20 ${
            isDark ? "bg-accent" : "bg-blue-300"
          }`}
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [0, -60, 0],
            x: [0, -40, 0],
            y: [0, 60, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[140px] opacity-10 ${
            isDark ? "bg-blue-600" : "bg-cyan-200"
          }`}
        />
      </div>

      {/* Flowing SVG Lines */}
      <svg
        className="absolute inset-0 w-full h-full opacity-20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop
              offset="0%"
              stopColor={isDark ? "var(--color-accent)" : "#3b82f6"}
              stopOpacity="0"
            />
            <stop
              offset="50%"
              stopColor={isDark ? "var(--color-accent)" : "#3b82f6"}
              stopOpacity="0.5"
            />
            <stop
              offset="100%"
              stopColor={isDark ? "var(--color-accent)" : "#3b82f6"}
              stopOpacity="0"
            />
          </linearGradient>
        </defs>

        {[...Array(6)].map((_, i) => (
          <motion.path
            key={i}
            d={`M -500 ${200 + i * 150} Q 0 ${100 + i * 100} 500 ${200 + i * 150} T 1500 ${200 + i * 150}`}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="1.5"
            initial={{ pathLength: 0, pathOffset: 0 }}
            animate={{
              pathLength: [0.2, 0.4, 0.2],
              pathOffset: [0, 1],
            }}
            transition={{
              duration: 15 + i * 2,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}

        <motion.path
          d="M -200 800 Q 400 600 1000 800 T 2200 800"
          fill="none"
          stroke={
            isDark ? "rgba(14, 165, 233, 0.15)" : "rgba(59, 130, 246, 0.1)"
          }
          strokeWidth="3"
          animate={{
            d: [
              "M -200 800 Q 400 600 1000 800 T 2200 800",
              "M -200 750 Q 500 850 1100 750 T 2200 750",
              "M -200 800 Q 400 600 1000 800 T 2200 800",
            ],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </svg>

      {/* Grid Pattern Overlay */}
      <div
        className={`absolute inset-0 opacity-[0.03] ${
          isDark
            ? "bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"
            : "bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"
        } pointer-events-none`}
        style={{ backgroundSize: "200px 200px" }}
      />
    </div>
  );
};

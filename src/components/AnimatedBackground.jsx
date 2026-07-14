"use client";

import { memo } from "react";
import { useTheme } from "./ThemeProvider";

const AnimatedBackgroundComponent = () => {
  const { isBlack, isDark } = useTheme();

  return (
    <div className="fixed inset-0 -z-50 overflow-hidden bg-background pointer-events-none">
      {/* Base Gradient Background */}
      <div
        className={`absolute inset-0 transition-colors duration-1000 ${
          isBlack
            ? "black-atmosphere opacity-100"
            : isDark
              ? "bg-gradient-to-br from-[#0a0f1c] via-[#111827] to-[#0a0f1c] opacity-40"
              : "bg-gradient-to-br from-slate-50 via-white to-blue-50 opacity-40"
        }`}
      />

      {/* Animated Glowing Orbs */}
      <div className="absolute inset-0">
        <div
          className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] ${
            isBlack
              ? "bg-cyan-400 opacity-[0.18]"
              : isDark
                ? "bg-accent opacity-20"
                : "bg-blue-300 opacity-20"
          }`}
        />
        <div
          className={`absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[140px] ${
            isBlack
              ? "bg-blue-500 opacity-[0.12]"
              : isDark
                ? "bg-blue-600 opacity-10"
                : "bg-cyan-200 opacity-10"
          }`}
        />
      </div>

      {isBlack && <div className="black-tech-grid absolute inset-0" />}

      {/* Flowing SVG Lines */}
      <svg
        className={`absolute inset-0 h-full w-full ${
          isBlack ? "opacity-[0.26]" : isDark ? "opacity-20" : "opacity-[0.38]"
        }`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop
              offset="0%"
              stopColor={isDark ? "var(--color-accent)" : "#2563eb"}
              stopOpacity="0"
            />
            <stop
              offset="50%"
              stopColor={isDark ? "var(--color-accent)" : "#2563eb"}
              stopOpacity={isBlack ? "0.58" : isDark ? "0.5" : "0.72"}
            />
            <stop
              offset="100%"
              stopColor={isDark ? "var(--color-accent)" : "#2563eb"}
              stopOpacity="0"
            />
          </linearGradient>
        </defs>
        {[...Array(2)].map((_, i) => (
          <path
            key={i}
            d={`M -500 ${200 + i * 150} Q 0 ${100 + i * 100} 500 ${200 + i * 150} T 1500 ${200 + i * 150}`}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth={isDark ? "1.5" : "1.75"}
            pathLength="1"
          />
        ))}

        <path
          d="M -200 800 Q 400 600 1000 800 T 2200 800"
          fill="none"
          stroke={
            isBlack
              ? "rgba(34, 211, 255, 0.22)"
              : isDark
                ? "rgba(14, 165, 233, 0.15)"
                : "rgba(37, 99, 235, 0.26)"
          }
          strokeWidth={isDark ? "3" : "2.5"}
        >
        </path>
      </svg>

      {/* Grid Pattern Overlay */}
      <div
        className={`absolute inset-0 ${isBlack ? "opacity-[0.035]" : "opacity-[0.03]"} bg-[url('/noise.svg')] pointer-events-none bg-[length:200px_200px]`}
      />
    </div>
  );
};

// PHASE 2 OPTIMIZATION: Memoize to prevent re-renders when parent updates
export const AnimatedBackground = memo(AnimatedBackgroundComponent);

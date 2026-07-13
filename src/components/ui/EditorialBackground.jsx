"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTheme } from "@/components/ThemeProvider";

const particleClasses = [
  "top-[15%] left-[20%]",
  "top-[35%] left-[70%]",
  "top-[60%] left-[40%]",
  "top-[80%] left-[85%]",
  "top-[45%] left-[10%]",
];

const EditorialBackground = ({ text }) => {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const shouldReduceMotion = useReducedMotion();
  const { isBlack } = useTheme();

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setMounted(true));

    // PHASE 3: Pause animations when tab is hidden to save GPU
    const handleVisibility = () => {
      setIsVisible(document.visibilityState === "visible");
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  // When reduced motion is preferred or tab is hidden, use static/no animation
  const glowAnimate1 =
    shouldReduceMotion || !isVisible
      ? {}
      : {
          y: [0, isBlack ? -28 : -60, 0],
          rotate: [0, isBlack ? 2 : 5, 0],
          scale: [1, isBlack ? 1.06 : 1.15, 1],
        };
  const glowAnimate2 =
    shouldReduceMotion || !isVisible
      ? {}
      : {
          x: [0, isBlack ? 22 : 50, 0],
          y: [0, isBlack ? 18 : 40, 0],
        };

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
      {/* Noise/Grain Layer */}
      <div className={`absolute inset-0 brightness-100 contrast-150 mix-blend-multiply dark:mix-blend-overlay ${isBlack ? "opacity-[0.018]" : "opacity-[0.03] dark:opacity-[0.05]"}`} />

      {/* Large Faded Background Text — pure CSS, no animation */}
      <div className={`absolute -top-10 -left-10 pointer-events-none ${isBlack ? "opacity-[0.065]" : "opacity-[0.04] dark:opacity-[0.06]"}`}>
        <h2 className="text-[14rem] md:text-[22rem] font-bold tracking-tighter italic -rotate-12 translate-x-[-10%] translate-y-[-10%] text-foreground whitespace-nowrap overflow-visible opacity-[0.8]">
          {text}
        </h2>
      </div>

      {/* PHASE 3: Dynamic Atmospheric Glows — paused when hidden or reduced-motion */}
      <motion.div
        animate={glowAnimate1}
        transition={
          shouldReduceMotion || !isVisible
            ? { duration: 0 }
            : { duration: isBlack ? 42 : 30, repeat: Infinity, ease: "linear" }
        }
        className={`absolute top-1/4 right-[5%] w-[600px] h-[600px] blur-[130px] rounded-full ${isBlack ? "bg-cyan-400/[0.12]" : "bg-accent/10"}`}
      />

      <motion.div
        animate={glowAnimate2}
        transition={
          shouldReduceMotion || !isVisible
            ? { duration: 0 }
            : { duration: isBlack ? 50 : 35, repeat: Infinity, ease: "linear" }
        }
        className={`absolute -bottom-32 -left-32 w-[550px] h-[550px] blur-[150px] rounded-full ${isBlack ? "bg-blue-500/[0.075]" : "bg-accent/5"}`}
      />

      {/* Edge Highlight Line — pure CSS */}
      <div className={`absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent to-transparent ${isBlack ? "via-accent/15" : "via-accent/30"}`} />

      {/* PHASE 3: Particles — reduced count, stable positions, paused when hidden */}
      <div className="absolute inset-0 overflow-hidden">
        {mounted &&
          !shouldReduceMotion &&
          particleClasses.map((particleClass, i) => (
            <motion.div
              key={i}
              animate={
                isVisible
                  ? { y: [0, isBlack ? -60 : -100, 0], opacity: [0, isBlack ? 0.2 : 0.4, 0] }
                  : { y: 0, opacity: 0 }
              }
              transition={
                isVisible
                  ? {
                      duration: (isBlack ? 13 : 8) + i * 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 2,
                    }
                  : { duration: 0 }
              }
              className={`absolute rounded-full ${isBlack ? "h-0.5 w-0.5 bg-accent/40" : "h-1 w-1 bg-accent/30"} ${particleClass}`}
            />
          ))}
      </div>
    </div>
  );
};

export default EditorialBackground;

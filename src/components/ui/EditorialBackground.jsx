"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    setMounted(true);

    // PHASE 3: Pause animations when tab is hidden to save GPU
    const handleVisibility = () => {
      setIsVisible(document.visibilityState === "visible");
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // When reduced motion is preferred or tab is hidden, use static/no animation
  const glowAnimate1 =
    shouldReduceMotion || !isVisible
      ? {}
      : {
          y: [0, -60, 0],
          rotate: [0, 5, 0],
          scale: [1, 1.15, 1],
        };
  const glowAnimate2 =
    shouldReduceMotion || !isVisible
      ? {}
      : {
          x: [0, 50, 0],
          y: [0, 40, 0],
        };

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
      {/* Noise/Grain Layer */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] brightness-100 contrast-150 mix-blend-multiply dark:mix-blend-overlay" />

      {/* Large Faded Background Text — pure CSS, no animation */}
      <div className="absolute -top-10 -left-10 opacity-[0.04] dark:opacity-[0.06] pointer-events-none">
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
            : { duration: 30, repeat: Infinity, ease: "linear" }
        }
        className="absolute top-1/4 right-[5%] w-[600px] h-[600px] bg-accent/10 blur-[130px] rounded-full"
      />

      <motion.div
        animate={glowAnimate2}
        transition={
          shouldReduceMotion || !isVisible
            ? { duration: 0 }
            : { duration: 35, repeat: Infinity, ease: "linear" }
        }
        className="absolute -bottom-32 -left-32 w-[550px] h-[550px] bg-accent/5 blur-[150px] rounded-full"
      />

      {/* Edge Highlight Line — pure CSS */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

      {/* PHASE 3: Particles — reduced count, stable positions, paused when hidden */}
      <div className="absolute inset-0 overflow-hidden">
        {mounted &&
          !shouldReduceMotion &&
          particleClasses.map((particleClass, i) => (
            <motion.div
              key={i}
              animate={
                isVisible
                  ? { y: [0, -100, 0], opacity: [0, 0.4, 0] }
                  : { y: 0, opacity: 0 }
              }
              transition={
                isVisible
                  ? {
                      duration: 8 + i * 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 2,
                    }
                  : { duration: 0 }
              }
              className={`absolute w-1 h-1 bg-accent/30 rounded-full ${particleClass}`}
            />
          ))}
      </div>
    </div>
  );
};

export default EditorialBackground;

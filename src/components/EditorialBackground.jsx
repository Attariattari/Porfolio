"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

const EditorialBackground = ({ text }) => {
  const [isVisible, setIsVisible] = useState(true);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    // PHASE 3: Pause animations when tab is hidden
    const handleVisibility = () => {
      setIsVisible(document.visibilityState === "visible");
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  const glowAnimate1 =
    shouldReduceMotion || !isVisible
      ? {}
      : {
          y: [0, -40, 0],
          rotate: [0, 5, 0],
          scale: [1, 1.1, 1],
        };
  const glowAnimate2 =
    shouldReduceMotion || !isVisible
      ? {}
      : {
          x: [0, 40, 0],
          y: [0, 30, 0],
        };

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Noise/Grain Layer */}
      <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.02] bg-[url('/noise.svg')] brightness-100 contrast-150" />

      {/* Large Faded Background Text */}
      <div className="absolute -top-10 -left-10 select-none opacity-[0.02] dark:opacity-[0.03]">
        <h2 className="text-[20rem] font-black tracking-tighter uppercase italic -rotate-12 translate-x-[-10%] translate-y-[-10%]">
          {text}
        </h2>
      </div>

      {/* PHASE 3: Dynamic Atmospheric Glows — paused when hidden or reduced-motion */}
      <motion.div
        animate={glowAnimate1}
        transition={
          shouldReduceMotion || !isVisible
            ? { duration: 0 }
            : { duration: 25, repeat: Infinity, ease: "linear" }
        }
        className="absolute top-1/4 right-[5%] w-[600px] h-[600px] bg-accent/5 blur-[120px] rounded-full"
      />

      <motion.div
        animate={glowAnimate2}
        transition={
          shouldReduceMotion || !isVisible
            ? { duration: 0 }
            : { duration: 30, repeat: Infinity, ease: "linear" }
        }
        className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-accent/3 blur-[140px] rounded-full"
      />

      {/* Edge Highlight Line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent opacity-50" />
    </div>
  );
};

export default EditorialBackground;

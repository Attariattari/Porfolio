"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const EditorialBackground = ({ text }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
      {/* 2. Sophisticated Noise/Grain Layer */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]  brightness-100 contrast-150 mix-blend-multiply dark:mix-blend-overlay" />

      {/* 3. Large Faded Background Text */}
      <div className="absolute -top-10 -left-10 opacity-[0.04] dark:opacity-[0.06] pointer-events-none">
        <h2 className="text-[14rem] md:text-[22rem] font-bold tracking-tighter italic -rotate-12 translate-x-[-10%] translate-y-[-10%] text-foreground whitespace-nowrap overflow-visible opacity-[0.8]">
          {text}
        </h2>
      </div>

      {/* 4. Dynamic Atmospheric Glows */}
      <motion.div
        animate={{
          y: [0, -60, 0],
          rotate: [0, 5, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-1/4 right-[5%] w-[600px] h-[600px] bg-accent/10 blur-[130px] rounded-full"
      />

      <motion.div
        animate={{
          x: [0, 50, 0],
          y: [0, 40, 0],
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute -bottom-32 -left-32 w-[550px] h-[550px] bg-accent/5 blur-[150px] rounded-full"
      />

      {/* 5. Edge Highlight Line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

      {/* 6. Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {mounted &&
          [...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -100, 0],
                opacity: [0, 0.4, 0],
              }}
              transition={{
                duration: 8 + i * 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 2,
              }}
              className="absolute w-1 h-1 bg-accent/30 rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
            />
          ))}
      </div>
    </div>
  );
};

export default EditorialBackground;

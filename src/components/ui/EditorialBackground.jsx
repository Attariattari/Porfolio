"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "@/components/ThemeProvider";

const particleClasses = [
  "top-[15%] left-[20%]",
  "top-[35%] left-[70%]",
  "top-[60%] left-[40%]",
  "top-[80%] left-[85%]",
  "top-[45%] left-[10%]",
];

const EditorialBackground = ({ text }) => {
  const { isBlack } = useTheme();
  const wordmarkRef = useRef(null);

  useEffect(() => {
    const canvas = wordmarkRef.current;
    if (!canvas) return undefined;
    const desktopQuery = window.matchMedia("(min-width: 768px)");
    if (desktopQuery.matches) return undefined;

    const drawWordmark = () => {
      const context = canvas.getContext("2d");
      if (!context) return;

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.save();
      context.translate(0, 32.5);
      context.scale(0.875, 0.875);
      context.fillStyle = getComputedStyle(canvas).color;
      context.font = "italic 700 224px Inter, Arial, sans-serif";
      context.fillText(text, 0, 370);
      context.restore();
    };

    drawWordmark();
    document.fonts?.ready.then(drawWordmark);

    return undefined;
  }, [isBlack, text]);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
      <div
        className={`absolute inset-0 brightness-100 contrast-150 mix-blend-multiply dark:mix-blend-overlay ${
          isBlack ? "opacity-[0.018]" : "opacity-[0.03] dark:opacity-[0.05]"
        }`}
      />

      <div
        className={`absolute -top-10 -left-10 pointer-events-none ${
          isBlack ? "opacity-[0.065]" : "opacity-[0.04] dark:opacity-[0.06]"
        }`}
      >
        <canvas
          ref={wordmarkRef}
          aria-hidden="true"
          width="1050"
          height="520"
          className="w-[1050px] h-[520px] -rotate-12 translate-x-[-10%] translate-y-[-10%] overflow-visible text-foreground opacity-[0.8] md:hidden"
        />
        <svg
          aria-hidden="true"
          focusable="false"
          viewBox="0 0 1200 520"
          className="hidden w-[1050px] h-[520px] -rotate-12 translate-x-[-10%] translate-y-[-10%] overflow-visible text-foreground opacity-[0.8] md:block"
        >
          <text
            x="0"
            y="370"
            fill="currentColor"
            className="text-[22rem] font-bold tracking-tighter italic"
          >
            {text}
          </text>
        </svg>
      </div>

      <div
        className={`absolute top-1/4 right-[5%] w-[600px] h-[600px] blur-[130px] rounded-full ${
          isBlack ? "bg-cyan-400/[0.12]" : "bg-accent/10"
        }`}
      />
      <div
        className={`absolute -bottom-32 -left-32 w-[550px] h-[550px] blur-[150px] rounded-full ${
          isBlack ? "bg-blue-500/[0.075]" : "bg-accent/5"
        }`}
      />

      <div
        className={`absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent to-transparent ${
          isBlack ? "via-accent/15" : "via-accent/30"
        }`}
      />

      <div className="absolute inset-0 overflow-hidden">
        {particleClasses.map((particleClass, index) => (
          <div
            key={index}
            className={`absolute rounded-full ${
              isBlack ? "h-0.5 w-0.5 bg-accent/20" : "h-1 w-1 bg-accent/20"
            } ${particleClass}`}
          />
        ))}
      </div>
    </div>
  );
};

export default EditorialBackground;

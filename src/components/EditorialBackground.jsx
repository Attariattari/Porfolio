"use client";

import { motion } from "framer-motion";

const EditorialBackground = ({ text }) => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">

      {/* 2. Sophisticated Noise/Grain Layer */}
      <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150" />

      {/* 3. Large Faded Background Text */}
      <div className="absolute -top-10 -left-10 select-none opacity-[0.02] dark:opacity-[0.03]">
        <h2 className="text-[20rem] font-black tracking-tighter uppercase italic -rotate-12 translate-x-[-10%] translate-y-[-10%]">
          {text}
        </h2>
      </div>

      {/* 4. Dynamic Atmospheric Glows */}
      <motion.div
        animate={{
          y: [0, -40, 0],
          rotate: [0, 5, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-1/4 right-[5%] w-[600px] h-[600px] bg-accent/5 blur-[120px] rounded-full"
      />

      <motion.div
        animate={{
          x: [0, 40, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-accent/3 blur-[140px] rounded-full"
      />

      {/* 5. Edge Highlight Line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent opacity-50" />
    </div>
  );
};

export default EditorialBackground;

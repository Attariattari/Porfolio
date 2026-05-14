"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error("System Failure Detected:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-accent p-12 text-center font-mono relative overflow-hidden">
      {/* Glitch Overlay Effect */}
      <div className="absolute inset-0 bg-accent/5 opacity-20 pointer-events-none" />

      <h1 className="text-4xl md:text-5xl font-black mb-8 italic uppercase tracking-tighter relative z-10">
        SYSTEM_FAILURE_MUHYO_TECH
      </h1>

      <div className="max-w-xl p-8 border border-accent/20 bg-accent/5 rounded-2xl mb-12 relative z-10 backdrop-blur-sm">
        <p className="text-[10px] uppercase font-black opacity-40 mb-4 tracking-[0.4em]">
          Anomaly Report
        </p>
        <p className="text-white/80 leading-relaxed italic border-l-2 border-accent pl-4 text-left font-sans text-sm">
          {error.message ||
            "Unknown anomaly detected in core execution thread."}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 relative z-10">
        <button
          onClick={() => reset()}
          className="px-12 py-5 bg-accent text-accent-foreground font-black uppercase tracking-[0.3em] text-[10px] rounded-full shadow-2xl shadow-accent/20 hover:scale-105 transition-all cursor-pointer"
        >
          Initiate Core Reset &rarr;
        </button>
        <Link
          href="/"
          className="px-12 py-5 border border-accent/20 rounded-full hover:bg-accent/5 transition-all uppercase tracking-[0.3em] text-[10px] font-black text-accent flex items-center justify-center"
        >
          Abort to Safe Mode
        </Link>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Ghost } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 overflow-hidden relative">
      {/* Decorative Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 blur-[120px] rounded-full" />
      
      <div className="max-w-2xl w-full text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex justify-center mb-8">
            <div className="relative">
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Ghost className="w-24 h-24 text-accent/20" />
              </motion.div>
              <h1 className="text-[12rem] md:text-[16rem] font-black leading-none tracking-tighter text-foreground/5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none">
                404
              </h1>
            </div>
          </div>

          <h2 className="text-4xl md:text-6xl font-black text-foreground mb-6 italic tracking-tight">
            Lost in the <span className="text-accent">Void</span>
          </h2>
          
          <p className="text-muted-foreground text-lg md:text-xl mb-12 max-w-md mx-auto font-medium leading-relaxed">
            The technical resource you are looking for has been moved, deleted, or never existed in this dimension.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-accent text-accent-foreground font-black uppercase text-xs tracking-widest rounded-2xl flex items-center gap-3 shadow-xl shadow-accent/20 hover:bg-accent/90 transition-all"
              >
                <Home className="w-4 h-4" /> Return to Base
              </motion.button>
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="px-8 py-4 bg-card border border-border text-foreground font-black uppercase text-xs tracking-widest rounded-2xl flex items-center gap-3 hover:bg-muted transition-all backdrop-blur-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Go Back
            </button>
          </div>
        </motion.div>

        {/* Binary Rain Background (Subtle) */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] text-[10px] font-mono text-foreground overflow-hidden select-none whitespace-nowrap leading-none pt-10">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="mb-2">
              {Array.from({ length: 100 }).map(() => Math.round(Math.random())).join(" ")}
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground/30">
        System Error // Connection Terminated
      </div>
    </div>
  );
}

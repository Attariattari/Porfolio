"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Search, AlertCircle, MapPinOff } from "lucide-react";
import { Button } from "@/components/ui";
import EditorialBackground from "@/components/ui/EditorialBackground";

export default function NotFound() {
  return (
    <div className="relative min-h-[85vh] flex flex-col items-center justify-center px-6 py-20 overflow-hidden">
      {/* High-End Dynamic Background */}
      <EditorialBackground text="404" />

      <div className="container mx-auto max-w-2xl relative z-10 text-center">
        {/* Animated Visual Feedback */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.8,
            type: "spring",
            stiffness: 100,
          }}
          className="mb-12 flex justify-center"
        >
          <div className="relative">
            {/* Background Glows */}
            <div className="absolute inset-0 bg-accent/20 blur-[80px] rounded-full scale-150 animate-pulse" />
            <div className="absolute -inset-4 bg-gradient-to-tr from-accent/20 to-transparent blur-2xl opacity-50" />
            
            {/* Main Visual Container */}
            <div className="relative glass p-10 rounded-[2.5rem] border-accent/20 shadow-2xl backdrop-blur-xl">
              <MapPinOff className="w-20 h-20 text-accent" />
              
              {/* Floating Technical Tags */}
              <motion.div
                animate={{ y: [0, -10, 0], x: [0, 5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-6 -right-6 glass px-3 py-1.5 rounded-lg border-accent/30 shadow-lg"
              >
                <span className="text-accent text-[10px] font-black tracking-widest uppercase">Lost</span>
              </motion.div>
              
              <motion.div
                animate={{ y: [0, 10, 0], x: [0, -5, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-4 -left-8 glass px-3 py-1.5 rounded-lg border-accent/30 shadow-lg"
              >
                <span className="text-accent text-[10px] font-black tracking-widest uppercase">404 Error</span>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Messaging Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-4 inline-block"
          >
            <span className="text-accent font-black tracking-[0.3em] uppercase text-xs px-4 py-1.5 glass rounded-full border border-accent/10">
              System Alert
            </span>
          </motion.div>

          <h1 className="text-4xl md:text-6xl font-black text-foreground mb-6 tracking-tighter uppercase italic leading-tight">
            PAGE NOT <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-accent/80 to-accent animate-gradient-flow bg-[length:200%_auto]">FOUND</span>
          </h1>
          
          <p className="text-muted-foreground text-base md:text-lg mb-12 max-w-lg mx-auto font-medium opacity-80 leading-relaxed italic">
            "The destination you are seeking appears to have vanished into the digital void. Your request matched no known routes in our system."
          </p>

          {/* Interactive Action Navigation */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full max-w-md mx-auto">
            <Link href="/" className="w-full">
              <Button className="w-full">
                <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Back to Home
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              className="w-full group"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Go Back
            </Button>
          </div>
        </motion.div>

        {/* Metadata Display */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ delay: 1.2, duration: 1.5 }}
          className="mt-20 flex flex-col items-center gap-4"
        >
          <div className="flex items-center gap-4 w-full">
            <div className="h-px flex-grow bg-gradient-to-r from-transparent to-border/50" />
            <div className="flex flex-col gap-1 items-center">
              <span className="text-[10px] uppercase font-black tracking-[0.3em] text-foreground">
                Digital Signature Confirmed
              </span>
              <span className="text-[8px] uppercase font-bold tracking-[0.2em] text-muted-foreground opacity-60">
                MUHYO-TECH-ROUTER-v2.0.4
              </span>
            </div>
            <div className="h-px flex-grow bg-gradient-to-l from-transparent to-border/50" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

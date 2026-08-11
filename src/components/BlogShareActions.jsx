"use client";

import React from "react";
import { motion } from "framer-motion";
import { Share2, ArrowUpRight } from "lucide-react";

export function MotionDiv({ children, className = "", ...props }) {
  return (
    <motion.div className={className} {...props}>
      {children}
    </motion.div>
  );
}

export function MotionFigure({ children, className = "", ...props }) {
  return (
    <motion.figure className={className} {...props}>
      {children}
    </motion.figure>
  );
}

export function CopyLinkButton({ fullShareUrl }) {
  const copyShareUrl = async () => {
    const { toast } = await import("sonner");
    try {
      await navigator.clipboard.writeText(fullShareUrl);
      toast.success("Blog link copied.");
    } catch {
      toast.error("Link copy nahi hua. Please manually copy karein.");
    }
  };

  return (
    <button
      type="button"
      onClick={copyShareUrl}
      className="group/copy flex w-full cursor-pointer items-center justify-between rounded-2xl border border-accent/25 bg-accent/10 p-4 text-accent transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent hover:text-accent-foreground hover:shadow-xl hover:shadow-accent/10 lg:px-4 lg:py-3"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 transition-colors group-hover/copy:bg-white/20 lg:h-9 lg:w-9">
          <Share2 className="w-4 h-4" />
        </div>
        <div className="text-left">
          <span className="block text-xs font-bold tracking-tight">
            Copy Link
          </span>
          <span className="mt-1 block text-[10px] font-medium text-current/65">
            Direct blog URL
          </span>
        </div>
      </div>
      <ArrowUpRight className="w-4 h-4 opacity-70 transition-all group-hover/copy:translate-x-0.5 group-hover/copy:-translate-y-0.5 group-hover/copy:opacity-100" />
    </button>
  );
}

export default CopyLinkButton;

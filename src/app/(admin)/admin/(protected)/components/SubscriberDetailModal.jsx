"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Mail, RefreshCcw, X } from "lucide-react";
import { format } from "date-fns";

export default function SubscriberDetailModal({ subscriber, isOpen, onClose }) {
  if (!isOpen || !subscriber) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-overlay/80 backdrop-blur-md"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-lg bg-background border border-border rounded-[2.5rem] shadow-2xl p-8 overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8">
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
              <Mail className="w-8 h-8 text-accent" />
            </div>
            <div>
              <h3 className="text-2xl font-black italic tracking-tighter text-foreground uppercase">Node Metadata</h3>
              <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">ID: {subscriber._id}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <DetailItem label="Email Identity" value={subscriber.email} />
            <DetailItem label="Authorization" value={subscriber.isActive ? "ACTIVE" : "TERMINATED"} />
            <DetailItem label="Inception" value={subscriber.subscribedAt ? format(new Date(subscriber.subscribedAt), "PPP") : "N/A"} />
            <DetailItem label="Last Pulse" value={subscriber.lastSent ? format(new Date(subscriber.lastSent), "PPP HH:mm") : "NONE"} />
          </div>

          <div className="p-4 bg-muted/50 border border-border/70 rounded-2xl">
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Internal Analytics</span>
            <p className="text-xs text-muted-foreground/70 leading-relaxed italic">
              This node was registered via the {subscriber.email.includes("gmail") ? "Google" : "External"} SMTP relay.
              Intelligence feeds are dispatched on a monthly cycle.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{label}</span>
      <span className="text-[13px] font-bold text-foreground tracking-tight break-all">{value}</span>
    </div>
  );
}

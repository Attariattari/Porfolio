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
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-lg bg-[#0a0f1c] border border-white/10 rounded-[2.5rem] shadow-2xl p-8 overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8">
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
              <Mail className="w-8 h-8 text-accent" />
            </div>
            <div>
              <h3 className="text-2xl font-black italic tracking-tighter text-white uppercase">Node Metadata</h3>
              <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">ID: {subscriber._id}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <DetailItem label="Email Identity" value={subscriber.email} />
            <DetailItem label="Authorization" value={subscriber.isActive ? "ACTIVE" : "TERMINATED"} />
            <DetailItem label="Inception" value={subscriber.subscribedAt ? format(new Date(subscriber.subscribedAt), "PPP") : "N/A"} />
            <DetailItem label="Last Pulse" value={subscriber.lastSent ? format(new Date(subscriber.lastSent), "PPP HH:mm") : "NONE"} />
          </div>
          
          <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Internal Analytics</span>
            <p className="text-xs text-white/60 leading-relaxed italic">
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
      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
      <span className="text-[13px] font-bold text-white tracking-tight break-all">{value}</span>
    </div>
  );
}

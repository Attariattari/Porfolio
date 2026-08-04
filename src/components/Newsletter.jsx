"use client";

import { useState } from "react";
import { Mail, Send, CheckCircle2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.success) {
        setSubscribed(true);
        toast.success(data.message);
        setEmail("");
      } else {
        toast.error(data.error || "Subscription failed.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground mb-4">
        Newsletter
      </h4>
      <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
        Stay updated with our latest blogs, services, and project launches.
      </p>

      <AnimatePresence mode="wait">
        {subscribed ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500"
          >
            <CheckCircle2 size={18} />
            <span className="text-sm font-semibold">Transmission Received!</span>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="relative group"
          >
            <div className="relative">
              <Mail 
                size={18} 
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent transition-colors" 
              />
              <input
                type="email"
                aria-label="Email address for newsletter"
                placeholder="Enter your email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-14 py-4 bg-muted/20 border border-border/40 rounded-2xl text-sm focus:outline-none focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all outline-none text-foreground placeholder:text-muted-foreground/60"
              />
              <button
                type="submit"
                aria-label="Subscribe to newsletter"
                disabled={loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-accent text-background flex items-center justify-center hover:bg-accent/90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-accent/20"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
      
      <p className="text-[10px] text-muted-foreground/50 mt-4 italic">
        * No spam, only innovation. Unsubscribe anytime.
      </p>
    </div>
  );
}

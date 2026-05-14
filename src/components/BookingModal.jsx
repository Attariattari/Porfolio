"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock as ClockIcon, Phone, Mail, User, BookOpen, MessageSquare, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "./ui";
import { toast } from "sonner";
import { SERVICE_OPTIONS } from "@/lib/constants";

const BookingModal = ({ isOpen, onClose, initialService = "" }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: initialService,
    preferredDate: "",
    preferredTime: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => document.body.classList.remove("modal-open");
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/book-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Call booked successfully! We'll contact you soon.");
        setFormData({
          name: "",
          email: "",
          phone: "",
          service: initialService,
          preferredDate: "",
          preferredTime: "",
          message: "",
        });
        onClose();
      } else {
        toast.error(data.message || "Failed to book call.");
      }
    } catch (err) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[150] flex items-end md:items-center justify-center p-0 md:p-8"
      >
        <div
          className="absolute inset-0 bg-background/95 backdrop-blur-xl"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, y: "100%", scale: 1 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: "100%", scale: 1 }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="relative w-full max-w-2xl bg-card border-t md:border border-border rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] md:max-h-none"
        >
          {/* Mobile Drag Handle */}
          <div className="md:hidden w-12 h-1.5 bg-border/40 rounded-full mx-auto mt-4 mb-2 shrink-0" />
          {/* Header */}
          <div className="p-8 md:p-10 border-b border-border/50 flex justify-between items-center bg-accent/5">
            <div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-foreground uppercase italic tracking-tighter">
                Book a <span className="text-accent">Strategy Call</span>
              </h2>
              <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mt-1">
                Let's discuss your next project
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-muted/50 text-foreground flex items-center justify-center hover:bg-accent hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content - Scrollable */}
          <form 
            onSubmit={handleSubmit} 
            className="p-8 md:p-10 pt-4 md:pt-10 space-y-6 overflow-y-auto custom-scrollbar flex-1 pb-24 md:pb-10"
          >
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-accent/80 ml-2">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full bg-background/50 border border-border rounded-xl px-12 py-3 text-sm focus:border-accent/50 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-accent/80 ml-2">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className="w-full bg-background/50 border border-border rounded-xl px-12 py-3 text-sm focus:border-accent/50 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-accent/80 ml-2">Phone (Optional)</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 234 567 890"
                    className="w-full bg-background/50 border border-border rounded-xl px-12 py-3 text-sm focus:border-accent/50 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-accent/80 ml-2">Interest Service</label>
                <div className="relative group">
                  <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors z-10" />
                  <select
                    name="service"
                    required
                    value={formData.service}
                    onChange={handleChange}
                    className="w-full bg-background/50 border border-border rounded-xl px-12 py-3 text-sm focus:border-accent/50 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select Service</option>
                    {SERVICE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-accent/80 ml-2">Preferred Date</label>
                <div className="relative group">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                  <input
                    type="date"
                    name="preferredDate"
                    required
                    value={formData.preferredDate}
                    onChange={handleChange}
                    className="w-full bg-background/50 border border-border rounded-xl px-12 py-3 text-sm focus:border-accent/50 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-accent/80 ml-2">Preferred Time</label>
                <div className="relative group">
                  <ClockIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                  <input
                    type="time"
                    name="preferredTime"
                    required
                    value={formData.preferredTime}
                    onChange={handleChange}
                    className="w-full bg-background/50 border border-border rounded-xl px-12 py-3 text-sm focus:border-accent/50 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-accent/80 ml-2">Message (Optional)</label>
              <div className="relative group">
                <MessageSquare className="absolute left-4 top-4 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                <textarea
                  name="message"
                  rows={3}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us a bit about your project goals..."
                  className="w-full bg-background/50 border border-border rounded-xl px-12 py-3 text-sm focus:border-accent/50 outline-none transition-all resize-none"
                />
              </div>
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Request Call Slot <ArrowRight className="w-4 h-4" /></>}
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BookingModal;

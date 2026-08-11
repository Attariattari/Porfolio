"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui";
import { toast } from "sonner";
import {
  MessageSquare,
  Code2,
  Palette,
  Cpu,
  Smartphone,
  Cloud,
  Search,
  Plus,
  ChevronDown,
  Filter,
  ArrowRight,
} from "lucide-react";
import { SERVICE_OPTIONS } from "@/lib/constants";

export default function ContactFormClient() {
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    service: "",
    otherService: "",
    message: "",
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [dropdownInteractionTimer, setDropdownInteractionTimer] =
    useState(null);

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const dropdownRef = useRef(null);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "service" && value !== "other") {
      setFormData((prev) => ({ ...prev, otherService: "" }));
    }
  };

  const handleDropdownToggle = () => {
    if (!isDropdownOpen) {
      // Opening dropdown
      setIsDropdownOpen(true);
      setShowNotification(true);

      // Auto-hide notification after 3 seconds
      setTimeout(() => setShowNotification(false), 3000);

      // 5-second inactivity timer for auto-scroll
      const timer = setTimeout(() => {
        const otherOption = document.getElementById("other-service-option");
        if (otherOption) {
          otherOption.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }, 5000);
      setDropdownInteractionTimer(timer);
    } else {
      // Closing dropdown
      setIsDropdownOpen(false);
      if (dropdownInteractionTimer) clearTimeout(dropdownInteractionTimer);
    }
  };

  const selectService = (value) => {
    setFormData((prev) => ({ ...prev, service: value }));
    setIsDropdownOpen(false);
    if (dropdownInteractionTimer) clearTimeout(dropdownInteractionTimer);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.message.trim()
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const submissionData = {
        ...formData,
        service:
          formData.service === "other"
            ? formData.otherService
            : formData.service,
      };

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();

      if (!response.ok) {
        console.log("Full server error result:", result);
        const errorMessage = result.error
          ? `${result.message} (${result.error})`
          : result.message;
        throw new Error(errorMessage || "Failed to send message");
      }

      toast.success("Message sent successfully! We'll be in touch soon.");
      setFormData({
        name: "",
        email: "",
        subject: "",
        service: "",
        otherService: "",
        message: "",
      });
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error(error.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lg:col-span-7">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="relative h-full group/form"
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-accent/20 to-accent/20 rounded-[2.8rem] opacity-0 group-hover/form:opacity-100 blur-2xl transition-all duration-700" />

        {/* Form Content */}
        <div className="theme-surface-depth relative z-10 p-8 md:p-12 bg-card backdrop-blur-3xl rounded-[2.8rem] border border-slate-300 dark:border-border/50 shadow-xl shadow-slate-200/40 dark:shadow-none h-full flex flex-col">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground italic">
                Send a message
              </h2>
              <p className="text-accent text-xs font-semibold tracking-normal mt-1">
                Quick contact form
              </p>
            </div>
            <div className="hidden md:block">
              <MessageSquare className="w-10 h-10 text-accent/10" />
            </div>
          </div>

          <form id="contact-form" className="space-y-8" onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-xs font-semibold tracking-normal text-accent/80 ml-2">
                  Your name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  aria-label="Your name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  className="w-full bg-slate-100/90 dark:bg-background/50 border-[1.5px] border-slate-300 dark:border-border/60 rounded-2xl px-6 py-4 text-foreground focus:border-accent focus:bg-white dark:focus:bg-accent/5 focus:ring-4 focus:ring-accent/10 transition-all outline-none placeholder:text-slate-400 dark:placeholder:text-muted-foreground/50 font-semibold text-sm disabled:opacity-50"
                />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-semibold tracking-normal text-accent/80 ml-2">
                  Your email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  aria-label="Your email"
                  placeholder="john@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  className="w-full bg-slate-100/90 dark:bg-background/50 border-[1.5px] border-slate-300 dark:border-border/60 rounded-2xl px-6 py-4 text-foreground focus:border-accent focus:bg-white dark:focus:bg-accent/5 focus:ring-4 focus:ring-accent/10 transition-all outline-none placeholder:text-slate-400 dark:placeholder:text-muted-foreground/50 font-semibold text-sm disabled:opacity-50"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-xs font-semibold tracking-normal text-accent/80 ml-2">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  aria-label="Subject"
                  placeholder="What is this about?"
                  value={formData.subject}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full bg-slate-100/90 dark:bg-background/50 border-[1.5px] border-slate-300 dark:border-border/60 rounded-2xl px-6 py-4 text-foreground focus:border-accent focus:bg-white dark:focus:bg-accent/5 focus:ring-4 focus:ring-accent/10 transition-all outline-none placeholder:text-slate-400 dark:placeholder:text-muted-foreground/50 font-semibold text-sm disabled:opacity-50"
                />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-semibold tracking-normal text-accent/80 ml-2">
                  Related service
                </label>
                <div className="relative" ref={dropdownRef}>
                  {/* Custom Dropdown Trigger */}
                  <button
                    type="button"
                    aria-label="Related service"
                    aria-expanded={isDropdownOpen}
                    onClick={handleDropdownToggle}
                    className={`w-full bg-slate-100/90 dark:bg-background/50 border-[1.5px] border-slate-300 dark:border-border/60 rounded-2xl px-6 py-4 text-foreground transition-all duration-300 outline-none text-sm font-semibold cursor-pointer flex items-center justify-between group/trigger ${isDropdownOpen ? "border-accent ring-4 ring-accent/10 bg-white dark:bg-accent/5" : ""} ${loading ? "opacity-50 pointer-events-none" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      {formData.service ? (
                        (() => {
                          const Icon =
                            {
                              "web-development": Code2,
                              "ui-ux-design": Palette,
                              "api-development": Cpu,
                              "mobile-app-development": Smartphone,
                              "cloud-devops": Cloud,
                              "seo-optimization": Search,
                              other: Plus,
                            }[formData.service] || MessageSquare;
                          return <Icon className="w-4 h-4 text-accent" />;
                        })()
                      ) : (
                        <Filter className="w-4 h-4 text-muted-foreground/40" />
                      )}
                      <span
                        className={
                          !formData.service
                            ? "text-muted-foreground/50"
                            : "font-bold"
                        }
                      >
                        {formData.service
                          ? SERVICE_OPTIONS.find(
                              (opt) => opt.value === formData.service,
                            )?.label || formData.service
                          : "Select a service..."}
                      </span>
                    </div>
                    <motion.div
                      animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                      className="text-muted-foreground/60 group-hover/trigger:text-accent transition-colors"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </motion.div>
                  </button>

                  {/* Smart Notification - Floating Popover */}
                  <AnimatePresence>
                    {isDropdownOpen && showNotification && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: -45 }}
                        exit={{ opacity: 0, scale: 0.8, y: 0 }}
                        className="absolute left-1/2 -translate-x-1/2 top-0 z-[110] whitespace-nowrap bg-accent text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-[0_10px_20px_rgba(var(--accent-rgb),0.3)] pointer-events-none"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                          Custom service entry enabled
                        </div>
                        {/* Tooltip Arrow */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-8 border-transparent border-t-accent" />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full left-0 right-0 mt-3 z-[100] bg-card/95 backdrop-blur-3xl border border-border/50 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden"
                      >
                        <div className="max-h-80 overflow-y-auto p-2 custom-scrollbar">
                          <div className="grid gap-1">
                            {SERVICE_OPTIONS.map((service) => {
                              const Icon =
                                {
                                  "web-development": Code2,
                                  "ui-ux-design": Palette,
                                  "api-development": Cpu,
                                  "mobile-app-development": Smartphone,
                                  "cloud-devops": Cloud,
                                  "seo-optimization": Search,
                                  other: Plus,
                                }[service.value] || MessageSquare;

                              return (
                                <div
                                  key={service.value}
                                  onClick={() =>
                                    selectService(service.value)
                                  }
                                  className={`group/item relative px-4 py-3.5 rounded-xl transition-all duration-300 cursor-pointer flex items-center justify-between ${
                                    formData.service === service.value
                                      ? "bg-accent/10 text-accent"
                                      : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                                  }`}
                                >
                                  <div className="flex items-center gap-4 relative z-10">
                                    <div
                                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                        formData.service === service.value
                                          ? "bg-accent/20"
                                          : "bg-foreground/5 group-hover/item:bg-foreground/10"
                                      }`}
                                    >
                                      <Icon className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-bold tracking-tight">
                                      {service.label}
                                    </span>
                                  </div>
                                  {formData.service === service.value && (
                                    <motion.div
                                      layoutId="active-dot"
                                      className="w-1.5 h-1.5 rounded-full bg-accent relative z-10"
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Custom Input Section */}
                          <div
                            id="other-service-option"
                            className={`mt-2 p-5 bg-accent/5 rounded-2xl border border-accent/10 transition-all ${formData.service === "other" ? "border-accent/30 bg-accent/[0.08]" : "opacity-60 hover:opacity-100"}`}
                          >
                            <div className="flex items-center gap-2 mb-3">
                              <Plus className="w-3 h-3 text-accent" />
                              <p className="text-[10px] font-black text-accent/60 uppercase tracking-widest">
                                Tailored Solution
                              </p>
                            </div>
                            <div className="relative flex items-center">
                              <input
                                type="text"
                                placeholder="Type your unique requirement..."
                                value={formData.otherService}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFormData((prev) => ({
                                    ...prev,
                                    service: "other",
                                  }));
                                }}
                                onChange={(e) => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    service: "other",
                                    otherService: e.target.value,
                                  }));
                                }}
                                className="w-full bg-slate-100/90 dark:bg-background/50 border-[1.5px] border-slate-300 dark:border-border/60 rounded-2xl px-5 py-4 text-xs font-bold focus:border-accent focus:bg-white dark:focus:bg-accent/5 focus:ring-4 focus:ring-accent/10 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-muted-foreground/50 pr-24"
                              />
                              <AnimatePresence>
                                {formData.service === "other" &&
                                  formData.otherService.trim() && (
                                    <motion.button
                                      initial={{
                                        opacity: 0,
                                        scale: 0.8,
                                        x: 10,
                                      }}
                                      animate={{
                                        opacity: 1,
                                        scale: 1,
                                        x: -8,
                                      }}
                                      exit={{
                                        opacity: 0,
                                        scale: 0.8,
                                        x: 10,
                                      }}
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setIsDropdownOpen(false);
                                      }}
                                      className="absolute right-0 bg-accent text-white h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-accent/20 hover:scale-105 active:scale-95 transition-all z-20"
                                    >
                                      Confirm
                                    </motion.button>
                                  )}
                              </AnimatePresence>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Hidden input for accessibility/form data */}
                  <input
                    type="hidden"
                    name="service"
                    value={formData.service}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold tracking-normal text-accent/80 ml-2">
                Your message <span className="text-red-500">*</span>
              </label>
              <textarea
                name="message"
                aria-label="Project details"
                rows={5}
                placeholder="How can we help you?"
                value={formData.message}
                onChange={handleChange}
                disabled={loading}
                required
                className="w-full bg-slate-100/90 dark:bg-background/50 border-[1.5px] border-slate-300 dark:border-border/60 rounded-2xl px-6 py-5 text-foreground focus:border-accent focus:bg-white dark:focus:bg-accent/5 focus:ring-4 focus:ring-accent/10 transition-all outline-none placeholder:text-slate-400 dark:placeholder:text-muted-foreground/50 font-semibold text-sm resize-none disabled:opacity-50"
              />
            </div>

            <motion.div
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              <Button
                type="submit"
                className="w-full"
                disabled={loading || submitted}
              >
                {loading
                  ? "Sending..."
                  : submitted
                    ? "Message Sent!"
                    : "Submit Project Inquiry"}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </motion.div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

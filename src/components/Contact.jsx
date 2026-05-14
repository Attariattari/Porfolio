"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { SectionWrapper, Button } from "./ui";
import { MapPin, Clock, ArrowRight, MessageSquare } from "lucide-react";
import { portfolioData } from "@/lib/data";
import SocialLinks from "./SocialLinks";
import { toast } from "sonner";
import {
  Phone,
  Mail,
  MessageCircle,
  Palette,
  Smartphone,
  Cloud,
  Search,
  Plus,
  Code2,
  Cpu,
  ChevronDown,
  Filter,
} from "lucide-react";
import { SERVICE_OPTIONS } from "@/lib/constants";

const WhatsAppIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 32 32"
    width="24"
    height="24"
    fill="currentColor"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M24.504 7.504A11.88 11.88 0 0 0 16.05 4C9.465 4 4.1 9.36 4.1 15.945a11.9 11.9 0 0 0 1.594 5.973L4 28.109l6.336-1.664a11.96 11.96 0 0 0 5.71 1.457h.005c6.586 0 11.945-5.359 11.949-11.949c0-3.191-1.242-6.191-3.496-8.45zM16.05 25.883h-.004a9.93 9.93 0 0 1-5.055-1.383l-.363-.215l-3.762.985l1.004-3.665l-.234-.375a9.9 9.9 0 0 1-1.52-5.285c0-5.472 4.457-9.925 9.938-9.925a9.86 9.86 0 0 1 7.02 2.91a9.88 9.88 0 0 1 2.905 7.023c0 5.477-4.457 9.93-9.93 9.93zm5.445-7.438c-.297-.148-1.766-.87-2.039-.968c-.273-.102-.473-.149-.672.148c-.2.3-.77.973-.945 1.172c-.172.195-.348.223-.645.074c-.3-.148-1.261-.465-2.402-1.484c-.887-.79-1.488-1.77-1.66-2.067c-.176-.3-.02-.46.129-.61c.136-.132.3-.347.449-.523c.148-.171.2-.296.3-.496c.098-.199.048-.375-.027-.523c-.074-.148-.671-1.621-.921-2.219c-.243-.582-.489-.5-.672-.511c-.172-.008-.371-.008-.57-.008c-.2 0-.524.074-.798.375c-.273.297-1.043 1.02-1.043 2.488c0 1.469 1.07 2.89 1.22 3.09c.148.195 2.105 3.21 5.1 4.504a17 17 0 0 0 1.7.629c.715.226 1.367.195 1.883.12c.574-.085 1.765-.722 2.015-1.421c.247-.695.247-1.293.172-1.418c-.074-.125-.273-.2-.574-.352"
    />
  </svg>
);

const IconMap = {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageSquare,
  MessageCircle,
  WhatsApp: WhatsAppIcon,
};

const resolveIcon = (icon) => {
  if (typeof icon === "string") {
    return IconMap[icon] || MapPin;
  }
  return icon;
};

const Contact = ({ isHomePage = false }) => {
  const { contactInfo, siteConfig } = portfolioData;
  const data = siteConfig.contactPage;

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
  const dropdownRef = React.useRef(null);

  // Click outside to close dropdown
  React.useEffect(() => {
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
          // Subtle highlight effect handled by CSS
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
    <div className="relative overflow-hidden w-full">
      <SectionWrapper id="contact" title="Get In Touch" subtitle="Contact Me">
        <div className="grid lg:grid-cols-12 gap-16 items-start">
          {/* Left Column: Context & Info */}
          <div className="lg:col-span-5 space-y-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold tracking-normal">
                <Clock className="w-3 h-3" /> Quick response:{" "}
                <span className="text-foreground ml-1">
                  {data.quickResponse}
                </span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-none text-foreground px-4 py-2 border-l-4 border-accent bg-accent/5 rounded-r-2xl italic">
                Let's connect
              </h1>
              <p className="text-muted-foreground text-lg font-medium leading-relaxed max-w-md">
                Have an idea? We are here to help you build it. Send us a
                message and let's talk about your project.
              </p>
            </motion.div>

            {/* Info Items */}
            <div className="grid sm:grid-cols-2 gap-4">
              {contactInfo.map((info, idx) => (
                <motion.a
                  key={idx}
                  href={info.href}
                  target={info.target}
                  rel={
                    info.target === "_blank" ? "noopener noreferrer" : undefined
                  }
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="group relative p-6 bg-card/40 backdrop-blur-3xl rounded-[2rem] border border-border/50 hover:border-accent/50 hover:-translate-y-2 transition-all duration-500 shadow-2xl overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div
                    className={`relative w-12 h-12 rounded-2xl bg-gradient-to-br ${info.color} flex items-center justify-center text-white mb-5 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-accent/20`}
                  >
                    {(() => {
                      const Icon = resolveIcon(info.icon);
                      return <Icon className="w-6 h-6" />;
                    })()}
                  </div>
                  <p className="relative text-[10px] font-semibold tracking-normal text-muted-foreground/60 mb-1">
                    {info.label}
                  </p>
                  <p className="text-sm font-bold text-foreground group-hover:text-accent transition-colors">
                    {info.value}
                  </p>
                </motion.a>
              ))}
            </div>

            {/* Socials Connection */}
            <div className="pt-8 border-t border-border/10">
              <p className="text-xs font-semibold text-muted-foreground/60 tracking-normal mb-6 italic">
                Find us on social media
              </p>
              <SocialLinks buttonClassName="w-12 h-12 bg-card rounded-2xl flex items-center justify-center text-muted-foreground transition-all duration-300 border border-border/50 shadow-lg" />
            </div>
          </div>

          {/* Right Column: Premium Form */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative h-full group/form"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-accent/20 to-accent/20 rounded-[2.8rem] opacity-0 group-hover/form:opacity-100 blur-2xl transition-all duration-700" />

              {/* Form Content */}
              <div className="relative z-10 p-8 md:p-12 bg-card backdrop-blur-3xl rounded-[2.8rem] border border-border/50 shadow-2xl h-full flex flex-col">
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

                <form className="space-y-8" onSubmit={handleSubmit}>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-xs font-semibold tracking-normal text-accent/80 ml-2">
                        Your name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={loading}
                        required
                        className="w-full bg-background/50 backdrop-blur-xl border border-border/50 rounded-2xl px-6 py-4 text-foreground focus:border-accent/60 focus:bg-accent/5 transition-all outline-none placeholder:text-muted-foreground/30 font-semibold text-sm shadow-inner disabled:opacity-50"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-semibold tracking-normal text-accent/80 ml-2">
                        Your email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        placeholder="john@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={loading}
                        required
                        className="w-full bg-background/50 backdrop-blur-xl border border-border/50 rounded-2xl px-6 py-4 text-foreground focus:border-accent/60 focus:bg-accent/5 transition-all outline-none placeholder:text-muted-foreground/30 font-semibold text-sm shadow-inner disabled:opacity-50"
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
                        placeholder="What is this about?"
                        value={formData.subject}
                        onChange={handleChange}
                        disabled={loading}
                        className="w-full bg-background/50 backdrop-blur-xl border border-border/50 rounded-2xl px-6 py-4 text-foreground focus:border-accent/60 focus:bg-accent/5 transition-all outline-none placeholder:text-muted-foreground/30 font-semibold text-sm shadow-inner disabled:opacity-50"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-semibold tracking-normal text-accent/80 ml-2">
                        Related service
                      </label>
                      <div className="relative" ref={dropdownRef}>
                        {/* Custom Dropdown Trigger */}
                        <div
                          onClick={handleDropdownToggle}
                          className={`w-full bg-background/50 backdrop-blur-xl border border-border/50 rounded-2xl px-6 py-4 text-foreground transition-all duration-300 outline-none text-sm font-semibold shadow-inner cursor-pointer flex items-center justify-between group/trigger ${isDropdownOpen ? "border-accent/50 ring-4 ring-accent/5 bg-accent/5" : ""} ${loading ? "opacity-50 pointer-events-none" : ""}`}
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
                        </div>

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
                                            : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                                        }`}
                                      >
                                        <div className="flex items-center gap-4 relative z-10">
                                          <div
                                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                              formData.service === service.value
                                                ? "bg-accent/20"
                                                : "bg-white/5 group-hover/item:bg-white/10"
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
                                      className="w-full bg-background/50 border border-border/50 rounded-2xl px-5 py-4 text-xs font-bold focus:border-accent/40 focus:ring-4 focus:ring-accent/5 outline-none transition-all placeholder:text-muted-foreground/30 pr-24"
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
                      rows={5}
                      placeholder="How can we help you?"
                      value={formData.message}
                      onChange={handleChange}
                      disabled={loading}
                      required
                      className="w-full bg-background/50 backdrop-blur-xl border border-border/50 rounded-2xl px-6 py-5 text-foreground focus:border-accent/60 focus:bg-accent/5 transition-all outline-none placeholder:text-muted-foreground/30 font-semibold text-sm resize-none shadow-inner disabled:opacity-50"
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
                          : "Send to our team"}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </motion.div>
                </form>
              </div>
            </motion.div>
          </div>
        </div>

        {!isHomePage && (
          <>
            {/* What Happens Next Section */}
            <section className="mt-12 space-y-16">
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-bold tracking-tight text-foreground italic">
                  What happens <span className="text-accent">next?</span>
                </h2>
                <p className="text-muted-foreground font-semibold text-xs tracking-normal">
                  Simple 3-step process
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {data.process.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="relative p-8 glass rounded-[2.5rem] border border-border group hover:border-accent/30 transition-all shadow-xl"
                  >
                    <div className="text-5xl font-black text-foreground/5 group-hover:text-accent/10 transition-colors absolute top-6 right-8">
                      {item.step}
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-4">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                      {item.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* FAQ Section */}
            <section className="mt-12 mb-20">
              <div className="grid lg:grid-cols-12 gap-16 items-start">
                <div className="lg:col-span-5 sticky top-32">
                  <div className="space-y-6">
                    <h2 className="text-5xl font-bold tracking-tight text-foreground leading-none italic">
                      Common questions
                    </h2>
                    <p className="text-muted-foreground text-lg font-medium leading-relaxed">
                      Here are some simple answers to questions we get asked
                      most often.
                    </p>
                    <div className="pt-8 flex flex-col gap-4">
                      <div className="flex items-center gap-4 group">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                        <span className="text-xs font-semibold tracking-normal text-foreground/60 group-hover:text-foreground transition-colors">
                          Need more help?
                        </span>
                      </div>
                      <Link href="/services">
                        <motion.div whileHover={{ scale: 1.02 }}>
                          <Button variant="outline">
                            Explore our Services
                          </Button>
                        </motion.div>
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-7 space-y-4">
                  {data.faq.map((faq, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      className="group relative"
                    >
                      <details className="glass rounded-3xl border border-border px-8 py-6 cursor-pointer open:bg-accent/5 transition-colors overflow-hidden">
                        <summary className="list-none flex justify-between items-center text-sm font-bold text-foreground group-hover:text-accent transition-colors cursor-pointer">
                          {faq.q}
                          <ArrowRight className="w-4 h-4 transition-transform group-open:rotate-90 group-hover:translate-x-1" />
                        </summary>
                        <p className="mt-6 text-sm text-muted-foreground leading-relaxed font-medium">
                          {faq.a}
                        </p>
                      </details>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* Immersive Map Integration */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-12 relative h-[500px] glass p-2 rounded-[3.5rem] overflow-hidden group shadow-2xl"
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13615.111956555135!2d74.1950337!3d31.4284542!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3918ff06c9a3d767%3A0xe67195449552b75a!2sChung%2C%20Lahore%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1709800000000!5m2!1sen!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-[3rem] grayscale invert contrast-[1.1] opacity-60 group-hover:opacity-100 transition-all duration-1000 group-hover:grayscale-0 group-hover:invert-0"
              ></iframe>

              <div className="absolute top-10 left-10 p-8 glass rounded-[2rem] border border-border shadow-2xl hidden md:block">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs font-bold tracking-normal text-foreground">
                      {data.locationInfo.label}
                    </p>
                    <p className="text-[11px] font-semibold text-muted-foreground tracking-normal mt-1">
                      {data.locationInfo.value}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </SectionWrapper>
    </div>
  );
};

export default Contact;

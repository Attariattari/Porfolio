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
  AlertTriangle,
  Lightbulb,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { SERVICE_OPTIONS } from "@/lib/constants";
import { saveToOfflineOutbox } from "@/lib/offlineOutbox";

const CONTACT_DRAFT_KEY = "muhyo_contact_form_draft";

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
  const [messageQuality, setMessageQuality] = useState(null); // null | 'warn' | 'ok'
  const [aiTemplate, setAiTemplate] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isAiButtonGlowing, setIsAiButtonGlowing] = useState(false);
  const dropdownRef = useRef(null);
  const lastAiParamsRef = useRef("");
  const prevContextRef = useRef({ service: "", otherService: "", subject: "" });
  const hasEverSetupContextRef = useRef(false);
  const aiDebounceTimerRef = useRef(null);

  /**
   * Instant smart fallback template tailored to service and subject.
   * Guarantees zero latency and 100% reliability even if offline.
   */
  const getFallbackAiTemplate = (srv, otherSrv, subj) => {
    let serviceLabel = "Web Development";
    if (srv === "other" && otherSrv?.trim()) {
      serviceLabel = otherSrv.trim();
    } else {
      const match = SERVICE_OPTIONS.find((s) => s.value === srv);
      if (match) serviceLabel = match.label;
    }
    const topic = subj?.trim() ? `for ${subj.trim()}` : "for our upcoming project";

    switch (serviceLabel.toLowerCase()) {
      case "ui/ux design":
        return `I am looking for professional UI/UX design ${topic}. We need modern user flows, high-fidelity Figma prototypes, and an intuitive design system. Please let me know your availability for a project discussion.`;
      case "mobile apps":
      case "mobile app development":
        return `I am looking to develop a high-performance mobile application ${topic}. Key requirements include responsive UI, secure authentication, and smooth API integration. Looking forward to discussing our timeline and scope.`;
      case "api & backend":
      case "api-development":
        return `We require robust backend and API development ${topic}. We need scalable database architecture, secure RESTful endpoints, and seamless third-party integrations. Please let me know when we can connect.`;
      case "cloud & devops":
        return `We are seeking cloud architecture and DevOps support ${topic}. Our primary goals are automated CI/CD deployment pipelines, scalable cloud infrastructure, and reliable monitoring. Looking forward to your consultation.`;
      case "seo optimization":
        return `I am looking for advanced SEO optimization and technical performance audit ${topic}. We want to improve organic rankings, Core Web Vitals, and search visibility. Please share your approach and availability.`;
      default:
        return `I am looking to build a modern, high-performance web application ${topic}. We require clean responsive design, secure authentication, database integration, and fast performance. Please let me know your availability to discuss requirements and estimates.`;
    }
  };

  /**
   * Fetches Gemini AI generated project description based on service and subject.
   */
  const fetchAiTemplate = async (force = false, currentFormState = null) => {
    const data = currentFormState || formData;
    const currentParamsKey = `${data.service}|${data.otherService}|${data.subject}`;
    if (!force && lastAiParamsRef.current === currentParamsKey && aiTemplate) return;
    lastAiParamsRef.current = currentParamsKey;

    // Immediately set smart fallback so the user sees a relevant template with 0ms delay
    const instantFallback = getFallbackAiTemplate(data.service, data.otherService, data.subject);
    if (!aiTemplate || force) {
      setAiTemplate(instantFallback);
    }

    setIsAiLoading(true);
    try {
      const res = await fetch("/api/ai/contact-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service: data.service || "web-development",
          otherService: data.otherService || "",
          subject: data.subject || "",
          currentNotes: data.message || "",
        }),
      });
      const result = await res.json().catch(() => ({}));
      if (result?.success && result?.data?.description) {
        setAiTemplate(result.data.description);
      }
    } catch (err) {
      console.warn("[ContactForm] AI template fetch error:", err);
    } finally {
      setIsAiLoading(false);
    }
  };

  /**
   * Directly applies Gemini AI project proposal based on selected service and subject
   */
  const handleUseAiTemplateClick = async () => {
    setIsAiButtonGlowing(false);
    const currentTemplate =
      aiTemplate ||
      getFallbackAiTemplate(
        formData.service,
        formData.otherService,
        formData.subject
      );

    setFormData((prev) => ({
      ...prev,
      message: currentTemplate,
    }));

    setMessageQuality({
      level: "info",
      hint: "✨ AI project proposal generated and applied based on your selected service & subject! Feel free to customize any details.",
    });

    toast.success("AI project template applied!");

    // Background refresh with live Gemini AI variation
    void fetchAiTemplate(true);
  };

  /**
   * Analyses whether a message looks like gibberish / keyboard-mash / low quality.
   * Accurately catches strings like "hsdfhskjhf", "hjdhf,jsdhkjd", repeated characters,
   * while allowing legitimate brief inquiries or non-English/Urdu transliterations.
   */
  const analyzeMessageQuality = (text) => {
    const trimmed = text ? text.trim() : "";
    if (!trimmed || trimmed.length < 4) return null;

    // Split by spaces, commas, periods into words
    const words = trimmed
      .split(/[\s,.-]+/)
      .map((w) => w.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, ""))
      .filter(Boolean);

    const lettersOnly = (trimmed.match(/[a-zA-Z]/g) || []).join("");
    const vowels = (trimmed.match(/[aeiouAEIOU]/g) || []).length;
    const vowelRatio = lettersOnly.length > 0 ? vowels / lettersOnly.length : 0;

    const allowedVowelless =
      /^(rhythm|crypt|lynx|sync|gym|fly|dry|cry|spy|shy|why|myth|hymn|lynch|tryst|by|my)s?$/i;

    // 1. Any individual word/token has 5+ consecutive consonants (e.g. "hsdfhskjhf", "hjdhf")
    const hasWordWith5Consonants = words.some((w) => {
      const letters = (w.match(/[a-zA-Z]/g) || []).join("");
      return (
        /[bcdfghjklmnpqrstvwxyz]{5,}/i.test(letters) &&
        !allowedVowelless.test(letters)
      );
    });

    // 2. Any single word of 4+ letters with zero vowels (e.g. "hjdhf", "jsdhkjd", "asdf")
    const hasVowellessWord = words.some((w) => {
      const letters = (w.match(/[a-zA-Z]/g) || []).join("");
      return (
        letters.length >= 4 &&
        (letters.match(/[aeiouAEIOU]/g) || []).length === 0 &&
        !allowedVowelless.test(letters)
      );
    });

    // 3. Repeated character: 4+ same character (e.g. 'aaaa', 'ssss')
    const hasRepeatChar = /(.)\1{3,}/.test(trimmed);

    // 4. Repeated short sequences (e.g. 'asdfasdf', 'hahaha', '121212')
    const hasRepeatSequence = /(..+?)\1{2,}/.test(trimmed);

    // 5. Common keyboard mash sequences
    const keyboardMashRegex =
      /(?:asdf|sdfg|dfgh|fghj|ghjk|hjkl|jkl;|qwerty|werty|ertyu|rtyui|tyuio|zxcvb|xcvbn|cvbnm|hsdf|skjh|dfhs|fhsk|jklj|lkjh|hjdh|sdhk|jdhk)/i;
    const hasKeyboardMash = keyboardMashRegex.test(trimmed);

    // 6. Overall low vowel ratio on text with 10+ letters (< 16% vowels)
    const isExtremelyLowVowels = lettersOnly.length >= 10 && vowelRatio < 0.16;

    // 7. Single unbroken word over 20 characters without being a link
    const isSingleBlob =
      words.length === 1 && trimmed.length > 20 && !trimmed.startsWith("http");

    // Gibberish flag triggers
    if (hasWordWith5Consonants || hasVowellessWord) {
      return {
        isGibberish: true,
        hint: `Random or unclear characters detected (e.g. '${trimmed.slice(0, 16)}'). Please describe your project in proper words.`,
      };
    }

    if (hasKeyboardMash && (vowelRatio < 0.28 || words.length <= 2)) {
      return {
        isGibberish: true,
        hint: "Keyboard pattern detected. Please write a clear description of your requirements.",
      };
    }

    if (hasRepeatChar || hasRepeatSequence) {
      return {
        isGibberish: true,
        hint: "Repeating character pattern detected. Please describe your project in meaningful words.",
      };
    }

    if (isExtremelyLowVowels) {
      return {
        isGibberish: true,
        hint: "Your message appears unclear or unreadable. Please describe your project in complete sentences.",
      };
    }

    if (isSingleBlob) {
      return {
        isGibberish: true,
        hint: "Please separate your words with spaces so we can review your message easily.",
      };
    }

    return null;
  };

  // 1. Restore draft on mount & analyze quality if draft has message
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CONTACT_DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          setFormData((prev) => ({ ...prev, ...parsed }));
          if (parsed.message) {
            const analysis = analyzeMessageQuality(parsed.message);
            if (analysis?.isGibberish) {
              setMessageQuality({ level: "warn", hint: analysis.hint });
            }
          }
          const hasSavedService = Boolean(
            parsed.service &&
            (parsed.service !== "other" || parsed.otherService?.trim())
          );
          const hasSavedSubject = Boolean(parsed.subject?.trim());
          if (hasSavedService && hasSavedSubject) {
            hasEverSetupContextRef.current = true;
            prevContextRef.current = {
              service: parsed.service,
              otherService: parsed.otherService || "",
              subject: parsed.subject.trim(),
            };
          }
        }
      }
    } catch {}
  }, []);

  // Determine if service & subject are selected (required for AI template button visibility)
  const hasServiceSelected = Boolean(
    formData.service &&
    (formData.service !== "other" || formData.otherService?.trim())
  );
  const hasSubjectFilled = Boolean(formData.subject?.trim());
  const canShowAiButton = hasServiceSelected && hasSubjectFilled;

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (aiDebounceTimerRef.current) clearTimeout(aiDebounceTimerRef.current);
    };
  }, []);

  // Handle service or subject changes:
  // - First time: button shows in normal state, message NOT removed, NO glowing.
  // - Subsequent changes: message is removed, button glows, fresh AI template fetched.
  useEffect(() => {
    if (!hasServiceSelected || !hasSubjectFilled) {
      if (isAiButtonGlowing) setIsAiButtonGlowing(false);
      return;
    }

    // First time both are ready
    if (!hasEverSetupContextRef.current) {
      hasEverSetupContextRef.current = true;
      prevContextRef.current = {
        service: formData.service,
        otherService: formData.otherService || "",
        subject: formData.subject.trim(),
      };
      void fetchAiTemplate(false, formData);
      return;
    }

    // Subsequent changes
    const prev = prevContextRef.current;
    const serviceChanged =
      prev.service !== formData.service ||
      (formData.service === "other" && prev.otherService !== (formData.otherService || ""));
    const subjectChanged = prev.subject.trim() !== formData.subject.trim();

    if (serviceChanged || subjectChanged) {
      prevContextRef.current = {
        service: formData.service,
        otherService: formData.otherService || "",
        subject: formData.subject.trim(),
      };

      // 1. Remove previous message
      setFormData((curr) => (curr.message ? { ...curr, message: "" } : curr));

      // 2. Reset quality warning / info card
      setMessageQuality(null);

      // 3. Make AI template button glow to invite user to use new template
      setIsAiButtonGlowing(true);

      // 4. Fetch updated AI template for new service & subject
      if (aiDebounceTimerRef.current) clearTimeout(aiDebounceTimerRef.current);
      aiDebounceTimerRef.current = setTimeout(() => {
        void fetchAiTemplate(true, formData);
      }, 350);
    }
  }, [
    formData.service,
    formData.otherService,
    formData.subject,
    hasServiceSelected,
    hasSubjectFilled,
  ]);

  // 2. Persist draft on user input
  useEffect(() => {
    try {
      const hasContent =
        Boolean(formData.name) ||
        Boolean(formData.email) ||
        Boolean(formData.message) ||
        Boolean(formData.subject);

      if (hasContent) {
        localStorage.setItem(CONTACT_DRAFT_KEY, JSON.stringify(formData));
      }
    } catch {}
  }, [formData]);

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
    const updatedForm = {
      ...formData,
      [name]: value,
    };

    if (name === "service" && value !== "other") {
      updatedForm.otherService = "";
    }
    setFormData(updatedForm);

    // Real-time message quality analysis
    if (name === "message") {
      // If user types their own message, return glowing button to normal
      if (isAiButtonGlowing) {
        setIsAiButtonGlowing(false);
      }

      const analysis = analyzeMessageQuality(value);
      if (!analysis) {
        setMessageQuality(null);
      } else if (analysis.isGibberish) {
        setMessageQuality({ level: "warn", hint: analysis.hint });
        // Automatically fetch Gemini AI proposal for current service & subject
        fetchAiTemplate(false, updatedForm);
      } else {
        setMessageQuality(null);
      }
    }

    // If user edits subject or custom service while warning is shown, regenerate AI template
    if (
      (name === "service" || name === "otherService" || name === "subject") &&
      messageQuality?.level === "warn"
    ) {
      fetchAiTemplate(true, updatedForm);
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
    const updatedForm = { ...formData, service: value };
    setFormData(updatedForm);
    setIsDropdownOpen(false);
    if (dropdownInteractionTimer) clearTimeout(dropdownInteractionTimer);
    if (messageQuality?.level === "warn") {
      fetchAiTemplate(true, updatedForm);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic required fields validation
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.message.trim()
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Message quality validation: block gibberish like 'hsdfhskjhf'
    const messageAnalysis = analyzeMessageQuality(formData.message);
    if (messageAnalysis?.isGibberish) {
      toast.error(
        "Please describe your project properly. Random characters or keyboard mash are not accepted."
      );
      setMessageQuality({ level: "warn", hint: messageAnalysis.hint });
      const msgElem = document.getElementById("contact-message-input");
      if (msgElem) {
        msgElem.scrollIntoView({ behavior: "smooth", block: "center" });
        msgElem.focus();
      }
      return;
    }

    // Ensure message has meaningful length (at least 10 characters)
    if (formData.message.trim().length < 10) {
      toast.error(
        "Please write a descriptive message with at least 10-15 characters."
      );
      setMessageQuality({
        level: "warn",
        hint: "Please write at least 10-15 characters clearly describing what you need help with.",
      });
      const msgElem = document.getElementById("contact-message-input");
      if (msgElem) {
        msgElem.scrollIntoView({ behavior: "smooth", block: "center" });
        msgElem.focus();
      }
      return;
    }

    // Guard: if "Other" is selected, a custom service description is required
    if (formData.service === "other" && !formData.otherService.trim()) {
      toast.error("Please describe your custom service requirement");
      return;
    }

    setLoading(true);
    const submissionData = {
      ...formData,
      service:
        formData.service === "other"
          ? formData.otherService
          : formData.service,
    };

    // If already offline, save directly to outbox
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      saveToOfflineOutbox({
        endpoint: "/api/contact",
        payload: submissionData,
        label: "Contact Message",
      });
      try {
        localStorage.removeItem(CONTACT_DRAFT_KEY);
      } catch {}
      toast.success(
        "Saved to Outbox: You're currently offline. Your message is safely stored and will be sent automatically as soon as you reconnect!",
        { duration: 6000 }
      );
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
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      // Safely parse the response — server may return empty body on fatal crash
      let result = {};
      try {
        const text = await response.text();
        if (text?.trim()) result = JSON.parse(text);
      } catch {
        // Body was empty or malformed JSON — treat as generic server error
        result = { message: "Server error — please try again." };
      }

      if (!response.ok) {
        console.log("Full server error result:", result);
        const specificError =
          (Array.isArray(result.errors) && result.errors[0]?.message) ||
          result.message ||
          result.error;
        throw new Error(specificError || "Failed to send message");
      }

      toast.success("Message sent successfully! We'll be in touch soon.");
      try {
        localStorage.removeItem(CONTACT_DRAFT_KEY);
      } catch {}
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

      // If network failure or offline, safely queue to outbox
      const isNetworkError =
        (typeof navigator !== "undefined" && !navigator.onLine) ||
        error.message?.includes("fetch") ||
        error.name === "TypeError" ||
        error.name === "OfflineError";

      if (isNetworkError) {
        saveToOfflineOutbox({
          endpoint: "/api/contact",
          payload: submissionData,
          label: "Contact Message",
        });
        try {
          localStorage.removeItem(CONTACT_DRAFT_KEY);
        } catch {}
        toast.success(
          "Connection Interrupted: Your message was safely saved to the offline outbox and will be delivered automatically upon reconnection!",
          { duration: 6000 }
        );
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
      } else {
        toast.error(error.message || "Failed to send message. Please try again.");
      }
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
              <div className="flex items-center justify-between ml-2">
                <label className="text-xs font-semibold tracking-normal text-accent/80">
                  Your message <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2.5">
                  {formData.message.trim().length > 0 && (
                    <span
                      className={`text-[11px] font-medium transition-colors ${
                        messageQuality?.level === "warn"
                          ? "text-amber-500 font-bold"
                          : "text-muted-foreground/60"
                      }`}
                    >
                      {formData.message.trim().length} chars
                    </span>
                  )}

                  {/* AI Template button: ONLY visible when both service & subject are selected */}
                  <AnimatePresence>
                    {canShowAiButton && (
                      <motion.button
                        key="use-ai-template-btn"
                        initial={{ opacity: 0, scale: 0.85, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.85, y: -4 }}
                        transition={{ duration: 0.2 }}
                        type="button"
                        onClick={handleUseAiTemplateClick}
                        disabled={isAiLoading}
                        title="Generate project description using Gemini AI based on selected service and subject"
                        className={`relative inline-flex items-center gap-1.5 text-[11px] font-bold rounded-full transition-all duration-300 cursor-pointer ${
                          isAiButtonGlowing
                            ? "bg-gradient-to-r from-accent via-accent to-accent/90 text-white border-2 border-accent shadow-[0_0_24px_rgba(var(--accent-rgb),0.65)] ring-4 ring-accent/35 animate-pulse scale-105"
                            : "bg-accent/10 hover:bg-accent text-accent hover:text-white border border-accent/25 hover:border-accent shadow-sm hover:shadow-accent/20 active:scale-95"
                        } px-3.5 py-1.5`}
                      >
                        <Sparkles
                          className={`w-3.5 h-3.5 ${
                            isAiLoading
                              ? "animate-spin"
                              : isAiButtonGlowing
                              ? "animate-bounce text-white"
                              : ""
                          }`}
                        />
                        <span>
                          {isAiLoading
                            ? "Generating..."
                            : isAiButtonGlowing
                            ? "✨ Use our AI template"
                            : "Use our AI template"}
                        </span>
                        {isAiButtonGlowing && (
                          <span className="relative flex h-2 w-2 ml-0.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                          </span>
                        )}
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <textarea
                id="contact-message-input"
                name="message"
                aria-label="Project details"
                rows={5}
                placeholder="Briefly describe your project or requirement — what you need, your goals, and any relevant details."
                value={formData.message}
                onChange={handleChange}
                disabled={loading}
                required
                className={`w-full bg-slate-100/90 dark:bg-background/50 border-[1.5px] rounded-2xl px-6 py-5 text-foreground focus:bg-white dark:focus:bg-accent/5 focus:ring-4 transition-all outline-none placeholder:text-slate-400 dark:placeholder:text-muted-foreground/50 font-semibold text-sm resize-none disabled:opacity-50 ${
                  messageQuality?.level === "warn"
                    ? "border-amber-400 focus:border-amber-400 focus:ring-amber-400/10 shadow-sm shadow-amber-500/10"
                    : "border-slate-300 dark:border-border/60 focus:border-accent focus:ring-accent/10"
                }`}
              />

              {/* Message quality inline notification */}
              <AnimatePresence>
                {messageQuality && (
                  <motion.div
                    key="msg-quality"
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className={`flex items-start gap-3 rounded-2xl px-4 py-3.5 border ${
                      messageQuality.level === "warn"
                        ? "bg-amber-500/10 border-amber-400/40 text-amber-900 dark:text-amber-100"
                        : "bg-accent/[0.08] dark:bg-accent/[0.12] border-accent/30 text-foreground"
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className={`mt-0.5 flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${
                        messageQuality.level === "warn"
                          ? "bg-amber-500/20 text-amber-600 dark:text-amber-300"
                          : "bg-accent/20 text-accent"
                      }`}
                    >
                      {messageQuality.level === "warn" ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p
                          className={`text-xs font-black uppercase tracking-wider ${
                            messageQuality.level === "warn"
                              ? "text-amber-700 dark:text-amber-300"
                              : "text-accent dark:text-cyan-300"
                          }`}
                        >
                          {messageQuality.level === "warn"
                            ? "Please describe properly"
                            : "AI Proposal Assistant"}
                        </p>
                        {messageQuality.level === "warn" ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-200 border border-amber-500/30">
                            Clear words required
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/20 text-accent border border-accent/30">
                            Google Gemini AI
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-xs font-semibold leading-relaxed ${
                          messageQuality.level === "warn"
                            ? "text-amber-900 dark:text-amber-200"
                            : "text-blue-900 dark:text-blue-200"
                        }`}
                      >
                        {messageQuality.hint}
                      </p>

                      {/* AI Generated Tailored Proposal Box */}
                      <div className="mt-3 pt-3 border-t border-amber-500/20 dark:border-amber-500/30 space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent/15 border border-accent/25 text-accent text-[10px] font-extrabold tracking-wide uppercase">
                            <Sparkles className="w-3 h-3 text-accent" />
                            AI-Tailored Proposal ({formData.service === "other" && formData.otherService ? formData.otherService : formData.service ? SERVICE_OPTIONS.find((s) => s.value === formData.service)?.label || formData.service : "Web Development"})
                          </div>
                          <button
                            type="button"
                            onClick={() => fetchAiTemplate(true)}
                            disabled={isAiLoading}
                            title="Regenerate with Gemini AI"
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-accent hover:underline transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            <RefreshCw className={`w-3 h-3 ${isAiLoading ? "animate-spin" : ""}`} />
                            Regenerate
                          </button>
                        </div>

                        {/* Proposal Text Display */}
                        <div className="relative rounded-xl bg-background/70 dark:bg-background/50 border border-border/70 p-3.5 shadow-inner">
                          {isAiLoading ? (
                            <div className="flex items-center gap-2 py-1 text-xs font-semibold text-accent animate-pulse">
                              <Sparkles className="w-3.5 h-3.5 animate-spin text-accent" />
                              <span>Gemini AI is crafting a tailored proposal...</span>
                            </div>
                          ) : (
                            <p className="text-xs font-medium text-foreground/90 dark:text-foreground/95 leading-relaxed italic border-l-2 border-accent pl-3 py-0.5">
                              &ldquo;{aiTemplate || getFallbackAiTemplate(formData.service, formData.otherService, formData.subject)}&rdquo;
                            </p>
                          )}
                        </div>

                        {/* Action: Use this AI template */}
                        <div className="flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              setIsAiButtonGlowing(false);
                              const templateToUse =
                                aiTemplate ||
                                getFallbackAiTemplate(
                                  formData.service,
                                  formData.otherService,
                                  formData.subject
                                );
                              setFormData((prev) => ({
                                ...prev,
                                message: templateToUse,
                              }));
                              setMessageQuality(null);
                              toast.success("AI project template applied!");
                            }}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-accent text-white text-xs font-bold shadow-md shadow-accent/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                          >
                            <span>Use this AI template</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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

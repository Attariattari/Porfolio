"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  Sparkles,
  User,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui";

const initialFormState = {
  name: "",
  email: "",
  phone: "",
  serviceSlug: "",
  preferredDate: "",
  preferredTime: "",
  projectType: "",
  timelinePreference: "",
  contactPreference: "",
  message: "",
  website: "",
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[+\d\s().-]{7,24}$/;

const serviceValue = (value) =>
  typeof value === "string" ? value : value?.slug || value?.value || "";

const FieldShell = ({ icon: Icon, children }) => (
  <div className="relative group">
    <Icon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-accent" />
    {children}
  </div>
);

const ErrorText = ({ error }) =>
  error ? <p className="mt-1 text-xs font-semibold text-red-400">{error}</p> : null;

const baseInputClass =
  "w-full rounded-xl border border-border/70 bg-background/70 px-12 py-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/60 focus:border-accent/60 focus:bg-background/90";

export default function BookingForm({
  initialServiceSlug = "",
  source = "booking-form",
  sourcePage = "",
  contextTitle = "",
  onSuccess,
  submitLabel = "Submit Booking Request",
  className = "",
}) {
  const [formData, setFormData] = useState({
    ...initialFormState,
    serviceSlug: serviceValue(initialServiceSlug),
  });
  const [services, setServices] = useState([]);
  const [serviceLoading, setServiceLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [descriptionSource, setDescriptionSource] = useState("manual");
  const aiSourceNotesRef = useRef("");
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    fetch("/api/services/options")
      .then((res) => res.json())
      .then((payload) => {
        if (!active) return;
        setServices(Array.isArray(payload.data) ? payload.data : []);
      })
      .catch(() => {
        if (active) setServices([]);
      })
      .finally(() => {
        if (active) setServiceLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const selectedService = useMemo(
    () => services.find((service) => service.slug === formData.serviceSlug),
    [formData.serviceSlug, services],
  );

  const projectTypeOptions = selectedService?.projectTypes || [];

  const updateField = (name, value) => {
    setFormData((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setErrorMessage("");
    if (name === "message") {
      setAiError("");
      setDescriptionSource("manual");
    }
  };

  const handleServiceChange = (value) => {
    setFormData((current) => ({
      ...current,
      serviceSlug: value,
      projectType: "",
    }));
    setErrors((current) => ({ ...current, serviceSlug: "", projectType: "" }));
    setErrorMessage("");
    setAiError("");
    setDescriptionSource("manual");
    aiSourceNotesRef.current = "";
  };

  const validate = () => {
    const nextErrors = {};

    if (formData.website.trim()) nextErrors.website = "Invalid submission.";
    if (formData.name.trim().length < 2) nextErrors.name = "Name is required.";
    if (!emailPattern.test(formData.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (formData.phone.trim() && !phonePattern.test(formData.phone.trim())) {
      nextErrors.phone = "Enter a valid phone number.";
    }
    if (!formData.serviceSlug) nextErrors.serviceSlug = "Select a service.";
    if (!formData.projectType) nextErrors.projectType = "Select a project type.";
    if (!formData.preferredDate) nextErrors.preferredDate = "Select a preferred date.";
    if (!formData.preferredTime) nextErrors.preferredTime = "Select a preferred time.";
    if (formData.message.trim().length < 10) {
      nextErrors.message = "Project details must be at least 10 characters.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleGenerateDescription = async ({ projectType, automatic = false } = {}) => {
    const requestedProjectType = projectType || formData.projectType;
    if (!selectedService || !requestedProjectType || aiLoading) return;

    const sourceNotes = automatic ? aiSourceNotesRef.current : formData.message;
    if (!automatic) aiSourceNotesRef.current = formData.message;

    setAiLoading(true);
    setAiError("");
    setErrors((current) => ({ ...current, message: "" }));

    try {
      const response = await fetch("/api/ai/booking-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceSlug: selectedService.slug,
          projectType: requestedProjectType,
          timelinePreference: formData.timelinePreference,
          currentDescription: sourceNotes,
        }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.success || !result.data?.description) {
        throw new Error(result.message || "AI could not generate a description.");
      }

      setFormData((current) => ({
        ...current,
        message: result.data.description,
      }));
      setDescriptionSource("ai");
    } catch (error) {
      setAiError(
        error.message || "AI could not prepare the description. You can still write it manually.",
      );
    } finally {
      setAiLoading(false);
    }
  };

  const handleProjectTypeChange = (value) => {
    const shouldRegenerate =
      Boolean(value) && descriptionSource === "ai" && Boolean(formData.message.trim());

    setFormData((current) => ({ ...current, projectType: value }));
    setErrors((current) => ({ ...current, projectType: "" }));
    setErrorMessage("");
    setAiError("");

    if (shouldRegenerate) {
      void handleGenerateDescription({ projectType: value, automatic: true });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        ...formData,
        serviceTitle: selectedService?.title || "",
        source,
        sourcePage,
        contextTitle,
      };

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json().catch(() => ({}));

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to submit booking request.");
      }

      const message =
        result.message ||
        "Your booking request has been submitted successfully. I'll review your project details and get back to you as soon as possible.";
      setSuccessMessage(message);
      setFormData({ ...initialFormState, serviceSlug: serviceValue(initialServiceSlug) });
      setDescriptionSource("manual");
      aiSourceNotesRef.current = "";
      onSuccess?.(result.data);
    } catch (error) {
      setErrorMessage(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      <input
        type="text"
        name="website"
        aria-label="Website"
        value={formData.website}
        onChange={(e) => updateField("website", e.target.value)}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
      />

      {successMessage && (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm font-semibold text-emerald-300">
          <div className="flex gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p>{successMessage}</p>
              <p className="mt-1 text-xs text-emerald-200/75">
                Response time may vary depending on availability and project details.
              </p>
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-semibold text-red-300">
          <div className="flex gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 ml-2 block text-[10px] font-black uppercase tracking-widest text-accent/80">
            Full Name
          </label>
          <FieldShell icon={User}>
            <input
              type="text"
              name="name"
              aria-label="Full name"
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="Your name"
              className={baseInputClass}
            />
          </FieldShell>
          <ErrorText error={errors.name} />
        </div>

        <div>
          <label className="mb-2 ml-2 block text-[10px] font-black uppercase tracking-widest text-accent/80">
            Email Address
          </label>
          <FieldShell icon={Mail}>
            <input
              type="email"
              name="email"
              aria-label="Email address"
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="you@example.com"
              className={baseInputClass}
            />
          </FieldShell>
          <ErrorText error={errors.email} />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 ml-2 block text-[10px] font-black uppercase tracking-widest text-accent/80">
            Phone
          </label>
          <FieldShell icon={Phone}>
            <input
              type="tel"
              name="phone"
              aria-label="Phone number"
              value={formData.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              placeholder="+92 322 4458481"
              className={baseInputClass}
            />
          </FieldShell>
          <ErrorText error={errors.phone} />
        </div>

        <div>
          <label className="mb-2 ml-2 block text-[10px] font-black uppercase tracking-widest text-accent/80">
            Service
          </label>
          <FieldShell icon={BookOpen}>
            <select
              name="serviceSlug"
              aria-label="Service"
              value={formData.serviceSlug}
              onChange={(e) => handleServiceChange(e.target.value)}
              disabled={serviceLoading}
              className={`${baseInputClass} cursor-pointer appearance-none pr-11 disabled:opacity-60`}
            >
              <option value="">{serviceLoading ? "Loading services..." : "Select service"}</option>
              {services.map((service) => (
                <option key={service.slug} value={service.slug}>
                  {service.title}
                </option>
              ))}
            </select>
            <ChevronDown
              aria-hidden="true"
              className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
          </FieldShell>
          <ErrorText error={errors.serviceSlug} />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 ml-2 block text-[10px] font-black uppercase tracking-widest text-accent/80">
            Preferred Date
          </label>
          <FieldShell icon={Calendar}>
            <input
              type="date"
              name="preferredDate"
              aria-label="Preferred date"
              value={formData.preferredDate}
              onChange={(e) => updateField("preferredDate", e.target.value)}
              className={baseInputClass}
            />
          </FieldShell>
          <ErrorText error={errors.preferredDate} />
        </div>

        <div>
          <label className="mb-2 ml-2 block text-[10px] font-black uppercase tracking-widest text-accent/80">
            Preferred Time
          </label>
          <FieldShell icon={Clock}>
            <input
              type="time"
              name="preferredTime"
              aria-label="Preferred time"
              value={formData.preferredTime}
              onChange={(e) => updateField("preferredTime", e.target.value)}
              className={baseInputClass}
            />
          </FieldShell>
          <ErrorText error={errors.preferredTime} />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div>
          <label className="mb-2 ml-2 block text-[10px] font-black uppercase tracking-widest text-accent/80">
            Project Type
          </label>
          <div className="relative">
            <select
              name="projectType"
              aria-label="Project type"
              value={formData.projectType}
              onChange={(e) => handleProjectTypeChange(e.target.value)}
              disabled={aiLoading}
              className="w-full cursor-pointer appearance-none rounded-xl border border-border/70 bg-background/70 py-3 pl-4 pr-11 text-sm text-foreground outline-none transition-all focus:border-accent/60 focus:bg-background/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">
                {selectedService ? "Select project type" : "First select a service"}
              </option>
              {projectTypeOptions.map((projectType) => (
                <option key={projectType} value={projectType}>
                  {projectType}
                </option>
              ))}
            </select>
            <ChevronDown
              aria-hidden="true"
              className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
          </div>
          <ErrorText error={errors.projectType} />
        </div>

        <div>
          <label className="mb-2 ml-2 block text-[10px] font-black uppercase tracking-widest text-accent/80">
            Timeline
          </label>
          <div className="relative">
            <select
              name="timelinePreference"
              aria-label="Timeline"
              value={formData.timelinePreference}
              onChange={(e) => updateField("timelinePreference", e.target.value)}
              className="w-full appearance-none rounded-xl border border-border/70 bg-background/70 py-3 pl-4 pr-11 text-sm text-foreground outline-none transition-all focus:border-accent/60 focus:bg-background/90"
            >
              <option value="">Not sure yet</option>
              <option value="as-soon-as-possible">As soon as possible</option>
              <option value="this-month">This month</option>
              <option value="next-month">Next month</option>
              <option value="flexible">Flexible</option>
            </select>
            <ChevronDown
              aria-hidden="true"
              className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 ml-2 block text-[10px] font-black uppercase tracking-widest text-accent/80">
            Contact Preference
          </label>
          <div className="relative">
            <select
              name="contactPreference"
              aria-label="Contact preference"
              value={formData.contactPreference}
              onChange={(e) => updateField("contactPreference", e.target.value)}
              className="w-full appearance-none rounded-xl border border-border/70 bg-background/70 py-3 pl-4 pr-11 text-sm text-foreground outline-none transition-all focus:border-accent/60 focus:bg-background/90"
            >
              <option value="">Any method</option>
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
            <ChevronDown
              aria-hidden="true"
              className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
          </div>
        </div>
      </div>

      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 pl-2">
          <label
            htmlFor="booking-project-details"
            className="text-[10px] font-black uppercase tracking-widest text-accent/80"
          >
            Project Details
          </label>
          {selectedService && formData.projectType && (
            <button
              type="button"
              onClick={() => handleGenerateDescription()}
              disabled={aiLoading}
              className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3 py-1.5 text-[11px] font-bold text-accent transition-colors hover:bg-accent/15 disabled:cursor-wait disabled:opacity-70"
              aria-label={formData.message.trim() ? "Improve project details with AI" : "Generate project details with AI"}
            >
              {aiLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              {aiLoading
                ? "Writing..."
                : formData.message.trim()
                  ? "Improve with AI"
                  : "Generate with AI"}
            </button>
          )}
        </div>
        <div className="relative group">
          <MessageSquare className="absolute left-4 top-4 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-accent" />
          <textarea
            id="booking-project-details"
            name="message"
            aria-label="Project details"
            rows={6}
            value={formData.message}
            onChange={(e) => updateField("message", e.target.value)}
            placeholder={
              selectedService && formData.projectType
                ? "Add any specific goals or requirements, then use AI to turn them into a professional brief..."
                : "Select a service and project type, then describe your goals and requirements..."
            }
            className="w-full resize-none rounded-xl border border-border/70 bg-background/70 px-12 py-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/60 focus:border-accent/60 focus:bg-background/90"
          />
        </div>
        {aiError && <p className="mt-2 text-xs font-semibold text-amber-400">{aiError}</p>}
        <ErrorText error={errors.message} />
      </div>

      <Button type="submit" className="w-full" disabled={loading || serviceLoading || aiLoading}>
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : submitLabel}
      </Button>
    </form>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  User,
  Save,
  MapPin,
  Mail,
  Phone,
  Briefcase,
  Building,
  Clock,
  Target,
  FileText,
  Plus,
  Trash2,
} from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";
import { uploadPendingImages } from "@/lib/uploadHelper";
import useAdminStore from "@/lib/store/adminStore";
import { aboutData } from "@/lib/data";

// Comprehensive validation schema
const aboutSchema = z.object({
  // Core Profile
  name: z.string().min(2, "Name is required"),
  company: z.string().min(2, "Company is required"),
  role: z.string().min(2, "Role is required"),
  avatar: z.array(z.any()).min(1, "Avatar image is required"),
  avatarAlt: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),

  // Content
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  longDescription: z.string().min(20, "Description must be at least 20 characters"),
  mission: z.string().min(10, "Mission statement is required"),
  typewriterWords: z.array(z.string().min(1)).optional(),

  // Contact
  email: z.string().email("Invalid email address"),
  phone: z.string().min(5, "Phone number is required"),
  location: z.string().min(5, "Location is required"),
  workingHours: z.string().min(5, "Working hours are required"),

  // Experiences
  experiences: z
    .array(
      z.object({
        year: z.string().min(1, "Year is required"),
        period: z.string().optional(),
        role: z.string().min(1, "Role is required"),
        company: z.string().min(1, "Company is required"),
        duration: z.string().min(1, "Duration is required"),
        description: z.string().min(1, "Description is required"),
        milestones: z.string().optional(),
        highlights: z.string().optional(),
      }),
    )
    .optional(),
});

const SectionHeader = ({ icon: Icon, title, desc }) => (
  <div className="mb-6 flex items-start gap-3 border-b border-white/[0.07] pb-5">
    <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-sky-400/10 text-sky-300 ring-1 ring-inset ring-sky-400/15"><Icon className="size-4" /></div>
    <div><p className="text-[9px] font-bold uppercase tracking-[.2em] text-slate-600">About content</p><h2 className="mt-1 text-sm font-semibold text-slate-100">{title}</h2><p className="mt-1 text-xs leading-5 text-slate-500">{desc}</p></div>
  </div>
);

const structuredSectionKeys = [
  "hero",
  "story",
  "whatIBuild",
  "skills",
  "education",
  "approach",
  "whyChoose",
  "values",
  "availability",
  "finalCTA",
  "keywords",
];

function getStructuredSections(source = aboutData) {
  return Object.fromEntries(
    structuredSectionKeys.map((key) => [
      key,
      structuredClone(source[key] ?? aboutData[key] ?? (key === "keywords" ? [] : {})),
    ]),
  );
}

const inputClass = "w-full rounded-xl border border-white/[0.08] bg-slate-950/35 px-4 py-3 text-sm text-slate-200 outline-none transition-all placeholder:text-slate-700 focus:border-sky-400/40";

function EditorField({ label, multiline = false, rows = 3, ...props }) {
  return (
    <label className="block space-y-2">
      <span className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      {multiline ? (
        <textarea {...props} rows={rows} className={`${inputClass} resize-y`} />
      ) : (
        <input {...props} className={inputClass} />
      )}
    </label>
  );
}

function RepeatableEditor({ title, items = [], fields, onChange, onAdd, onRemove }) {
  return (
    <div className="space-y-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-2 rounded-lg border border-sky-400/20 bg-sky-400/[0.06] px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-sky-300 transition-colors hover:bg-sky-400/10"
        >
          <Plus className="h-3.5 w-3.5" /> Add
        </button>
      </div>
      {items.map((item, index) => (
        <div key={`${title}-${index}`} className="space-y-4 rounded-xl border border-white/[0.07] bg-slate-950/25 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-accent">
              {title} {index + 1}
            </span>
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="rounded-lg p-2 text-status-danger transition-colors hover:bg-red-500/10"
              aria-label={`Remove ${title} ${index + 1}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {fields.map((field) => (
              <div key={field.key} className={field.fullWidth ? "md:col-span-2" : ""}>
                <EditorField
                  label={field.label}
                  multiline={field.multiline}
                  rows={field.rows}
                  value={item?.[field.key] || ""}
                  placeholder={field.placeholder || ""}
                  onChange={(event) => onChange(index, field.key, event.target.value)}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
      {items.length === 0 && (
        <p className="rounded-xl border border-dashed border-border p-5 text-center text-sm text-muted-foreground">
          No {title.toLowerCase()} entries added yet.
        </p>
      )}
    </div>
  );
}

// REMOVED: SocialLinkInput component - Social links now managed separately

export default function AboutForm() {
  const { about, updateAbout, addNotification, fetchAbout } = useAdminStore();
  const [isSaving, setIsSaving] = useState(false);
  const [sections, setSections] = useState(() => getStructuredSections());
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("highlight");
  const [isHighlighted, setIsHighlighted] = useState(false);

  useEffect(() => {
    if (!highlightId) return;
    const startTimer = window.setTimeout(() => setIsHighlighted(true), 0);
    const endTimer = window.setTimeout(() => setIsHighlighted(false), 4000);
    return () => {
      window.clearTimeout(startTimer);
      window.clearTimeout(endTimer);
    };
  }, [highlightId]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(aboutSchema),
    defaultValues: about || {},
  });

  useEffect(() => {
    // Fetch about data from database on component mount
    fetchAbout();
  }, [fetchAbout]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!about || Object.keys(about).length === 0) return;
      const source = { ...aboutData, ...about };
      reset({
        ...source,
        avatar: source.avatar ? [source.avatar] : [],
        typewriterWords: source.typewriterWords || [],
        experiences: (source.experiences || []).map((exp) => ({
          ...exp,
          milestones: Array.isArray(exp.milestones)
            ? exp.milestones.join(", ")
            : exp.milestones || "",
          highlights: Array.isArray(exp.highlights)
            ? exp.highlights.join(", ")
            : exp.highlights || "",
        })),
      });
      setSections(getStructuredSections(source));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [about, reset]);

  const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({
    control,
    name: "experiences",
  });

  const { fields: typewriterFields, append: appendTypewriter, remove: removeTypewriter } = useFieldArray({
    control,
    name: "typewriterWords",
  });

  const updateSectionField = (section, field, value) => {
    setSections((current) => ({
      ...current,
      [section]: { ...(current[section] || {}), [field]: value },
    }));
  };

  const updateNestedSectionField = (section, group, field, value) => {
    setSections((current) => ({
      ...current,
      [section]: {
        ...(current[section] || {}),
        [group]: { ...(current[section]?.[group] || {}), [field]: value },
      },
    }));
  };

  const updateListItem = (section, index, field, value) => {
    setSections((current) => ({
      ...current,
      [section]: (current[section] || []).map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const addListItem = (section, item) => {
    setSections((current) => ({
      ...current,
      [section]: [...(current[section] || []), item],
    }));
  };

  const removeListItem = (section, index) => {
    setSections((current) => ({
      ...current,
      [section]: (current[section] || []).filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const updateHeroCta = (index, field, value) => {
    setSections((current) => ({
      ...current,
      hero: {
        ...(current.hero || {}),
        ctas: (current.hero?.ctas || []).map((cta, ctaIndex) =>
          ctaIndex === index ? { ...cta, [field]: value } : cta,
        ),
      },
    }));
  };

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      const parsedSections = sections;

      // Upload avatar if changed
      const avatarUrls = await uploadPendingImages(data.avatar);
      const finalAvatar = avatarUrls[0] || about?.avatar || "";

      // Format experiences
      const formattedExperiences = data.experiences
        ? data.experiences.map((exp) => ({
            ...exp,
            milestones: exp.milestones
              ? exp.milestones
                  .split(",")
                  .map((m) => m.trim())
                  .filter(Boolean)
              : [],
            highlights: exp.highlights
              ? exp.highlights.split(",").map((item) => item.trim()).filter(Boolean)
              : [],
          }))
        : [];

      const formattedData = {
        ...data,
        ...parsedSections,
        avatar: finalAvatar,
        experiences: formattedExperiences,
        hero: {
          ...(parsedSections.hero || {}),
          image: parsedSections.hero?.image || finalAvatar,
        },
        availability: {
          ...(parsedSections.availability || {}),
          email: parsedSections.availability?.email || data.email,
          phone: parsedSections.availability?.phone || data.phone,
          location: parsedSections.availability?.location || data.location,
          workingHours:
            parsedSections.availability?.workingHours || data.workingHours,
        },
      };

      const res = await updateAbout(formattedData);

      if (res.success) {
        addNotification({
          title: "Profile Updated",
          message: "Your professional profile has been updated successfully",
          type: "success",
        });
        toast.success("Profile saved!");

        // 🚀 REAL-TIME SYNC: Refresh the admin store to update all components
        // Using fetchAbout() from the store to pull fresh data from the DB
        await fetchAbout();
      } else {
        toast.error("Failed to save profile");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.message || "Error saving profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`mx-auto max-w-[1500px] space-y-6 pb-20 transition-all duration-1000 ${isHighlighted ? "ring-2 ring-sky-400/20" : ""}`}>
      <header className="relative overflow-hidden rounded-[26px] border border-white/[0.08] bg-[#0d1727] p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-sky-400/[0.06] blur-3xl" />
        <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div className="flex items-start gap-4"><span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-sky-400/10 text-sky-300 ring-1 ring-inset ring-sky-400/15"><User className="size-5" /></span><div><p className="text-[10px] font-bold uppercase tracking-[.24em] text-sky-300">Profile editor</p><h1 className="mt-2 text-2xl font-semibold tracking-[-.035em] text-white sm:text-3xl">About page</h1><p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">Manage your professional identity, story, experience and supporting page content.</p></div></div>
          <button type="submit" form="about-editor-form" disabled={isSaving} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-sky-300 px-6 text-xs font-bold text-slate-950 transition hover:bg-sky-200 disabled:opacity-50"><Save className="size-4" />{isSaving ? "Saving changes" : "Publish profile"}</button>
        </div>
      </header>

      <form id="about-editor-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* ====== AVATAR SECTION ====== */}
        <div className="rounded-[24px] border border-white/[0.08] bg-[#0d1727] p-6 sm:p-8">
          <SectionHeader
            icon={User}
            title="Profile Photo"
            desc="Upload a professional, high-quality avatar"
          />
          <div className="relative z-10">
            <Controller
              name="avatar"
              control={control}
              render={({ field }) => (
                <ImageUploader
                  images={field.value || []}
                  onChange={field.onChange}
                  compact
                  maxFiles={1}
                />
              )}
            />
            {errors.avatar && (
              <p className="text-[10px] text-red-400 font-bold uppercase pl-2 mt-2">
                {errors.avatar.message}
              </p>
            )}
            <input
              {...register("avatarAlt")}
              className={`${inputClass} mt-4`}
              placeholder="Accessible avatar description"
            />
          </div>
        </div>

        {/* ====== IDENTITY SECTION ====== */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-[24px] border border-white/[0.08] bg-[#0d1727] p-6 sm:p-8">
            <SectionHeader
              icon={Briefcase}
              title="Professional Identity"
              desc="Your name, role, and company information"
            />
            <div className="space-y-6 relative z-10">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-accent/80 block mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    {...register("name")}
                    className="w-full pl-12 pr-4 py-3 bg-muted/50 border border-border rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent/40 outline-none transition-all"
                  />
                </div>
                {errors.name && <p className="text-[10px] text-red-400 mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-accent/80 block mb-2">
                  Company / Brand
                </label>
                <div className="relative">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    {...register("company")}
                    className="w-full pl-12 pr-4 py-3 bg-muted/50 border border-border rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent/40 outline-none transition-all"
                  />
                </div>
                {errors.company && <p className="text-[10px] text-red-400 mt-1">{errors.company.message}</p>}
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-accent/80 block mb-2">
                  Professional Role / Title
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    {...register("role")}
                    className="w-full pl-12 pr-4 py-3 bg-muted/50 border border-border rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent/40 outline-none transition-all"
                  />
                </div>
                {errors.role && <p className="text-[10px] text-red-400 mt-1">{errors.role.message}</p>}
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-accent/80 block mb-2">
                  Short Bio (1-2 lines)
                </label>
                <textarea
                  {...register("bio")}
                  rows={2}
                  placeholder="Brief professional summary..."
                  className="w-full p-3 bg-muted/50 border border-border rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent/40 outline-none resize-none transition-all"
                />
                {errors.bio && <p className="text-[10px] text-red-400 mt-1">{errors.bio.message}</p>}
              </div>
            </div>
          </div>

          {/* ====== CONTACT SECTION ====== */}
        <div className="rounded-[24px] border border-white/[0.08] bg-[#0d1727] p-6 sm:p-8">
            <SectionHeader
              icon={MapPin}
              title="Contact Information"
              desc="Email, phone, and location details"
            />
            <div className="space-y-6 relative z-10">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-accent/80 block mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    {...register("email")}
                    className="w-full pl-12 pr-4 py-3 bg-muted/50 border border-border rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent/40 outline-none transition-all"
                  />
                </div>
                {errors.email && <p className="text-[10px] text-red-400 mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-accent/80 block mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    {...register("phone")}
                    placeholder="+1 (555) 000-0000"
                    className="w-full pl-12 pr-4 py-3 bg-muted/50 border border-border rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent/40 outline-none transition-all"
                  />
                </div>
                {errors.phone && <p className="text-[10px] text-red-400 mt-1">{errors.phone.message}</p>}
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-accent/80 block mb-2">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    {...register("location")}
                    placeholder="City, Country"
                    className="w-full pl-12 pr-4 py-3 bg-muted/50 border border-border rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent/40 outline-none transition-all"
                  />
                </div>
                {errors.location && <p className="text-[10px] text-red-400 mt-1">{errors.location.message}</p>}
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-accent/80 block mb-2">
                  Working Hours (e.g., 9 AM - 6 PM PST)
                </label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    {...register("workingHours")}
                    placeholder="9 AM - 6 PM PST"
                    className="w-full pl-12 pr-4 py-3 bg-muted/50 border border-border rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent/40 outline-none transition-all"
                  />
                </div>
                {errors.workingHours && <p className="text-[10px] text-red-400 mt-1">{errors.workingHours.message}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* ====== CONTENT SECTION ====== */}
        <div className="rounded-[24px] border border-white/[0.08] bg-[#0d1727] p-6 sm:p-8">
          <SectionHeader
            icon={FileText}
            title="Professional Content"
            desc="Your story, mission, and professional narrative"
          />
          <div className="space-y-6 relative z-10">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-accent/80 block mb-2">
                Detailed Background Story
              </label>
              <textarea
                {...register("longDescription")}
                rows={6}
                placeholder="Tell your professional story, background, and journey..."
                className="w-full p-3 bg-muted/50 border border-border rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent/40 outline-none resize-none transition-all"
              />
              {errors.longDescription && <p className="text-[10px] text-red-400 mt-1">{errors.longDescription.message}</p>}
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-accent/80 block mb-2">
                Mission Statement
              </label>
              <textarea
                {...register("mission")}
                rows={3}
                placeholder="What drives you professionally? Your core mission..."
                className="w-full p-3 bg-muted/50 border border-border rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent/40 outline-none resize-none transition-all"
              />
              {errors.mission && <p className="text-[10px] text-red-400 mt-1">{errors.mission.message}</p>}
            </div>
          </div>
        </div>

        {/* ====== WORK EXPERIENCE ====== */}
        <div className="rounded-[24px] border border-white/[0.08] bg-[#0d1727] p-6 sm:p-8">
          <div className="flex justify-between items-start mb-8 border-b border-border/70 pb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-accent/10 border border-accent/20 text-accent">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black uppercase italic tracking-tighter">
                  Work Experience
                </h2>
                <p className="text-sm text-muted-foreground font-medium mt-1">
                  Your professional journey and achievements
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => appendExp({
                year: "",
                period: "",
                role: "",
                company: "",
                duration: "",
                description: "",
                milestones: "",
                highlights: "",
              })}
              className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-xl font-bold text-sm hover:bg-accent/90 transition-all"
            >
              <Plus className="w-4 h-4" /> Add Experience
            </button>
          </div>

          <div className="space-y-4 relative z-10">
            {expFields.map((field, index) => (
              <div key={field.id} className="p-6 border border-border/70 rounded-2xl space-y-4 bg-card/50">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold uppercase text-accent/60">Experience {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeExp(index)}
                    className="p-1 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    {...register(`experiences.${index}.year`)}
                    placeholder="Year"
                    className="px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:ring-2 focus:ring-accent/20 outline-none"
                  />
                  <input
                    {...register(`experiences.${index}.period`)}
                    placeholder="Period label"
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:ring-2 focus:ring-accent/20 outline-none"
                  />
                  <input
                    {...register(`experiences.${index}.company`)}
                    placeholder="Company"
                    className="px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:ring-2 focus:ring-accent/20 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    {...register(`experiences.${index}.role`)}
                    placeholder="Role/Position"
                    className="px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:ring-2 focus:ring-accent/20 outline-none"
                  />
                  <input
                    {...register(`experiences.${index}.duration`)}
                    placeholder="e.g., Jan 2020 - Present"
                    className="px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:ring-2 focus:ring-accent/20 outline-none"
                  />
                </div>

                <textarea
                  {...register(`experiences.${index}.description`)}
                  placeholder="Job description and responsibilities..."
                  rows={2}
                  className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:ring-2 focus:ring-accent/20 outline-none resize-none"
                />

                <input
                  {...register(`experiences.${index}.milestones`)}
                  placeholder="Milestones (comma-separated)"
                  className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:ring-2 focus:ring-accent/20 outline-none"
                />
                <input
                  {...register(`experiences.${index}.highlights`)}
                  placeholder="Highlights (comma-separated)"
                  className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:ring-2 focus:ring-accent/20 outline-none"
                />
              </div>
            ))}
            {expFields.length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-6">No experiences added yet</p>
            )}
          </div>
        </div>

        {/* ====== STRUCTURED ABOUT PAGE SECTIONS ====== */}
        <div className="rounded-[24px] border border-white/[0.08] bg-[#0d1727] p-6 sm:p-8">
          <SectionHeader
            icon={FileText}
            title="Search Metadata"
            desc="Manage the About page SEO title and description"
          />
          <div className="grid grid-cols-1 gap-6">
            <input
              {...register("seoTitle")}
              className="w-full p-4 bg-muted/50 border border-border rounded-xl text-sm outline-none"
              placeholder="About page SEO title"
            />
            <textarea
              {...register("seoDescription")}
              rows={4}
              className="w-full p-4 bg-muted/50 border border-border rounded-xl text-sm outline-none resize-y"
              placeholder="About page SEO description"
            />
          </div>
        </div>

        {/* ====== STRUCTURED ABOUT PAGE SECTIONS ====== */}
        <div className="rounded-[24px] border border-white/[0.08] bg-[#0d1727] p-6 sm:p-8">
          <SectionHeader
            icon={Target}
            title="Structured About Page Sections"
            desc="Manage the visible About page content with simple fields—no code required"
          />
          <div className="relative z-10 space-y-6">
            <div className="space-y-5 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
              <h3 className="text-sm font-black uppercase tracking-wide text-foreground">Hero & Professional Identity</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <EditorField label="Badge" value={sections.hero?.badge || ""} onChange={(event) => updateSectionField("hero", "badge", event.target.value)} />
                <EditorField label="Title" value={sections.hero?.title || ""} onChange={(event) => updateSectionField("hero", "title", event.target.value)} />
                <div className="md:col-span-2">
                  <EditorField label="Headline" value={sections.hero?.headline || ""} onChange={(event) => updateSectionField("hero", "headline", event.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <EditorField label="Description" multiline rows={4} value={sections.hero?.description || ""} onChange={(event) => updateSectionField("hero", "description", event.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <EditorField
                    label="Highlights (comma-separated)"
                    value={(sections.hero?.highlights || []).join(", ")}
                    onChange={(event) => updateSectionField("hero", "highlights", event.target.value.split(",").map((item) => item.trim()).filter(Boolean))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {(sections.hero?.ctas || []).map((cta, index) => (
                  <div key={`hero-cta-${index}`} className="space-y-3 rounded-xl border border-border bg-background/55 p-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-accent">Hero button {index + 1}</span>
                    <EditorField label="Label" value={cta.label || ""} onChange={(event) => updateHeroCta(index, "label", event.target.value)} />
                    <EditorField label="Link" value={cta.href || ""} onChange={(event) => updateHeroCta(index, "href", event.target.value)} />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-5 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
              <h3 className="text-sm font-black uppercase tracking-wide text-foreground">Professional Story</h3>
              <EditorField label="Section title" value={sections.story?.title || ""} onChange={(event) => updateSectionField("story", "title", event.target.value)} />
              <EditorField
                label="Story paragraphs (one paragraph per line)"
                multiline
                rows={6}
                value={(sections.story?.paragraphs || []).join("\n")}
                onChange={(event) => updateSectionField("story", "paragraphs", event.target.value.split("\n").map((item) => item.trim()).filter(Boolean))}
              />
            </div>

            <RepeatableEditor
              title="What I Build"
              items={sections.whatIBuild}
              fields={[
                { key: "title", label: "Card title" },
                { key: "icon", label: "Icon name" },
                { key: "description", label: "Description", multiline: true, fullWidth: true },
                { key: "link", label: "Page link", fullWidth: true },
              ]}
              onChange={(index, field, value) => updateListItem("whatIBuild", index, field, value)}
              onAdd={() => addListItem("whatIBuild", { icon: "Globe", title: "", description: "", link: "/services" })}
              onRemove={(index) => removeListItem("whatIBuild", index)}
            />

            <div className="space-y-5 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
              <h3 className="text-sm font-black uppercase tracking-wide text-foreground">Skills & Technologies</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {Object.keys(sections.skills || {}).map((category) => (
                  <EditorField
                    key={category}
                    label={`${category} (comma-separated)`}
                    value={(sections.skills?.[category] || []).join(", ")}
                    onChange={(event) => updateSectionField("skills", category, event.target.value.split(",").map((item) => item.trim()).filter(Boolean))}
                  />
                ))}
              </div>
            </div>

            <RepeatableEditor
              title="Education"
              items={sections.education}
              fields={[
                { key: "degree", label: "Degree / qualification" },
                { key: "institute", label: "Institute" },
                { key: "period", label: "Period" },
                { key: "status", label: "Status" },
                { key: "description", label: "Description", multiline: true, fullWidth: true },
              ]}
              onChange={(index, field, value) => updateListItem("education", index, field, value)}
              onAdd={() => addListItem("education", { degree: "", institute: "", period: "", status: "", description: "" })}
              onRemove={(index) => removeListItem("education", index)}
            />

            {[
              ["approach", "Development Approach"],
              ["whyChoose", "Why Choose Muhyo Tech"],
              ["values", "Values & Work Principles"],
            ].map(([section, title]) => (
              <RepeatableEditor
                key={section}
                title={title}
                items={sections[section]}
                fields={[
                  { key: "title", label: "Title" },
                  { key: "icon", label: "Icon name" },
                  { key: "description", label: "Description", multiline: true, fullWidth: true },
                ]}
                onChange={(index, field, value) => updateListItem(section, index, field, value)}
                onAdd={() => addListItem(section, { icon: "Target", title: "", description: "" })}
                onRemove={(index) => removeListItem(section, index)}
              />
            ))}

            <div className="space-y-5 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
              <h3 className="text-sm font-black uppercase tracking-wide text-foreground">Availability & Contact Highlight</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <EditorField label="Title" value={sections.availability?.title || ""} onChange={(event) => updateSectionField("availability", "title", event.target.value)} />
                <EditorField label="Status" value={sections.availability?.status || ""} onChange={(event) => updateSectionField("availability", "status", event.target.value)} />
                <div className="md:col-span-2">
                  <EditorField label="Description" multiline rows={4} value={sections.availability?.description || ""} onChange={(event) => updateSectionField("availability", "description", event.target.value)} />
                </div>
              </div>
              <p className="text-xs leading-5 text-muted-foreground">Email, phone, location and working hours are synchronized from the Contact Information section above.</p>
            </div>

            <div className="space-y-5 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
              <h3 className="text-sm font-black uppercase tracking-wide text-foreground">Final Call to Action</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <EditorField label="Badge" value={sections.finalCTA?.badge || ""} onChange={(event) => updateSectionField("finalCTA", "badge", event.target.value)} />
                <EditorField label="Title" value={sections.finalCTA?.title || ""} onChange={(event) => updateSectionField("finalCTA", "title", event.target.value)} />
                <div className="md:col-span-2">
                  <EditorField label="Description" multiline rows={4} value={sections.finalCTA?.description || ""} onChange={(event) => updateSectionField("finalCTA", "description", event.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {[
                  ["primaryButton", "Primary button"],
                  ["secondaryButton", "Secondary button"],
                  ["tertiaryButton", "Third button"],
                ].map(([group, label]) => (
                  <div key={group} className="space-y-3 rounded-xl border border-white/[0.07] bg-slate-950/25 p-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-accent">{label}</span>
                    <EditorField label="Label" value={sections.finalCTA?.[group]?.label || ""} onChange={(event) => updateNestedSectionField("finalCTA", group, "label", event.target.value)} />
                    <EditorField label="Link" value={sections.finalCTA?.[group]?.href || ""} onChange={(event) => updateNestedSectionField("finalCTA", group, "href", event.target.value)} />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card/50 p-5">
              <EditorField
                label="SEO keywords (comma-separated)"
                multiline
                rows={4}
                value={(sections.keywords || []).join(", ")}
                onChange={(event) => setSections((current) => ({ ...current, keywords: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) }))}
              />
            </div>
          </div>
        </div>

        {/* ====== SAVE BUTTON ====== */}
        <div className="flex justify-end gap-4 sticky bottom-0  p-6 rounded-t-3xl">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-8 py-4 bg-accent text-accent-foreground rounded-2xl font-black text-sm hover:bg-accent/90 disabled:opacity-50 transition-all shadow-lg shadow-accent/30 active:scale-95"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}

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
        role: z.string().min(1, "Role is required"),
        company: z.string().min(1, "Company is required"),
        duration: z.string().min(1, "Duration is required"),
        description: z.string().min(1, "Description is required"),
        milestones: z.string().optional(),
      }),
    )
    .optional(),
});

const SectionHeader = ({ icon: Icon, title, desc }) => (
  <div className="mb-8 border-b border-white/5 pb-6">
    <div className="flex items-center gap-3 mb-2">
      <div className="p-2.5 rounded-xl bg-accent/10 border border-accent/20 text-accent">
        <Icon className="w-5 h-5" />
      </div>
      <h2 className="text-xl font-black uppercase italic tracking-tighter">
        {title}
      </h2>
    </div>
    <p className="text-sm text-muted-foreground font-medium">{desc}</p>
  </div>
);

// REMOVED: SocialLinkInput component - Social links now managed separately

export default function AboutForm() {
  const { about, updateAbout, addNotification, fetchAbout } = useAdminStore();
  const [isSaving, setIsSaving] = useState(false);
  const [sectionJson, setSectionJson] = useState({});
  const [jsonError, setJsonError] = useState("");
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
        })),
      });
      setSectionJson({
        hero: JSON.stringify(source.hero || aboutData.hero, null, 2),
        story: JSON.stringify(source.story || aboutData.story, null, 2),
        whatIBuild: JSON.stringify(source.whatIBuild || aboutData.whatIBuild, null, 2),
        skills: JSON.stringify(source.skills || aboutData.skills, null, 2),
        education: JSON.stringify(source.education || aboutData.education, null, 2),
        approach: JSON.stringify(source.approach || aboutData.approach, null, 2),
        whyChoose: JSON.stringify(source.whyChoose || aboutData.whyChoose, null, 2),
        values: JSON.stringify(source.values || aboutData.values, null, 2),
        availability: JSON.stringify(source.availability || aboutData.availability, null, 2),
        finalCTA: JSON.stringify(source.finalCTA || aboutData.finalCTA, null, 2),
        keywords: JSON.stringify(source.keywords || aboutData.keywords, null, 2),
      });
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

  const onSubmit = async (data) => {
    setIsSaving(true);
    setJsonError("");
    try {
      const parsedSections = {};
      for (const [key, value] of Object.entries(sectionJson)) {
        parsedSections[key] = value?.trim() ? JSON.parse(value) : key === "keywords" ? [] : {};
      }

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
      if (error instanceof SyntaxError) {
        setJsonError("One of the structured section editors contains invalid JSON.");
      }
      toast.error(error.message || "Error saving profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`max-w-5xl mx-auto space-y-12 pb-10 transition-all duration-1000 p-4 rounded-[3rem] ${isHighlighted ? "bg-accent/5 ring-2 ring-accent/20" : ""}`}>
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">
            About{" "}
            <span className="text-accent underline decoration-accent/20 underline-offset-8">
              Profile
            </span>
          </h1>
          <p className="text-muted-foreground mt-3 font-medium">
            Manage your professional profile information and online presence
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
        {/* ====== AVATAR SECTION ====== */}
        <div className="bg-white/[0.01] border border-white/5 p-10 rounded-[3rem]">
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
                />
              )}
            />
            {errors.avatar && (
              <p className="text-[10px] text-red-400 font-bold uppercase pl-2 mt-2">
                {errors.avatar.message}
              </p>
            )}
          </div>
        </div>

        {/* ====== IDENTITY SECTION ====== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="bg-white/[0.01] border border-white/5 p-10 rounded-[3rem]">
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
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent/40 outline-none transition-all"
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
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent/40 outline-none transition-all"
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
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent/40 outline-none transition-all"
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
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent/40 outline-none resize-none transition-all"
                />
                {errors.bio && <p className="text-[10px] text-red-400 mt-1">{errors.bio.message}</p>}
              </div>
            </div>
          </div>

          {/* ====== CONTACT SECTION ====== */}
          <div className="bg-white/[0.01] border border-white/5 p-10 rounded-[3rem]">
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
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent/40 outline-none transition-all"
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
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent/40 outline-none transition-all"
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
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent/40 outline-none transition-all"
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
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent/40 outline-none transition-all"
                  />
                </div>
                {errors.workingHours && <p className="text-[10px] text-red-400 mt-1">{errors.workingHours.message}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* ====== CONTENT SECTION ====== */}
        <div className="bg-white/[0.01] border border-white/5 p-10 rounded-[3rem]">
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
                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent/40 outline-none resize-none transition-all"
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
                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent/40 outline-none resize-none transition-all"
              />
              {errors.mission && <p className="text-[10px] text-red-400 mt-1">{errors.mission.message}</p>}
            </div>
          </div>
        </div>

        {/* ====== WORK EXPERIENCE ====== */}
        <div className="bg-white/[0.01] border border-white/5 p-10 rounded-[3rem]">
          <div className="flex justify-between items-start mb-8 border-b border-white/5 pb-6">
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
              onClick={() => appendExp({ year: "", role: "", company: "", duration: "", description: "" })}
              className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-xl font-bold text-sm hover:bg-accent/90 transition-all"
            >
              <Plus className="w-4 h-4" /> Add Experience
            </button>
          </div>

          <div className="space-y-4 relative z-10">
            {expFields.map((field, index) => (
              <div key={field.id} className="p-6 border border-white/5 rounded-2xl space-y-4 bg-white/[0.02]">
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
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:ring-2 focus:ring-accent/20 outline-none"
                  />
                  <input
                    {...register(`experiences.${index}.company`)}
                    placeholder="Company"
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:ring-2 focus:ring-accent/20 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    {...register(`experiences.${index}.role`)}
                    placeholder="Role/Position"
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:ring-2 focus:ring-accent/20 outline-none"
                  />
                  <input
                    {...register(`experiences.${index}.duration`)}
                    placeholder="e.g., Jan 2020 - Present"
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:ring-2 focus:ring-accent/20 outline-none"
                  />
                </div>

                <textarea
                  {...register(`experiences.${index}.description`)}
                  placeholder="Job description and responsibilities..."
                  rows={2}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:ring-2 focus:ring-accent/20 outline-none resize-none"
                />

                <input
                  {...register(`experiences.${index}.milestones`)}
                  placeholder="Milestones (comma-separated)"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:ring-2 focus:ring-accent/20 outline-none"
                />
              </div>
            ))}
            {expFields.length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-6">No experiences added yet</p>
            )}
          </div>
        </div>

        {/* ====== STRUCTURED ABOUT PAGE SECTIONS ====== */}
        <div className="bg-white/[0.01] border border-white/5 p-10 rounded-[3rem]">
          <SectionHeader
            icon={Target}
            title="Structured About Page Sections"
            desc="Manage hero, story, cards, skills, education, CTA, and SEO fallback content"
          />
          {jsonError && (
            <div className="mb-6 p-4 rounded-2xl border border-red-500/20 bg-red-500/10 text-red-300 text-sm font-bold">
              {jsonError}
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
            {[
              ["hero", "Hero / Professional Identity"],
              ["story", "Short Professional Story"],
              ["whatIBuild", "What I Build Cards"],
              ["skills", "Skills & Technologies"],
              ["education", "Education"],
              ["approach", "Development Approach"],
              ["whyChoose", "Why Choose Muhyo Tech"],
              ["values", "Values / Work Principles"],
              ["availability", "Availability / Contact Highlight"],
              ["finalCTA", "Final CTA"],
              ["keywords", "SEO Keywords"],
            ].map(([key, label]) => (
              <div key={key} className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-accent/80 block">
                  {label}
                </label>
                <textarea
                  value={sectionJson[key] || ""}
                  onChange={(event) =>
                    setSectionJson((current) => ({
                      ...current,
                      [key]: event.target.value,
                    }))
                  }
                  rows={key === "hero" || key === "whatIBuild" ? 12 : 8}
                  spellCheck={false}
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-xs font-mono leading-relaxed focus:ring-2 focus:ring-accent/20 focus:border-accent/40 outline-none resize-y transition-all"
                />
              </div>
            ))}
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

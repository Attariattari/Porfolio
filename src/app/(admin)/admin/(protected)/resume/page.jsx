"use client";

import { useState, useEffect } from "react";
import useAdminStore from "@/lib/store/adminStore";
import DataTable from "@/components/admin/DataTable";
import FormModal from "@/components/admin/FormModal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { z } from "zod";
import { toast } from "sonner";
import { AnimatePresence } from "framer-motion";
import { User, Briefcase, GraduationCap, PlusCircle } from "lucide-react";

const profileSchema = z.object({
  name: z.string().min(2, "Name is required"),
  role: z.string().min(2, "Role is required"),
  tagline: z.string().min(10, "Tagline should be catchy"),
  aboutSummary: z.string().min(50, "About section requires more depth"),
});

const experienceSchema = z.object({
  role: z.string().min(2, "Role title is required"),
  company: z.string().min(2, "Company name is required"),
  duration: z.string().min(2, "Duration is required"),
  metrics: z.string().min(2, "Success metrics required"),
  achievements: z.string().optional(),
});

const jsonArrayField = (label) =>
  z.string().refine((value) => {
    try {
      return Array.isArray(JSON.parse(value || "[]"));
    } catch {
      return false;
    }
  }, `${label} must be a valid JSON array`);

const resumeSectionsSchema = z.object({
  contact: jsonArrayField("Contact"),
  stats: jsonArrayField("Statistics"),
  education: jsonArrayField("Education"),
  skillCategories: jsonArrayField("Skill categories"),
  notableProjects: jsonArrayField("Notable projects"),
});

export default function ResumePage() {
  const { resumeData, fetchResume, updateResume } = useAdminStore();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isExpModalOpen, setIsExpModalOpen] = useState(false);
  const [isSectionsModalOpen, setIsSectionsModalOpen] = useState(false);
  const [editingExp, setEditingExp] = useState(null);

  // Sync with DB on mount
  useEffect(() => {
    fetchResume();
  }, [fetchResume]);

  const expColumns = [
    {
      key: "status",
      label: "Status",
      render: (item) => (
        <div
          className="flex items-center gap-2"
          title={item._isFromDataJs ? "Template - Not yet uploaded to database" : "Uploaded to database"}
        >
          {!item._isFromDataJs && (
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-lg shadow-green-500/50" />
              <span className="text-[9px] font-black text-green-400 uppercase tracking-tighter">Uploaded</span>
            </div>
          )}
          {item._isFromDataJs && (
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full border border-border" />
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">Template</span>
            </div>
          )}
        </div>
      ),
    },
    { key: "role", label: "Executive Role" },
    { key: "company", label: "Organization" },
    { key: "duration", label: "Tenure" },
    { key: "metrics", label: "Performance Metrics" },
  ];

  const profileFields = [
    {
      name: "name",
      label: "Professional Identity",
      placeholder: "Pir Ghulam Muhyo Din",
      required: true,
    },
    {
      name: "role",
      label: "Market Position",
      placeholder: "Full Stack Engineer",
      required: true,
    },
    {
      name: "tagline",
      label: "Strategic Tagline",
      placeholder: "Performance & Scalable Web Applications",
      fullWidth: true,
      required: true,
    },
    {
      name: "aboutSummary",
      label: "Executive Summary",
      type: "textarea",
      fullWidth: true,
      required: true,
    },
  ];

  const expFields = [
    {
      name: "role",
      label: "Role Title",
      placeholder: "e.g. Senior Software Architect",
      required: true,
    },
    {
      name: "company",
      label: "Organization",
      placeholder: "e.g. Google",
      required: true,
    },
    {
      name: "duration",
      label: "Tenure",
      placeholder: "e.g. 2024 - Present",
      required: true,
    },
    {
      name: "metrics",
      label: "Core Achievement",
      placeholder: "e.g. 99.9% Uptime SLA",
      required: true,
    },
    {
      name: "achievements",
      label: "Achievements (one per line)",
      type: "textarea",
      fullWidth: true,
    },
  ];

  const sectionFields = [
    { name: "contact", label: "Contact Items (JSON array)", type: "textarea", fullWidth: true },
    { name: "stats", label: "Professional Statistics (JSON array)", type: "textarea", fullWidth: true },
    { name: "education", label: "Education (JSON array)", type: "textarea", fullWidth: true },
    { name: "skillCategories", label: "Skill Categories (JSON array)", type: "textarea", fullWidth: true },
    { name: "notableProjects", label: "Notable Projects (JSON array)", type: "textarea", fullWidth: true },
  ];

  const onUpdateProfile = async (data) => {
    toast.loading("Synchronizing profile metadata...");
    const res = await updateResume({ ...(resumeData || {}), ...data });
    if (res?.success) setIsProfileModalOpen(false);
  };

  const handleExpAdd = () => {
    setEditingExp(null);
    setIsExpModalOpen(true);
  };

  const onExpSubmit = async (data) => {
    toast.loading("Committing career milestone...");
    const normalizedData = {
      ...data,
      achievements: String(data.achievements || "")
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean),
    };
    const currentExp = resumeData?.experience || [];
    let newExperienceList;
    if (editingExp) {
      newExperienceList = currentExp.map((ex, i) =>
        i === editingExp.index ? { ...ex, ...normalizedData } : ex,
      );
    } else {
      newExperienceList = [...currentExp, normalizedData];
    }
    const res = await updateResume({
      ...(resumeData || {}),
      experience: newExperienceList,
    });
    if (res?.success) setIsExpModalOpen(false);
  };

  const onSectionsSubmit = async (data) => {
    const parsed = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, JSON.parse(value || "[]")]),
    );
    const res = await updateResume({ ...(resumeData || {}), ...parsed });
    if (res?.success) setIsSectionsModalOpen(false);
  };

  const handleExpEdit = (exp) => {
    setEditingExp(exp);
    setIsExpModalOpen(true);
  };

  const handleExpDelete = async (id) => {
    toast.loading("Purging career record...");
    const currentExp = resumeData?.experience || [];
    const newExperienceList = currentExp.filter((_, i) => i !== id);
    await updateResume({
      ...(resumeData || {}),
      experience: newExperienceList,
    });
  };

  const expDataWithId = (resumeData?.experience || []).map((ex, i) => ({
    ...ex,
    id: i,
    index: i,
  }));

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter text-foreground">
            Career{" "}
            <span className="text-secondary underline decoration-secondary/20 underline-offset-8">
              Blueprint
            </span>
          </h1>
          <p className="text-[10px] md:text-sm text-muted-foreground mt-4 font-medium tracking-tight uppercase tracking-widest">
            Orchestrate your professional journey and executive presence.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setIsSectionsModalOpen(true)}
            className="px-8 py-4 bg-muted/50 border border-border rounded-2xl hover:bg-muted hover:border-border transition-all font-black uppercase text-[10px] tracking-widest flex items-center gap-4 text-foreground"
          >
            <GraduationCap className="w-4 h-4 text-secondary" />
            Edit Resume Sections
          </button>
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="px-8 py-4 bg-muted/50 border border-border rounded-2xl hover:bg-muted hover:border-border transition-all font-black uppercase text-[10px] tracking-widest flex items-center gap-4 text-foreground"
          >
            <User className="w-4 h-4 text-secondary" />
            Edit Profile Core
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 border border-border/70 bg-card/40 rounded-[2.5rem]">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-6 flex items-center gap-2">
            <User className="w-3 h-3" /> Profile Snapshot
          </h3>
          <div className="space-y-6">
            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-secondary block mb-1">
                Professional Identity
              </span>
              <p className="text-xl font-black italic text-foreground">
                {resumeData?.name || "Initializing..."}
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-secondary block mb-1">
                Market Position
              </span>
              <p className="font-bold opacity-80 text-foreground/90">
                {resumeData?.role || "Sector Unspecified"}
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-secondary block mb-1">
                Strategic Narrative
              </span>
              <p className="text-sm text-muted-foreground leading-relaxed italic">
                {resumeData?.tagline ||
                  "Architecting high-performance digital ecosystems."}
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 border border-border/70 bg-card/40 rounded-[2.5rem]">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-6 flex items-center gap-2">
            <PlusCircle className="w-3 h-3" /> Professional Metrics
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {(resumeData?.stats || []).map((stat, i) => (
              <div
                key={i}
                className="p-4 bg-muted/50 rounded-2xl border border-border/70 flex flex-col items-center justify-center text-center group hover:bg-muted transition-colors"
              >
                <span className="text-2xl font-black italic mb-1 text-foreground group-hover:scale-110 transition-transform">
                  {stat.value}
                </span>
                <span className="text-[8px] uppercase font-black tracking-widest opacity-50 text-foreground">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex items-center justify-between border-b border-border/70 pb-6">
          <h2 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-4 text-foreground">
            <Briefcase className="w-8 h-8 text-secondary" />
            Professional History
          </h2>
        </div>

        <DataTable
          title="Active Chronology"
          columns={expColumns}
          data={expDataWithId}
          onAdd={handleExpAdd}
          onEdit={handleExpEdit}
          onDelete={handleExpDelete}
        />
      </div>

      <AnimatePresence>
        {isProfileModalOpen && (
          <FormModal
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
            title="Recalibrate Presence"
            schema={profileSchema}
            defaultValues={{
              name: resumeData?.name || "",
              role: resumeData?.role || "",
              tagline: resumeData?.tagline || "",
              aboutSummary: resumeData?.aboutSummary || resumeData?.about || "",
            }}
            onSubmit={onUpdateProfile}
            fields={profileFields}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isExpModalOpen && (
          <FormModal
            isOpen={isExpModalOpen}
            onClose={() => setIsExpModalOpen(false)}
            title={editingExp ? "Refine Milestone" : "Commit New Tenure"}
            schema={experienceSchema}
            defaultValues={editingExp ? {
              ...editingExp,
              achievements: Array.isArray(editingExp.achievements)
                ? editingExp.achievements.join("\n")
                : editingExp.achievements || "",
            } : undefined}
            onSubmit={onExpSubmit}
            fields={expFields}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSectionsModalOpen && (
          <FormModal
            isOpen={isSectionsModalOpen}
            onClose={() => setIsSectionsModalOpen(false)}
            title="Manage Complete Resume"
            schema={resumeSectionsSchema}
            defaultValues={{
              contact: JSON.stringify(resumeData?.contact || [], null, 2),
              stats: JSON.stringify(resumeData?.stats || [], null, 2),
              education: JSON.stringify(resumeData?.education || [], null, 2),
              skillCategories: JSON.stringify(resumeData?.skillCategories || [], null, 2),
              notableProjects: JSON.stringify(resumeData?.notableProjects || [], null, 2),
            }}
            onSubmit={onSectionsSubmit}
            fields={sectionFields}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

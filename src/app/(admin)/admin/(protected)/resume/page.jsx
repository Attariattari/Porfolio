"use client";

import { useState, useEffect } from "react";
import useAdminStore from "@/lib/store/adminStore";
import FormModal from "@/components/admin/FormModal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { z } from "zod";
import { toast } from "sonner";
import { AnimatePresence } from "framer-motion";
import { User, Briefcase, GraduationCap, Pencil, Plus, Trash2, Code2 } from "lucide-react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
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
    router.push("/admin/resume/experience/new");
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
    router.push(`/admin/resume/experience/${exp.index}`);
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
    <div className="mx-auto max-w-[1500px] space-y-6 pb-20">
      <header className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#0d1727] p-6 sm:p-8"><div className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-blue-400/[0.06] blur-3xl" /><div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center"><div className="flex items-start gap-4"><span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-blue-400/10 text-blue-300 ring-1 ring-inset ring-blue-400/15"><Briefcase className="size-5" /></span><div><p className="text-[10px] font-bold uppercase tracking-[.24em] text-blue-300">Career workspace</p><h1 className="mt-2 text-2xl font-semibold tracking-[-.035em] text-white sm:text-3xl">Resume management</h1><p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">Maintain your profile, experience and professional credentials.</p></div></div><div className="flex flex-wrap gap-2">
          <button
            onClick={() => router.push("/admin/resume/sections")}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] px-4 text-xs font-semibold text-slate-400 transition hover:text-white"
          >
            <GraduationCap className="w-4 h-4 text-secondary" />
            Edit Resume Sections
          </button>
          <button
            onClick={() => router.push("/admin/resume/profile")}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-300 px-4 text-xs font-bold text-slate-950 transition hover:bg-blue-200"
          >
            <User className="w-4 h-4 text-secondary" />
            Edit Profile Core
          </button>
        </div></div></header>

      <section className="overflow-hidden rounded-[26px] border border-white/[0.08] bg-[#0d1727]">
        <div className="grid lg:grid-cols-[1.35fr_.65fr]">
          <div className="relative p-6 sm:p-8 lg:p-10"><div className="pointer-events-none absolute -left-16 -top-20 size-56 rounded-full bg-blue-400/[0.055] blur-3xl" /><div className="relative flex flex-col gap-6 sm:flex-row sm:items-center"><div className="grid size-20 shrink-0 place-items-center rounded-[22px] bg-gradient-to-br from-blue-300 to-indigo-500 text-xl font-black text-slate-950 shadow-[0_18px_45px_-20px_rgba(125,211,252,.7)]">{(resumeData?.name || "Resume").split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase()}</div><div className="min-w-0"><p className="text-[9px] font-bold uppercase tracking-[.2em] text-blue-300">Professional profile</p><h2 className="mt-2 truncate text-2xl font-semibold tracking-tight text-white sm:text-3xl">{resumeData?.name || "Your name"}</h2><p className="mt-2 text-sm font-semibold text-blue-200/80">{resumeData?.role || "Professional role"}</p><p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500">{resumeData?.tagline || "Add a concise professional tagline."}</p></div></div><div className="relative mt-7 border-t border-white/[0.07] pt-6"><p className="text-[9px] font-bold uppercase tracking-[.18em] text-slate-600">Career summary</p><p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-400">{resumeData?.aboutSummary || resumeData?.about || "Add your professional summary from Edit Profile Core."}</p></div></div>
          <div className="border-t border-white/[0.07] bg-white/[0.018] p-5 sm:p-7 lg:border-l lg:border-t-0"><p className="mb-4 text-[9px] font-bold uppercase tracking-[.2em] text-slate-600">Career at a glance</p><div className="space-y-2">{(resumeData?.stats || []).map((stat, index) => <div key={index} className="flex items-center justify-between rounded-xl border border-white/[0.065] bg-slate-950/25 px-4 py-3"><span className="text-xs text-slate-500">{stat.label}</span><span className="text-lg font-semibold text-white">{stat.value}</span></div>)}</div><div className="mt-5 grid grid-cols-3 gap-2 border-t border-white/[0.07] pt-5"><OverviewCount icon={Briefcase} value={(resumeData?.experience || []).length} label="Roles" /><OverviewCount icon={GraduationCap} value={(resumeData?.education || []).length} label="Education" /><OverviewCount icon={Code2} value={(resumeData?.skillCategories || resumeData?.skills || []).length} label="Skill sets" /></div></div>
        </div>
      </section>

      <div className="space-y-8">
        <div className="flex flex-col justify-between gap-4 border-b border-white/[0.07] pb-5 sm:flex-row sm:items-center">
          <h2 className="flex items-center gap-3 text-base font-semibold text-slate-100">
            <span className="grid size-9 place-items-center rounded-xl bg-blue-400/10 text-blue-300"><Briefcase className="size-4" /></span>
            Work experience
          </h2>
          <button onClick={handleExpAdd} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-300 px-4 py-3 text-xs font-bold text-slate-950 hover:bg-blue-200"><Plus className="size-4" />Add experience</button>
        </div>

        <div data-columns={expColumns.length} className="relative space-y-3 before:absolute before:bottom-8 before:left-[27px] before:top-8 before:w-px before:bg-blue-400/15">{expDataWithId.map((exp, index) => <div key={exp.id} className="group relative ml-0 grid gap-4 rounded-2xl border border-white/[0.07] bg-[#0d1727] p-5 pl-16 transition hover:border-blue-400/20 md:grid-cols-[1fr_180px_auto]"><span className="absolute left-[18px] top-6 z-10 grid size-5 place-items-center rounded-full border-4 border-[#0d1727] bg-blue-300 shadow-[0_0_0_1px_rgba(125,211,252,.25)]" /><div className="min-w-0"><p className="text-[9px] font-bold uppercase tracking-[.16em] text-blue-300/70">{exp.company}</p><h3 className="mt-1 truncate text-sm font-semibold text-slate-100">{exp.role}</h3><p className="mt-2 text-xs leading-5 text-slate-500">{exp.metrics}</p>{Array.isArray(exp.achievements) && exp.achievements.length > 0 && <p className="mt-2 text-[10px] text-slate-600">{exp.achievements.length} achievements documented</p>}</div><div><p className="text-[9px] font-bold uppercase tracking-[.16em] text-slate-600">Tenure</p><p className="mt-1 text-xs font-medium text-slate-300">{exp.duration}</p><span className={`mt-3 inline-flex rounded-full px-2 py-1 text-[8px] font-bold uppercase tracking-wider ${exp._isFromDataJs ? "bg-white/[0.04] text-slate-600" : "bg-emerald-400/10 text-emerald-300"}`}>{exp._isFromDataJs ? "Template" : "Live"}</span></div><div className="flex items-center gap-1 md:justify-end"><button onClick={() => handleExpEdit(exp)} className="grid size-9 place-items-center rounded-lg text-slate-600 hover:bg-blue-400/10 hover:text-blue-300"><Pencil className="size-3.5" /></button><button onClick={() => handleExpDelete(index)} className="grid size-9 place-items-center rounded-lg text-slate-600 hover:bg-rose-400/10 hover:text-rose-300"><Trash2 className="size-3.5" /></button></div></div>)}</div>
        {expDataWithId.length === 0 && <div className="rounded-2xl border border-dashed border-white/[0.08] py-12 text-center"><Briefcase className="mx-auto size-8 text-slate-700" /><p className="mt-3 text-sm text-slate-500">No work experience added yet.</p></div>}
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <ResumeOverviewSection icon={User} eyebrow="Contact" title="Contact information" empty="No contact details added yet.">
          <div className="grid gap-3 sm:grid-cols-2">{(resumeData?.contact || []).map((item, index) => <div key={index} className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4"><p className="text-[9px] font-bold uppercase tracking-[.16em] text-blue-300/70">{item.icon || `Contact ${index + 1}`}</p><p className="mt-2 break-words text-sm font-medium text-slate-300">{item.text}</p></div>)}</div>
          {(resumeData?.contact || []).length === 0 && <EmptySection text="No contact details added yet." />}
        </ResumeOverviewSection>

        <ResumeOverviewSection icon={GraduationCap} eyebrow="Education" title="Academic background">
          <div className="space-y-3">{(resumeData?.education || []).map((item, index) => <div key={index} className="flex flex-col justify-between gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] p-4 sm:flex-row sm:items-center"><div><h3 className="text-sm font-semibold text-slate-200">{item.degree}</h3><p className="mt-1 text-xs text-slate-500">{item.institution}</p></div><span className="shrink-0 rounded-full bg-blue-400/10 px-3 py-1.5 text-[9px] font-bold text-blue-300">{item.duration}</span></div>)}</div>
          {(resumeData?.education || []).length === 0 && <EmptySection text="No education records added yet." />}
        </ResumeOverviewSection>

        <ResumeOverviewSection icon={Code2} eyebrow="Expertise" title="Skill categories">
          <div className="space-y-4">{(resumeData?.skillCategories || resumeData?.skills || []).map((group, index) => <div key={index} className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4"><h3 className="text-xs font-semibold text-blue-300">{group.category}</h3><div className="mt-3 flex flex-wrap gap-2">{(group.items || []).map((skill, skillIndex) => <span key={skillIndex} className="rounded-lg border border-white/[0.07] bg-slate-950/25 px-3 py-1.5 text-[10px] text-slate-400">{skill}</span>)}</div></div>)}</div>
          {(resumeData?.skillCategories || resumeData?.skills || []).length === 0 && <EmptySection text="No skill categories added yet." />}
        </ResumeOverviewSection>

        <ResumeOverviewSection icon={Briefcase} eyebrow="Portfolio" title="Notable projects">
          <div className="space-y-3">{(resumeData?.notableProjects || resumeData?.projects || []).map((project, index) => <div key={index} className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4"><h3 className="text-sm font-semibold text-slate-200">{project.name}</h3><div className="mt-2 flex flex-wrap gap-2">{(project.tech || []).map((technology, techIndex) => <span key={techIndex} className="text-[9px] font-medium text-blue-300/70">{technology}</span>)}</div><p className="mt-3 text-xs leading-5 text-slate-500">{project.outcome}</p></div>)}</div>
          {(resumeData?.notableProjects || resumeData?.projects || []).length === 0 && <EmptySection text="No notable projects added yet." />}
        </ResumeOverviewSection>
      </div>

      <AnimatePresence>
        {false && isProfileModalOpen && (
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
        {false && isExpModalOpen && (
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
        {false && isSectionsModalOpen && (
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

function OverviewCount({ icon: Icon, value, label }) {
  return <div className="text-center"><Icon className="mx-auto size-3.5 text-blue-300/70" /><p className="mt-2 text-lg font-semibold text-white">{value}</p><p className="mt-0.5 text-[8px] font-bold uppercase tracking-wider text-slate-700">{label}</p></div>;
}

function ResumeOverviewSection({ icon: Icon, eyebrow, title, children }) {
  return <section className="overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#0d1727]"><div className="flex items-center gap-3 border-b border-white/[0.07] px-5 py-4 sm:px-6"><span className="grid size-9 place-items-center rounded-xl bg-blue-400/10 text-blue-300"><Icon className="size-4" /></span><div><p className="text-[9px] font-bold uppercase tracking-[.18em] text-slate-600">{eyebrow}</p><h2 className="mt-1 text-sm font-semibold text-slate-100">{title}</h2></div></div><div className="p-5 sm:p-6">{children}</div></section>;
}

function EmptySection({ text }) {
  return <div className="rounded-xl border border-dashed border-white/[0.08] py-9 text-center text-xs text-slate-600">{text}</div>;
}

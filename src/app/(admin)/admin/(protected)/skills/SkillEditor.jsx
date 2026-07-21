"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { ArrowLeft, Braces, CheckCircle2, Code2, Loader2, Save, Tag, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import useAdminStore from "@/lib/store/adminStore";

export default function SkillEditor({ skillId = null }) {
  const router = useRouter();
  const { skills, fetchSkills, addSkill, updateSkill } = useAdminStore();
  const [loading, setLoading] = useState(Boolean(skillId));
  const [persistedId, setPersistedId] = useState(null);
  const { register, control, reset, handleSubmit, formState: { isSubmitting, errors } } = useForm({ defaultValues: { name: "", level: 75, category: "" } });
  const level = Number(useWatch({ control, name: "level" }) || 0);
  const name = useWatch({ control, name: "name" }) || "Your skill";
  const category = useWatch({ control, name: "category" }) || "Category";

  useEffect(() => { Promise.resolve(fetchSkills()).finally(() => setLoading(false)); }, [fetchSkills]);
  useEffect(() => {
    if (!skillId || skills.length === 0) return;
    const decodedId = decodeURIComponent(skillId);
    const skill = skills.find((item) => item._id === skillId || item.name === decodedId);
    const timer = window.setTimeout(() => {
      if (!skill) return setLoading(false);
      setPersistedId(skill._id || null);
      reset({ name: skill.name || "", level: Number(skill.level || 0), category: skill.category || "" });
      setLoading(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [skillId, skills, reset]);

  const submit = async (data) => {
    const toastId = toast.loading(persistedId ? "Updating skill..." : "Adding skill...");
    try {
      const payload = { ...data, level: Number(data.level) };
      const result = persistedId ? await updateSkill(persistedId, payload) : await addSkill(payload);
      const success = result === true || Object.values(result || {}).includes(true);
      if (!success) throw new Error("Could not save skill");
      toast.success(persistedId ? "Skill updated" : "Skill added", { id: toastId });
      router.push("/admin/skills"); router.refresh();
    } catch (error) { toast.error(error.message, { id: toastId }); }
  };

  if (loading) return <div className="grid min-h-[65vh] place-items-center"><Loader2 className="size-7 animate-spin text-emerald-300" /></div>;

  return (
    <form onSubmit={handleSubmit(submit)} className="mx-auto max-w-5xl pb-24">
      <header className="mb-6 flex flex-col justify-between gap-4 rounded-[22px] border border-white/[0.09] bg-[#0d1727] p-4 shadow-xl sm:flex-row sm:items-center sm:px-6"><div className="flex min-w-0 items-center gap-3"><button type="button" onClick={() => router.push("/admin/skills")} className="grid size-10 shrink-0 place-items-center rounded-xl border border-white/[0.08] text-slate-500 hover:text-white"><ArrowLeft className="size-4" /></button><div><p className="text-[9px] font-bold uppercase tracking-[.2em] text-emerald-300">Capability editor</p><h1 className="mt-1 text-lg font-semibold text-white">{skillId ? "Edit skill" : "Add a new skill"}</h1></div></div><button disabled={isSubmitting} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-300 px-5 text-xs font-bold text-slate-950 hover:bg-emerald-200 disabled:opacity-50">{isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}{skillId ? "Save changes" : "Add skill"}</button></header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#0d1727]"><SectionHeader icon={Braces} eyebrow="Skill details" title="Capability information" /><div className="space-y-6 p-5 sm:p-7"><Field icon={Code2} label="Skill name" error={errors.name?.message}><input {...register("name", { required: "Skill name is required", minLength: { value: 2, message: "Enter at least two characters" } })} placeholder="e.g. Next.js, UI Design, MongoDB" /></Field><Field icon={Tag} label="Category" error={errors.category?.message}><input {...register("category", { required: "Category is required" })} placeholder="e.g. Frontend, Backend, Design" /></Field><Field icon={TrendingUp} label="Proficiency level" error={errors.level?.message}><div className="rounded-xl border border-white/[0.08] bg-slate-950/35 p-4"><div className="mb-4 flex items-center justify-between"><span className="text-xs text-slate-500">Developing</span><span className="text-lg font-semibold tabular-nums text-emerald-300">{level}%</span><span className="text-xs text-slate-500">Expert</span></div><input type="range" min="0" max="100" {...register("level", { min: 0, max: 100, valueAsNumber: true })} className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-emerald-300" /></div></Field><p className="rounded-xl border border-sky-400/10 bg-sky-400/[0.04] p-4 text-xs leading-5 text-slate-500">Use a realistic proficiency level. It will be displayed as a progress indicator on your public portfolio.</p></div></section>

        <aside className="overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#0d1727] lg:sticky lg:top-28"><SectionHeader icon={CheckCircle2} eyebrow="Live preview" title="Skill card" /><div className="p-5 sm:p-6"><div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.035] p-5"><div className="flex items-center justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-semibold text-white">{name}</p><p className="mt-1 text-[9px] font-bold uppercase tracking-[.16em] text-slate-600">{category}</p></div><span className="text-xl font-semibold text-emerald-300">{level}%</span></div><div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full rounded-full bg-emerald-300 transition-all duration-300" style={{ width: `${Math.max(0, Math.min(100, level))}%` }} /></div></div><div className="mt-5 space-y-3 text-xs leading-5 text-slate-500"><p><span className="text-slate-300">0–49%</span> Developing familiarity</p><p><span className="text-slate-300">50–79%</span> Working proficiency</p><p><span className="text-slate-300">80–100%</span> Advanced expertise</p></div></div></aside>
      </div>
    </form>
  );
}

function SectionHeader({ icon: Icon, eyebrow, title }) { return <div className="flex items-center gap-3 border-b border-white/[0.07] px-5 py-4"><span className="grid size-9 place-items-center rounded-xl bg-emerald-400/10 text-emerald-300"><Icon className="size-4" /></span><div><p className="text-[9px] font-bold uppercase tracking-[.18em] text-slate-600">{eyebrow}</p><h2 className="mt-1 text-sm font-semibold text-slate-100">{title}</h2></div></div>; }
function Field({ icon: Icon, label, error, children }) { return <label className="block"><span className="mb-2 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[.16em] text-slate-500"><Icon className="size-3.5" />{label}</span><div className="[&_input:not([type=range])]:w-full [&_input:not([type=range])]:rounded-xl [&_input:not([type=range])]:border [&_input:not([type=range])]:border-white/[0.08] [&_input:not([type=range])]:bg-slate-950/35 [&_input:not([type=range])]:px-4 [&_input:not([type=range])]:py-3.5 [&_input:not([type=range])]:text-sm [&_input:not([type=range])]:outline-none">{children}</div>{error && <p className="mt-2 text-[10px] text-rose-300">{error}</p>}</label>; }

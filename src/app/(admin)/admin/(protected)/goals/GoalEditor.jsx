"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { ArrowLeft, CheckCircle2, Loader2, Save, Star, Target, TrendingUp } from "lucide-react";
import { toast } from "sonner";

const defaults = { title: "", description: "", category: "", status: "planned", priority: "medium", progress: 0, targetDate: "", featured: false, icon: "Target", order: 0, publishStatus: "published" };

export default function GoalEditor({ goalId = null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(Boolean(goalId));
  const [persistedId, setPersistedId] = useState(null);
  const { register, control, reset, handleSubmit, formState: { isSubmitting, errors } } = useForm({ defaultValues: defaults });
  const progress = Number(useWatch({ control, name: "progress" }) || 0);
  const title = useWatch({ control, name: "title" }) || "Your strategic goal";
  const status = useWatch({ control, name: "status" }) || "planned";
  const priority = useWatch({ control, name: "priority" }) || "medium";

  useEffect(() => {
    if (!goalId) return;
    fetch("/api/admin/goals").then((response) => response.json()).then((result) => {
      const decoded = decodeURIComponent(goalId);
      const goal = (result.data || []).find((item) => item._id === goalId || item.title === decoded);
      const timer = window.setTimeout(() => { if (goal) { setPersistedId(goal._isFromDataJs ? null : goal._id); reset({ ...defaults, ...goal, targetDate: goal.targetDate ? new Date(goal.targetDate).toISOString().split("T")[0] : "" }); } setLoading(false); }, 0);
      return () => window.clearTimeout(timer);
    }).catch(() => setLoading(false));
  }, [goalId, reset]);

  const submit = async (data) => {
    const toastId = toast.loading(persistedId ? "Updating goal..." : "Creating goal...");
    try {
      const response = await fetch(persistedId ? `/api/admin/goals/${persistedId}` : "/api/admin/goals", { method: persistedId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...data, progress: Number(data.progress), order: Number(data.order) }) });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || "Could not save goal");
      toast.success(persistedId ? "Goal updated" : "Goal created", { id: toastId });
      router.push("/admin/goals"); router.refresh();
    } catch (error) { toast.error(error.message, { id: toastId }); }
  };

  if (loading) return <div className="grid min-h-[65vh] place-items-center"><Loader2 className="size-7 animate-spin text-amber-300" /></div>;
  return <form onSubmit={handleSubmit(submit)} className="mx-auto max-w-6xl pb-24"><header className="mb-6 flex flex-col justify-between gap-4 rounded-[22px] border border-white/[0.09] bg-[#0d1727] p-4 sm:flex-row sm:items-center sm:px-6"><div className="flex items-center gap-3"><button type="button" onClick={() => router.push("/admin/goals")} className="grid size-10 place-items-center rounded-xl border border-white/[0.08] text-slate-500 hover:text-white"><ArrowLeft className="size-4" /></button><div><p className="text-[9px] font-bold uppercase tracking-[.2em] text-amber-300">Goal editor</p><h1 className="mt-1 text-lg font-semibold text-white">{goalId ? "Edit strategic goal" : "Create a new goal"}</h1></div></div><button disabled={isSubmitting} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-amber-300 px-5 text-xs font-bold text-slate-950 hover:bg-amber-200 disabled:opacity-50">{isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}{goalId ? "Save changes" : "Create goal"}</button></header><div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_350px]"><section className="overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#0d1727]"><Header icon={Target} eyebrow="Goal details" title="Objective and progress" /><div className="grid gap-5 p-5 sm:p-7 md:grid-cols-2"><Field label="Goal title" error={errors.title?.message} wide><input {...register("title", { required: "Goal title is required" })} /></Field><Field label="Description" wide><textarea {...register("description")} rows={5} /></Field><Field label="Category"><input {...register("category")} placeholder="Technology, Business, Growth..." /></Field><Field label="Icon"><input {...register("icon")} /></Field><Field label="Status"><select {...register("status")}><option value="planned">Planned</option><option value="in-progress">In progress</option><option value="completed">Completed</option><option value="paused">Paused</option><option value="cancelled">Cancelled</option></select></Field><Field label="Priority"><select {...register("priority")}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select></Field><Field label="Target date"><input type="date" {...register("targetDate")} /></Field><Field label="Order"><input type="number" {...register("order", { valueAsNumber: true })} /></Field><div className="md:col-span-2"><Field label="Progress"><div className="rounded-xl border border-white/[0.08] bg-slate-950/35 p-4"><div className="mb-4 flex justify-between text-xs"><span className="text-slate-500">Starting</span><span className="text-xl font-semibold text-amber-300">{progress}%</span><span className="text-slate-500">Complete</span></div><input type="range" min="0" max="100" {...register("progress", { valueAsNumber: true })} className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-amber-300" /></div></Field></div></div></section><aside className="space-y-6 lg:sticky lg:top-28"><section className="overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#0d1727]"><Header icon={TrendingUp} eyebrow="Live preview" title="Goal card" /><div className="p-5"><div className="rounded-2xl border border-amber-400/15 bg-amber-400/[0.035] p-5"><div className="flex justify-between gap-3"><h2 className="text-sm font-semibold text-white">{title}</h2><span className="text-lg font-semibold text-amber-300">{progress}%</span></div><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full rounded-full bg-amber-300 transition-all" style={{ width: `${Math.max(0, Math.min(100, progress))}%` }} /></div><div className="mt-4 flex gap-2"><Badge>{status}</Badge><Badge>{priority}</Badge></div></div></div></section><section className="overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#0d1727]"><Header icon={CheckCircle2} eyebrow="Publishing" title="Visibility" /><div className="space-y-3 p-5"><Field label="Publication"><select {...register("publishStatus")}><option value="published">Published</option><option value="draft">Draft</option></select></Field><label className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-slate-950/25 p-4 text-sm text-slate-300"><input type="checkbox" {...register("featured")} className="size-4 accent-amber-300" /><Star className="size-4 text-amber-300" />Feature this goal</label></div></section></aside></div></form>;
}

function Header({ icon: Icon, eyebrow, title }) { return <div className="flex items-center gap-3 border-b border-white/[0.07] px-5 py-4"><span className="grid size-9 place-items-center rounded-xl bg-amber-400/10 text-amber-300"><Icon className="size-4" /></span><div><p className="text-[9px] font-bold uppercase tracking-[.18em] text-slate-600">{eyebrow}</p><h2 className="mt-1 text-sm font-semibold text-slate-100">{title}</h2></div></div>; }
function Field({ label, error, wide, children }) { return <label className={wide ? "block md:col-span-2" : "block"}><span className="mb-2 block text-[9px] font-bold uppercase tracking-[.16em] text-slate-500">{label}</span><div className="[&_input:not([type=range])]:w-full [&_input:not([type=range])]:rounded-xl [&_input:not([type=range])]:border [&_input:not([type=range])]:border-white/[0.08] [&_input:not([type=range])]:bg-slate-950/35 [&_input:not([type=range])]:p-3.5 [&_input:not([type=range])]:text-sm [&_input:not([type=range])]:outline-none [&_textarea]:w-full [&_textarea]:resize-y [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-white/[0.08] [&_textarea]:bg-slate-950/35 [&_textarea]:p-4 [&_textarea]:text-sm [&_textarea]:outline-none [&_select]:w-full [&_select]:rounded-xl [&_select]:border [&_select]:border-white/[0.08] [&_select]:bg-slate-950/35 [&_select]:p-3.5 [&_select]:text-sm [&_select]:outline-none">{children}</div>{error && <p className="mt-2 text-[10px] text-rose-300">{error}</p>}</label>; }
function Badge({ children }) { return <span className="rounded-full bg-white/[0.05] px-2.5 py-1 text-[8px] font-bold uppercase tracking-wider text-slate-500">{children}</span>; }

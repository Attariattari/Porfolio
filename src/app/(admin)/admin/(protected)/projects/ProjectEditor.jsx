"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { ArrowLeft, CheckCircle2, FileText, Image as ImageIcon, LayoutGrid, Link2, Loader2, Save, Search, Settings2 } from "lucide-react";
import { toast } from "sonner";
import ImageUploader from "@/components/admin/ImageUploader";
import useAdminStore from "@/lib/store/adminStore";
import { uploadPendingImages } from "@/lib/uploadHelper";

const defaults = { title: "", slug: "", category: "", projectType: "", purpose: "", impact: "", shortDescription: "", description: "", longDescription: "", details: "", overview: "", problem: "", goals: [], role: "", responsibilities: "", clientType: "", duration: "", year: "", liveUrl: "", githubUrl: "", images: [], thumbnailAlt: "", heroImageAlt: "", galleryImageAlts: "", techStack: "", features: [], modules: [], technologies: { frontend: "", backend: "", database: "", tools: "" }, processSteps: [], challenges: [], results: [], relatedServices: "", seoTitle: "", seoDescription: "", keywords: "", sortOrder: 0, publishStatus: "draft", featured: false };

export default function ProjectEditor({ projectId = null }) {
  const router = useRouter();
  const { projects, fetchProjects, addProject, updateProject } = useAdminStore();
  const [loading, setLoading] = useState(Boolean(projectId));
  const [persistedId, setPersistedId] = useState(null);
  const { register, control, reset, handleSubmit, formState: { isSubmitting } } = useForm({ defaultValues: defaults });

  useEffect(() => { Promise.resolve(fetchProjects()).finally(() => setLoading(false)); }, [fetchProjects]);
  useEffect(() => {
    if (!projectId || projects.length === 0) return;
    const project = projects.find((item) => item._id === projectId || item.slug === projectId);
    const timer = window.setTimeout(() => {
      if (!project) return setLoading(false);
      setPersistedId(project._id || null);
      reset({ ...defaults, ...project, techStack: text(project.techStack), responsibilities: text(project.responsibilities), relatedServices: text(project.relatedServices), keywords: text(project.keywords), galleryImageAlts: Array.isArray(project.galleryImageAlts) ? project.galleryImageAlts.join("\n") : project.galleryImageAlts || "", images: project.gallery || project.images || [project.thumbnail || project.heroImage].filter(Boolean), goals: (project.goals || []).map((item) => ({ value: typeof item === "string" ? item : item?.title || "" })), features: project.features || [], modules: project.modules || [], processSteps: project.processSteps || [], challenges: project.challenges || [], results: project.results || [], technologies: Object.fromEntries(["frontend", "backend", "database", "tools"].map((group) => [group, text(project.technologies?.[group])])) });
      setLoading(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [projectId, projects, reset]);

  const submit = async (data) => {
    const toastId = toast.loading(projectId ? "Updating project..." : "Creating project...");
    try {
      const images = await uploadPendingImages(data.images || []);
      const galleryImageAlts = String(data.galleryImageAlts || "").split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
      const payload = { ...data, goals: (data.goals || []).map((item) => item.value).filter(Boolean), technologies: Object.fromEntries(Object.entries(data.technologies || {}).map(([group, value]) => [group, split(value)])), gallery: images, images, thumbnail: images[0] || data.thumbnail || "", thumbnailImage: images[0] || data.thumbnailImage || "", heroImage: images[0] || data.heroImage || "", galleryImageAlts, galleryImages: images.map((url, index) => ({ url, alt: galleryImageAlts[index] || `${data.title} screenshot ${index + 1}`, caption: index === 0 ? "Project preview" : `Screenshot ${index + 1}` })), techStack: split(data.techStack), responsibilities: split(data.responsibilities), relatedServices: split(data.relatedServices), keywords: split(data.keywords), sortOrder: Number(data.sortOrder || 0), featured: Boolean(data.featured) };
      const result = persistedId ? await updateProject(persistedId, payload) : await addProject(payload);
      if (!result?.success) throw new Error(result?.error || "Could not save project");
      toast.success(persistedId ? "Project updated" : "Project created", { id: toastId });
      router.push("/admin/projects"); router.refresh();
    } catch (error) { toast.error(error.message, { id: toastId }); }
  };

  if (loading) return <div className="grid min-h-[65vh] place-items-center"><Loader2 className="size-7 animate-spin text-fuchsia-300" /></div>;

  return (
    <form onSubmit={handleSubmit(submit)} className="mx-auto max-w-[1500px] pb-24">
      <header className="relative z-10 mb-6 flex flex-col justify-between gap-4 rounded-[22px] border border-white/[0.09] bg-[#0d1727] p-4 shadow-xl sm:flex-row sm:items-center sm:px-6"><div className="flex min-w-0 items-center gap-3"><button type="button" onClick={() => router.push("/admin/projects")} className="grid size-10 shrink-0 place-items-center rounded-xl border border-white/[0.08] text-slate-500 hover:text-white"><ArrowLeft className="size-4" /></button><div className="min-w-0"><p className="text-[9px] font-bold uppercase tracking-[.2em] text-fuchsia-300">Case study editor</p><h1 className="mt-1 truncate text-lg font-semibold text-white">{projectId ? "Edit project" : "Create a new project"}</h1></div></div><button disabled={isSubmitting} className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-fuchsia-300 px-5 text-xs font-bold text-slate-950 hover:bg-fuchsia-200 disabled:opacity-50">{isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}{projectId ? "Save changes" : "Publish project"}</button></header>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="space-y-6">
          <Section icon={FileText} eyebrow="01 · Foundation" title="Project identity"><Grid><Field name="title" label="Project title" register={register} required /><Field name="slug" label="URL slug" register={register} /><Field name="category" label="Category" register={register} /><Field name="projectType" label="Project type" register={register} /><Field name="purpose" label="Purpose" register={register} /><Field name="impact" label="Project impact" register={register} /><Field name="shortDescription" label="Short description" register={register} textarea wide /><Field name="description" label="Brief description" register={register} textarea wide /><Field name="longDescription" label="Long description" register={register} textarea wide rows={6} /></Grid></Section>
          <Section icon={LayoutGrid} eyebrow="02 · Case study" title="Story and project context"><Grid><Field name="overview" label="Project overview" register={register} textarea wide /><Field name="problem" label="Problem or goal" register={register} textarea wide /><div className="md:col-span-2"><Repeater control={control} register={register} name="goals" title="Project goals" fields={["value"]} /></div><Field name="role" label="My role" register={register} textarea wide /><Field name="responsibilities" label="Responsibilities" register={register} wide placeholder="Comma separated" /><Field name="clientType" label="Client type" register={register} /><Field name="duration" label="Duration" register={register} /><Field name="year" label="Year" register={register} /><Field name="details" label="Full case-study details" register={register} textarea wide rows={7} /></Grid></Section>
          <Section icon={Settings2} eyebrow="03 · Delivery" title="Features, process and results"><Repeater control={control} register={register} name="features" title="Features" fields={["title", "description", "icon"]} /><Repeater control={control} register={register} name="modules" title="Modules and pages" fields={["title", "type", "description"]} /><TechnologyEditor register={register} /><Repeater control={control} register={register} name="processSteps" title="Process steps" fields={["step", "title", "description"]} /><Repeater control={control} register={register} name="challenges" title="Challenges and solutions" fields={["title", "problem", "solution"]} /><Repeater control={control} register={register} name="results" title="Results and impact" fields={["title", "description"]} /></Section>
          <Section icon={Link2} eyebrow="04 · Links" title="Project access"><Grid><Field name="liveUrl" label="Live project URL" register={register} wide /><Field name="githubUrl" label="GitHub URL" register={register} wide /><Field name="relatedServices" label="Related service slugs" register={register} wide placeholder="Comma separated" /></Grid></Section>
          <Section icon={Search} eyebrow="05 · Discoverability" title="SEO settings"><Grid><Field name="seoTitle" label="SEO title" register={register} wide /><Field name="seoDescription" label="SEO description" register={register} textarea wide /><Field name="keywords" label="SEO keywords" register={register} wide placeholder="Comma separated" /></Grid></Section>
        </div>
        <aside className="space-y-6 xl:sticky xl:top-48"><Section icon={ImageIcon} eyebrow="Project media" title="Gallery and preview"><Controller name="images" control={control} render={({ field }) => <ImageUploader images={field.value || []} onChange={field.onChange} compact maxFiles={8} />} /><div className="mt-5 space-y-4"><Field name="thumbnailAlt" label="Thumbnail alt text" register={register} /><Field name="heroImageAlt" label="Hero image alt text" register={register} /><Field name="galleryImageAlts" label="Gallery alt texts" register={register} textarea rows={4} placeholder="One description per line" /></div></Section><Section icon={CheckCircle2} eyebrow="Publishing" title="Visibility"><Field name="publishStatus" label="Publication status" register={register} select options={[['draft','Draft — hidden'],['pending','Pending review'],['published','Published — live']]} /><label className="mt-4 flex items-center gap-3 rounded-xl border border-white/[0.07] bg-slate-950/25 p-4 text-sm text-slate-300"><input type="checkbox" {...register("featured")} className="size-4 accent-fuchsia-300" />Feature this project</label><div className="mt-4"><Field name="sortOrder" label="Sort order" register={register} type="number" /></div></Section></aside>
      </div>
    </form>
  );
}

function Section({ icon: Icon, eyebrow, title, children }) { return <section className="overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#0d1727]"><div className="flex items-center gap-3 border-b border-white/[0.07] px-5 py-4 sm:px-6"><span className="grid size-9 place-items-center rounded-xl bg-fuchsia-400/10 text-fuchsia-300"><Icon className="size-4" /></span><div><p className="text-[9px] font-bold uppercase tracking-[.18em] text-slate-600">{eyebrow}</p><h2 className="mt-1 text-sm font-semibold text-slate-100">{title}</h2></div></div><div className="space-y-5 p-5 sm:p-6">{children}</div></section>; }
function Grid({ children }) { return <div className="grid gap-4 md:grid-cols-2">{children}</div>; }
function Field({ name, label: fieldLabel, register, textarea, wide, rows = 3, required, type = "text", select, options, placeholder }) { return <label className={wide ? "block md:col-span-2" : "block"}><span className="mb-2 block text-[9px] font-bold uppercase tracking-[.16em] text-slate-500">{fieldLabel}{required && <span className="ml-1 text-rose-300">*</span>}</span>{select ? <select {...register(name)} className={inputClass}>{options.map(([value, textValue]) => <option key={value} value={value}>{textValue}</option>)}</select> : textarea ? <textarea {...register(name, required ? { required: true } : {})} rows={rows} placeholder={placeholder} className={`${inputClass} resize-y leading-6`} /> : <input type={type} {...register(name, required ? { required: true } : {})} placeholder={placeholder} className={inputClass} />}</label>; }
function Repeater({ control, register, name, title, fields }) { const list = useFieldArray({ control, name }); return <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4"><div className="mb-3 flex items-center justify-between"><h3 className="text-xs font-semibold text-slate-300">{title}</h3><button type="button" onClick={() => list.append(Object.fromEntries(fields.map((field) => [field, field === "step" ? list.fields.length + 1 : ""])))} className="rounded-lg border border-fuchsia-400/20 px-3 py-2 text-[9px] font-bold uppercase tracking-wider text-fuchsia-300">Add item</button></div><div className="space-y-2">{list.fields.map((item, index) => <div key={item.id} className="grid gap-2 rounded-xl border border-white/[0.06] bg-slate-950/25 p-3 md:grid-cols-2">{fields.map((field) => ["description", "problem", "solution"].includes(field) ? <textarea key={field} {...register(`${name}.${index}.${field}`)} placeholder={fieldName(field)} className="min-h-20 rounded-lg border border-white/[0.07] bg-slate-950/40 p-3 text-xs outline-none md:col-span-2" /> : <input key={field} type={field === "step" ? "number" : "text"} {...register(`${name}.${index}.${field}`)} placeholder={fieldName(field)} className={`${fields.length === 1 ? "md:col-span-2" : ""} rounded-lg border border-white/[0.07] bg-slate-950/40 p-3 text-xs outline-none`} />)}<button type="button" onClick={() => list.remove(index)} className="rounded-lg py-2 text-[9px] font-bold uppercase text-rose-300 hover:bg-rose-400/10 md:col-span-2">Remove</button></div>)}</div></div>; }
function TechnologyEditor({ register }) { return <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4"><h3 className="mb-3 text-xs font-semibold text-slate-300">Grouped technologies</h3><div className="grid gap-3 md:grid-cols-2">{["frontend", "backend", "database", "tools"].map((group) => <Field key={group} name={`technologies.${group}`} label={fieldName(group)} register={register} placeholder="Comma separated" />)}</div></div>; }
const inputClass = "w-full rounded-xl border border-white/[0.08] bg-slate-950/35 px-4 py-3 text-sm text-slate-200 outline-none placeholder:text-slate-700 focus:border-fuchsia-400/40";
const split = (value) => String(value || "").split(",").map((item) => item.trim()).filter(Boolean);
const text = (value) => Array.isArray(value) ? value.join(", ") : value || "";
const fieldName = (value) => value.replace(/([A-Z])/g, " $1").replace(/^./, (character) => character.toUpperCase());

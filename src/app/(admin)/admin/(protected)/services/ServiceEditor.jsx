"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { ArrowLeft, Check, CheckCircle2, FileText, Image as ImageIcon, LayoutGrid, Loader2, Plus, Save, Search, Settings2, Trash2, Sparkles, Mail, RefreshCw, Copy, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import ImageUploader from "@/components/admin/ImageUploader";
import useAdminStore from "@/lib/store/adminStore";
import { uploadPendingImages } from "@/lib/uploadHelper";

const defaults = { title: "", slug: "", category: "", icon: "", sortOrder: 0, shortDescription: "", fullDescription: "", overview: "", keyHighlights: "", heroImage: "", heroImageAlt: "", imagePrompt: "", imagePromptEnhanced: "", imageNegativePrompt: "", imageStatus: "pending", imageGenerated: false, images: [], status: "draft", featured: false, problemsSolved: [], deliverables: [], features: [], benefits: [], processSteps: [], technologies: [], clientRequirements: [], faqs: [], deliveryNote: "", deliveryTime: "", quoteNote: "", ctaTitle: "", ctaDescription: "", ctaPrimaryText: "", ctaSecondaryText: "", seoTitle: "", seoDescription: "", keywords: "", targetKeywords: "", localKeywords: "", relatedServices: "", relatedProjects: [] };

export default function ServiceEditor({ serviceId = null }) {
  const router = useRouter();
  const { services, projects, fetchServices, fetchProjects, addService, updateService } = useAdminStore();
  const [loading, setLoading] = useState(Boolean(serviceId));
  const [persistedId, setPersistedId] = useState(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [autoGenerateImages, setAutoGenerateImages] = useState(false);
  const { register, control, reset, handleSubmit, setValue, formState: { isSubmitting } } = useForm({ defaultValues: defaults });
  const selectedProjects = useWatch({ control, name: "relatedProjects" }) || [];
  const watchedImagePrompt = useWatch({ control, name: "imagePrompt" });
  const watchedSlug = useWatch({ control, name: "slug" });
  const serviceIdentifier = persistedId || serviceId || watchedSlug;

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("admin:autoGenerateServiceImages");
      if (saved === "true") setAutoGenerateImages(true);
    } catch {}
  }, []);

  const handleToggleAutoImage = () => {
    setAutoGenerateImages((curr) => {
      const next = !curr;
      try {
        window.localStorage.setItem("admin:autoGenerateServiceImages", String(next));
      } catch {}
      return next;
    });
  };

  useEffect(() => { Promise.all([Promise.resolve(fetchServices()), Promise.resolve(fetchProjects())]).finally(() => setLoading(false)); }, [fetchServices, fetchProjects]);
  useEffect(() => {
    if (!serviceId || services.length === 0) return;
    const service = services.find((item) => item._id === serviceId || item.slug === serviceId);
    const timer = window.setTimeout(() => {
      if (!service) return setLoading(false);
      setPersistedId(service._id || null);
      const objects = (value) => (Array.isArray(value) ? value.map((item) => typeof item === "string" ? { title: item, description: "" } : item) : []);
      reset({ ...defaults, ...service, status: service.status || service.publishStatus || "draft", featured: Boolean(service.featured || service.isFeatured), shortDescription: service.shortDescription || service.description || "", heroImage: service.heroImage || service.banner || "", images: service.images?.length ? service.images : service.heroImage ? [service.heroImage] : [], imagePrompt: service.imagePrompt || service.image_prompt || "", imagePromptEnhanced: service.imagePromptEnhanced || "", imageNegativePrompt: service.imageNegativePrompt || "", imageStatus: service.imageStatus || (service.heroImage ? "generated" : "pending"), imageGenerated: Boolean(service.imageGenerated || service.heroImage), problemsSolved: objects(service.problemsSolved), deliverables: objects(service.deliverables), features: objects(service.features), benefits: objects(service.benefits), processSteps: objects(service.processSteps || service.process), technologies: (service.technologies || service.techStack || []).map((item) => typeof item === "string" ? { name: item, category: "", icon: "" } : item), clientRequirements: objects(service.clientRequirements), faqs: service.faqs || service.faq || [], keywords: arrayText(service.keywords), targetKeywords: arrayText(service.targetKeywords), localKeywords: arrayText(service.localKeywords), relatedServices: arrayText(service.relatedServices), relatedProjects: (service.relatedProjects || []).map((item) => typeof item === "string" ? item : item?.slug || item?.title).filter(Boolean) });
      setLoading(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [serviceId, services, reset]);

  const [isRegeneratingPrompt, setIsRegeneratingPrompt] = useState(false);

  const handleCopyPrompt = () => {
    if (!watchedImagePrompt) return toast.info("No image prompt generated yet.");
    navigator.clipboard.writeText(watchedImagePrompt);
    setIsCopied(true);
    toast.success("4K Image prompt copied to clipboard!");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleRegeneratePrompt = async () => {
    if (!serviceIdentifier) {
      return toast.error("Please save the service draft first before regenerating prompt.");
    }
    try {
      setIsRegeneratingPrompt(true);
      const toastId = toast.loading("Regenerating 4K AI image prompt via Gemini...");
      const res = await fetch(`/api/admin/services/${encodeURIComponent(serviceIdentifier)}/image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "regenerate_prompt" }),
      });
      const data = await res.json();
      setIsRegeneratingPrompt(false);
      if (data.success && data.imagePrompt?.prompt) {
        setValue("imagePrompt", data.imagePrompt.prompt, { shouldDirty: true });
        if (data.imagePrompt.visualDirection) {
          setValue("imagePromptEnhanced", data.imagePrompt.visualDirection, { shouldDirty: true });
        }
        if (data.imagePrompt.negativePrompt) {
          setValue("imageNegativePrompt", data.imagePrompt.negativePrompt, { shouldDirty: true });
        }
        try {
          await navigator.clipboard.writeText(data.imagePrompt.prompt);
          toast.success("✓ Fresh 4K Prompt regenerated and copied to clipboard!", { id: toastId });
        } catch {
          toast.success("✓ Fresh 4K Prompt regenerated!", { id: toastId });
        }
      } else {
        toast.error(data.message || "Failed to regenerate prompt.", { id: toastId });
      }
    } catch (err) {
      setIsRegeneratingPrompt(false);
      toast.error(err.message || "Failed to regenerate prompt.");
    }
  };

  const handleGenerateAiImage = async () => {
    if (!serviceIdentifier) {
      return toast.error("Please save the service draft first before generating AI image.");
    }
    try {
      setIsGeneratingAi(true);
      const toastId = toast.loading("Generating 4K Service Image via AI (Flux + Cloudinary)...");
      const res = await fetch(`/api/admin/services/${encodeURIComponent(serviceIdentifier)}/image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate_ai" }),
      });
      const data = await res.json();
      setIsGeneratingAi(false);
      if (data.success && data.imageUrl) {
        setValue("heroImage", data.imageUrl, { shouldDirty: true });
        setValue("images", [data.imageUrl], { shouldDirty: true });
        if (data.service?.imagePrompt) {
          setValue("imagePrompt", data.service.imagePrompt);
        }
        toast.success("AI Service image generated and attached!", { id: toastId });
      } else {
        toast.error(data.message || "Image generation failed.", { id: toastId });
      }
    } catch (err) {
      setIsGeneratingAi(false);
      toast.error(err.message || "Failed to generate AI image.");
    }
  };

  const handleSendPromptEmail = async () => {
    if (!serviceIdentifier) {
      return toast.error("Please save the service draft first before sending prompt email.");
    }
    try {
      setIsSendingEmail(true);
      const toastId = toast.loading("Sending 4K image prompt email to Super Admin...");
      const res = await fetch(`/api/admin/services/${encodeURIComponent(serviceIdentifier)}/image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send_prompt" }),
      });
      const data = await res.json();
      setIsSendingEmail(false);
      if (data.success) {
        toast.success("Image prompt email sent to Super Admin!", { id: toastId });
      } else {
        toast.error(data.message || "Failed to send email.", { id: toastId });
      }
    } catch (err) {
      setIsSendingEmail(false);
      toast.error(err.message || "Failed to send email.");
    }
  };

  const submit = async (data) => {
    const toastId = toast.loading(serviceId ? "Updating service..." : "Creating service...");
    try {
      const urls = await uploadPendingImages(data.images || []);
      const heroImage = urls[0] || data.heroImage || "";
      const clean = (items = []) => items.filter((item) => Object.values(item || {}).some((value) => String(value || "").trim()));
      const technologies = clean(data.technologies);
      const payload = { ...data, images: urls, heroImage, banner: heroImage, image: heroImage, imagePrompt: data.imagePrompt, imagePromptEnhanced: data.imagePromptEnhanced, imageNegativePrompt: data.imageNegativePrompt, imageStatus: data.imageStatus || (heroImage ? "generated" : "pending"), imageGenerated: Boolean(data.imageGenerated || heroImage), description: data.shortDescription, problemsSolved: clean(data.problemsSolved), deliverables: clean(data.deliverables), features: clean(data.features), benefits: clean(data.benefits), processSteps: clean(data.processSteps).map((step, index) => ({ ...step, step: Number(step.step || index + 1) })), technologies, techStack: technologies.map((item) => item.name).filter(Boolean), clientRequirements: clean(data.clientRequirements), faqs: clean(data.faqs), faq: clean(data.faqs), keywords: split(data.keywords), targetKeywords: split(data.targetKeywords), localKeywords: split(data.localKeywords), relatedServices: split(data.relatedServices), relatedProjects: data.relatedProjects || [], publishStatus: data.status, isFeatured: Boolean(data.featured), sortOrder: Number(data.sortOrder || 0) };
      const result = persistedId ? await updateService(persistedId, payload) : await addService(payload);
      if (!result?.success) throw new Error(result?.error || "Could not save service");
      toast.success(serviceId ? "Service updated" : "Service created", { id: toastId });
      router.push("/admin/services"); router.refresh();
    } catch (error) { toast.error(error.message, { id: toastId }); }
  };

  if (loading) return <div className="grid min-h-[65vh] place-items-center"><Loader2 className="size-7 animate-spin text-indigo-300" /></div>;

  return (
    <form onSubmit={handleSubmit(submit)} className="mx-auto max-w-[1500px] pb-24">
      <header className="sticky top-20 z-30 mb-6 flex flex-col justify-between gap-4 rounded-[22px] border border-white/[0.09] bg-[#0d1727]/95 p-4 shadow-xl backdrop-blur-xl sm:flex-row sm:items-center sm:px-6">
        <div className="flex items-center gap-3"><button type="button" onClick={() => router.push("/admin/services")} className="grid size-10 place-items-center rounded-xl border border-white/[0.08] text-slate-500 hover:text-white"><ArrowLeft className="size-4" /></button><div><p className="text-[9px] font-bold uppercase tracking-[.2em] text-indigo-300">Service editor</p><h1 className="mt-1 text-lg font-semibold text-white">{serviceId ? "Edit service" : "Create a new service"}</h1></div></div>
        <button disabled={isSubmitting} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-300 px-5 text-xs font-bold text-slate-950 hover:bg-indigo-200 disabled:opacity-50">{isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}{serviceId ? "Save changes" : "Publish service"}</button>
      </header>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="space-y-6">
          <Section icon={FileText} eyebrow="01 · Essentials" title="Service identity"><div className="grid gap-4 md:grid-cols-2"><Field label="Service title" required><input {...register("title", { required: true })} /></Field><Field label="URL slug" required><input {...register("slug", { required: true })} /></Field><Field label="Category"><input {...register("category")} /></Field><Field label="Icon name"><input {...register("icon")} /></Field><div className="md:col-span-2"><Field label="Short description" required><textarea {...register("shortDescription", { required: true })} rows={3} /></Field></div><div className="md:col-span-2"><Field label="Full description"><textarea {...register("fullDescription")} rows={6} /></Field></div><div className="md:col-span-2"><Field label="Service overview"><textarea {...register("overview")} rows={4} /></Field></div><div className="md:col-span-2"><Field label="Key highlights"><input {...register("keyHighlights")} placeholder="Comma separated, up to four highlights" /></Field></div></div></Section>
          <Section icon={LayoutGrid} eyebrow="02 · Page content" title="What the service includes"><Repeater control={control} register={register} name="problemsSolved" title="Problems solved" fields={["title", "description", "icon"]} /><Repeater control={control} register={register} name="deliverables" title="Deliverables" fields={["title", "description"]} /><Repeater control={control} register={register} name="features" title="Features" fields={["title", "description"]} /><Repeater control={control} register={register} name="benefits" title="Benefits" fields={["title", "description"]} /><Repeater control={control} register={register} name="processSteps" title="Process steps" fields={["step", "title", "description"]} /><Repeater control={control} register={register} name="technologies" title="Technologies" fields={["name", "category", "icon"]} /><Repeater control={control} register={register} name="clientRequirements" title="Client requirements" fields={["title", "description"]} /><Repeater control={control} register={register} name="faqs" title="Frequently asked questions" fields={["question", "answer"]} /></Section>
          <Section icon={Settings2} eyebrow="03 · Conversion" title="Delivery and call to action"><div className="grid gap-4 md:grid-cols-2"><Field label="Delivery time"><input {...register("deliveryTime")} /></Field><Field label="Delivery note"><input {...register("deliveryNote")} /></Field><div className="md:col-span-2"><Field label="Quote note"><textarea {...register("quoteNote")} rows={3} /></Field></div><Field label="CTA title"><input {...register("ctaTitle")} /></Field><Field label="Primary button text"><input {...register("ctaPrimaryText")} /></Field><Field label="Secondary button text"><input {...register("ctaSecondaryText")} /></Field><div className="md:col-span-2"><Field label="CTA description"><textarea {...register("ctaDescription")} rows={3} /></Field></div></div></Section>
          <Section icon={Search} eyebrow="04 · Discoverability" title="SEO settings"><div className="grid gap-4"><Field label="SEO title"><input {...register("seoTitle")} /></Field><Field label="SEO description"><textarea {...register("seoDescription")} rows={3} /></Field><Field label="Keywords"><input {...register("keywords")} placeholder="Comma separated" /></Field><Field label="Target keywords"><input {...register("targetKeywords")} placeholder="Comma separated" /></Field><Field label="Local keywords"><input {...register("localKeywords")} placeholder="Comma separated" /></Field><Field label="Related service slugs"><input {...register("relatedServices")} placeholder="Comma separated" /></Field></div></Section>
          <Section icon={LayoutGrid} eyebrow="05 · Cross promotion" title="Related projects"><p className="text-xs leading-5 text-slate-500">Select the strongest projects that demonstrate this service. Selected projects will appear on the public service page.</p><ProjectSelector projects={projects} selected={selectedProjects} onToggle={(slug) => setValue("relatedProjects", selectedProjects.includes(slug) ? selectedProjects.filter((item) => item !== slug) : [...selectedProjects, slug], { shouldDirty: true })} /></Section>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-48">
          <Section icon={ImageIcon} eyebrow="Media" title="Service visual">
            <Controller name="images" control={control} render={({ field }) => <ImageUploader images={field.value || []} onChange={field.onChange} compact maxFiles={1} />} />
            <div className="mt-4"><Field label="Image alt text"><input {...register("heroImageAlt")} /></Field></div>
            <div className="mt-5 rounded-2xl border border-border bg-muted/40 dark:bg-slate-900/60 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                  <Sparkles className="size-3.5" />
                  4K AI Image Studio
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleToggleAutoImage}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase border transition ${autoGenerateImages ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "border-border bg-background/80 text-muted-foreground hover:text-foreground"}`}
                    title="Toggle AI image generation on/off"
                  >
                    <span>AI Gen:</span>
                    <span className={autoGenerateImages ? "text-emerald-700 dark:text-emerald-400 font-black" : "text-muted-foreground"}>{autoGenerateImages ? "ON" : "OFF"}</span>
                  </button>
                  <button
                    type="button"
                    disabled={isRegeneratingPrompt}
                    onClick={handleRegeneratePrompt}
                    className="admin-btn-violet inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition disabled:opacity-50"
                    title="Regenerate fresh 4K prompt via Gemini"
                  >
                    {isRegeneratingPrompt ? <Loader2 className="size-3 animate-spin shrink-0" /> : <RefreshCw className="size-3 shrink-0" />}
                    <span>{isRegeneratingPrompt ? "Regen..." : "Regen"}</span>
                  </button>
                  {watchedImagePrompt && (
                    <button
                      type="button"
                      onClick={handleCopyPrompt}
                      className="inline-flex items-center gap-1 text-[9px] font-semibold text-muted-foreground hover:text-foreground transition"
                    >
                      {isCopied ? <CheckCheck className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                      {isCopied ? "Copied" : "Copy"}
                    </button>
                  )}
                </div>
              </div>
              {watchedImagePrompt ? (
                <div className="max-h-24 overflow-y-auto rounded-xl border border-border bg-background/80 p-2.5 text-[10px] font-mono text-foreground leading-relaxed">
                  {watchedImagePrompt}
                </div>
              ) : (
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {autoGenerateImages ? "Generate a 4K Flux AI cover image or dispatch a full prompt email to the Super Admin." : "Dispatch a 4K prompt email with secure upload link to the Super Admin."}
                </p>
              )}
              <div className={autoGenerateImages ? "grid grid-cols-2 gap-2 pt-1" : "flex flex-col pt-1"}>
                {autoGenerateImages && (
                  <button
                    type="button"
                    disabled={isGeneratingAi}
                    onClick={handleGenerateAiImage}
                    className="admin-btn-cyan inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider transition shadow-sm disabled:opacity-50"
                  >
                    {isGeneratingAi ? <Loader2 className="size-3 animate-spin shrink-0" /> : <Sparkles className="size-3 shrink-0" />}
                    <span>{isGeneratingAi ? "Generating..." : "⚡ Gen 4K AI Pic"}</span>
                  </button>
                )}
                <button
                  type="button"
                  disabled={isSendingEmail}
                  onClick={handleSendPromptEmail}
                  className={`admin-btn-amber inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider transition shadow-sm disabled:opacity-50 ${!autoGenerateImages ? "w-full" : ""}`}
                >
                  {isSendingEmail ? <Loader2 className="size-3 animate-spin shrink-0" /> : <Mail className="size-3 shrink-0" />}
                  <span>{isSendingEmail ? "Sending..." : "📧 Send Prompt"}</span>
                </button>
              </div>
            </div>
          </Section>
          <Section icon={Check} eyebrow="Publishing" title="Visibility">
            <Field label="Publication status">
              <select {...register("status")}>
                <option value="draft">Draft — hidden</option>
                <option value="pending">Pending review</option>
                <option value="published">Published — live</option>
              </select>
            </Field>
            <label className="mt-4 flex items-center gap-3 rounded-xl border border-white/[0.07] bg-slate-950/25 p-4 text-sm text-slate-300">
              <input type="checkbox" {...register("featured")} className="size-4 accent-indigo-300" />
              Feature this service
            </label>
            <div className="mt-4">
              <Field label="Sort order">
                <input type="number" {...register("sortOrder")} />
              </Field>
            </div>
          </Section>
        </aside>
      </div>
    </form>
  );
}

function Section({ icon: Icon, eyebrow, title, children }) { return <section className="overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#0d1727]"><div className="flex items-center gap-3 border-b border-white/[0.07] px-5 py-4 sm:px-6"><span className="grid size-9 place-items-center rounded-xl bg-indigo-400/10 text-indigo-300"><Icon className="size-4" /></span><div><p className="text-[9px] font-bold uppercase tracking-[.18em] text-slate-600">{eyebrow}</p><h2 className="mt-1 text-sm font-semibold text-slate-100">{title}</h2></div></div><div className="space-y-5 p-5 sm:p-6">{children}</div></section>; }
function Field({ label, required, children }) { return <label className="block"><span className="mb-2 block text-[9px] font-bold uppercase tracking-[.16em] text-slate-500">{label}{required && <span className="ml-1 text-rose-300">*</span>}</span><div className="[&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-white/[0.08] [&_input]:bg-slate-950/35 [&_input]:px-4 [&_input]:py-3 [&_input]:text-sm [&_input]:outline-none [&_textarea]:w-full [&_textarea]:resize-y [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-white/[0.08] [&_textarea]:bg-slate-950/35 [&_textarea]:p-4 [&_textarea]:text-sm [&_textarea]:leading-6 [&_textarea]:outline-none [&_select]:w-full [&_select]:rounded-xl [&_select]:border [&_select]:border-white/[0.08] [&_select]:bg-slate-950/35 [&_select]:p-3 [&_select]:text-sm [&_select]:outline-none">{children}</div></label>; }
function Repeater({ control, register, name, title, fields }) { const list = useFieldArray({ control, name }); return <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4"><div className="mb-3 flex items-center justify-between"><h3 className="text-xs font-semibold text-slate-300">{title}</h3><button type="button" onClick={() => list.append(Object.fromEntries(fields.map((field) => [field, field === "step" ? list.fields.length + 1 : ""])))} className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-400/20 px-3 py-2 text-[9px] font-bold uppercase tracking-wider text-indigo-300"><Plus className="size-3" />Add</button></div><div className="space-y-2">{list.fields.map((item, index) => <div key={item.id} className="grid gap-2 rounded-xl border border-white/[0.06] bg-slate-950/25 p-3 md:grid-cols-2">{fields.map((field) => field === "description" || field === "answer" ? <textarea key={field} {...register(`${name}.${index}.${field}`)} placeholder={labelize(field)} className="min-h-20 rounded-lg border border-white/[0.07] bg-slate-950/40 p-3 text-xs outline-none md:col-span-2" /> : <input key={field} type={field === "step" ? "number" : "text"} {...register(`${name}.${index}.${field}`)} placeholder={labelize(field)} className="rounded-lg border border-white/[0.07] bg-slate-950/40 p-3 text-xs outline-none" />)}<button type="button" onClick={() => list.remove(index)} className="inline-flex items-center justify-center gap-2 rounded-lg py-2 text-[9px] font-bold uppercase text-rose-300 hover:bg-rose-400/10 md:col-span-2"><Trash2 className="size-3" />Remove</button></div>)}</div></div>; }
function ProjectSelector({ projects = [], selected = [], onToggle }) {
  if (projects.length === 0) return <div className="rounded-xl border border-dashed border-white/[0.08] py-10 text-center text-xs text-slate-600">No projects are available yet.</div>;
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{projects.map((project) => { const slug = project.slug || project._id || project.title; const active = selected.includes(slug) || selected.includes(project.title); const image = project.thumbnail || project.thumbnailImage || project.image || project.heroImage; return <button key={slug} type="button" onClick={() => onToggle(slug)} className={`group overflow-hidden rounded-2xl border text-left transition ${active ? "border-indigo-300/50 bg-indigo-400/[0.08] ring-2 ring-indigo-400/10" : "border-white/[0.07] bg-white/[0.02] hover:border-white/[0.14]"}`}><div className="relative aspect-[16/9] overflow-hidden bg-slate-950/50">{image ? <img src={image} alt="" className="size-full object-cover transition duration-500 group-hover:scale-[1.03]" /> : <div className="grid size-full place-items-center"><ImageIcon className="size-6 text-slate-700" /></div>}<span className={`absolute right-3 top-3 grid size-7 place-items-center rounded-full border backdrop-blur-md ${active ? "border-indigo-200 bg-indigo-300 text-slate-950" : "border-white/15 bg-slate-950/60 text-transparent"}`}><CheckCircle2 className="size-4" /></span></div><div className="p-4"><p className="text-[9px] font-bold uppercase tracking-wider text-indigo-300/70">{project.category || "Project"}</p><h3 className="mt-1 truncate text-sm font-semibold text-slate-200">{project.title}</h3><p className={`mt-2 text-[10px] font-medium ${active ? "text-indigo-300" : "text-slate-600"}`}>{active ? "Selected" : "Click to select"}</p></div></button>; })}</div>;
}
const split = (value) => String(value || "").split(",").map((item) => item.trim()).filter(Boolean);
const arrayText = (value) => Array.isArray(value) ? value.join(", ") : value || "";
const labelize = (value) => value.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());

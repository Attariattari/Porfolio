"use client";

import { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Code, Cpu, GripVertical, Image as ImageIcon, Info, Layers, Monitor, Plus, RefreshCcw, Save, Shield, Sparkles, Terminal, Trash2, Type, Zap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui";
import ImageUploader from "@/components/admin/ImageUploader";
import { uploadPendingImages } from "@/lib/uploadHelper";

const ICON_OPTIONS = [
  { value: "Terminal", icon: Terminal }, { value: "Layers", icon: Layers },
  { value: "Code", icon: Code }, { value: "Zap", icon: Zap },
  { value: "Shield", icon: Shield }, { value: "Monitor", icon: Monitor },
  { value: "Cpu", icon: Cpu },
];

export default function HeroForm({ initialData, staticFallback }) {
  const [isSaving, setIsSaving] = useState(false);
  const initialVisual = initialData?.visualImage ? [initialData.visualImage] : [staticFallback?.visualImage || "/hero-visual.webp"];
  const { register, control, handleSubmit, reset } = useForm({ defaultValues: {
    description: initialData?.description || staticFallback.description || "",
    visualImageAlt: initialData?.visualImageAlt || "", visualImage: initialVisual,
    typewriterWords: (initialData?.typewriterWords || staticFallback.typewriterWords || []).map((word) => ({ word })),
    features: initialData?.features || staticFallback.features || [],
  }});

  useEffect(() => {
    if (!initialData || Object.keys(initialData).length === 0) return;
    reset({ ...initialData, visualImage: initialData.visualImage ? [initialData.visualImage] : [staticFallback?.visualImage || "/hero-visual.webp"], typewriterWords: (initialData.typewriterWords || []).map((word) => ({ word })), features: initialData.features || [] });
  }, [initialData, reset, staticFallback]);

  const { fields: words, append: addWord, remove: removeWord } = useFieldArray({ control, name: "typewriterWords" });
  const { fields: features, append: addFeature, remove: removeFeature } = useFieldArray({ control, name: "features" });

  const onSubmit = async (data) => {
    setIsSaving(true);
    const toastId = toast.loading("Publishing hero changes...");
    try {
      let finalVisual = initialData?.visualImage || staticFallback?.visualImage || "/hero-visual.webp";
      const currentImage = data.visualImage?.[0];
      const isNewFile = typeof currentImage === "object" && currentImage?.file;
      const isNewLocalPath = typeof currentImage === "string" && currentImage.startsWith("/") && currentImage !== initialData?.visualImage;
      if (isNewFile || isNewLocalPath) {
        const uploadItems = await Promise.all((data.visualImage || []).map(async (item) => {
          if (typeof item !== "string" || !item.startsWith("/") || item.includes("cloudinary.com")) return item;
          try { const response = await fetch(item); const blob = await response.blob(); return { file: new File([blob], item.split("/").pop() || "image.png", { type: blob.type }) }; } catch { return item; }
        }));
        const urls = await uploadPendingImages(uploadItems);
        if (typeof urls?.[0] === "string" && urls[0].startsWith("http")) finalVisual = urls[0];
      } else if (typeof currentImage === "string") finalVisual = currentImage;

      const response = await fetch("/api/hero", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ description: data.description, visualImage: finalVisual, visualImageAlt: data.visualImageAlt, typewriterWords: data.typewriterWords.map(({ word }) => word).filter(Boolean), features: data.features }) });
      if (!response.ok) throw new Error("Failed to update hero section");
      toast.success("Hero section published", { id: toastId });
    } catch (error) { toast.error(error.message, { id: toastId }); }
    finally { setIsSaving(false); }
  };

  return (
    <div className="mx-auto max-w-[1500px] pb-28">
      <header className="mb-6 flex flex-col justify-between gap-5 rounded-[26px] border border-white/[0.08] bg-[#0d1727] p-6 sm:p-8 lg:flex-row lg:items-center">
        <div className="flex items-start gap-4"><span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-violet-400/10 text-violet-300 ring-1 ring-inset ring-violet-400/15"><Sparkles className="size-5" /></span><div><p className="text-[10px] font-bold uppercase tracking-[.24em] text-violet-300">Homepage editor</p><h1 className="mt-2 text-2xl font-semibold tracking-[-.035em] text-white sm:text-3xl">Hero section</h1><p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">Shape the first impression visitors see when they open your portfolio.</p></div></div>
        <Button onClick={handleSubmit(onSubmit)} disabled={isSaving} className="h-12 rounded-xl bg-violet-400 px-6 text-xs font-bold text-white shadow-none hover:bg-violet-300">{isSaving ? <><RefreshCcw className="mr-2 size-4 animate-spin" />Saving</> : <><Save className="mr-2 size-4" />Publish changes</>}</Button>
      </header>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_440px]">
        <div className="space-y-6">
          <EditorSection number="01" icon={Info} title="Hero introduction" description="Write a concise summary of your work and value.">
            <FieldLabel>Description</FieldLabel><textarea {...register("description", { required: true })} className="min-h-48 w-full resize-y rounded-xl border border-white/[0.08] bg-slate-950/35 p-4 text-sm leading-7 text-slate-200 outline-none placeholder:text-slate-700 focus:border-violet-400/40" placeholder="Briefly explain what you do and who you help..." />
          </EditorSection>
          <EditorSection number="02" icon={Type} title="Animated specialties" description="These words rotate in your main headline." action={<AddButton onClick={() => addWord({ word: "" })} label="Add word" />}>
            <div className="grid gap-3 sm:grid-cols-2">{words.map((field, index) => <div key={field.id} className="group flex items-center gap-2 rounded-xl border border-white/[0.07] bg-slate-950/25 p-2"><GripVertical className="size-4 shrink-0 text-slate-700" /><span className="grid size-7 shrink-0 place-items-center rounded-md bg-white/[0.04] text-[10px] font-bold text-slate-600">{String(index + 1).padStart(2, "0")}</span><input {...register(`typewriterWords.${index}.word`)} placeholder="e.g. Web Designer" className="min-w-0 flex-1 bg-transparent py-2 text-sm font-medium outline-none placeholder:text-slate-700" /><button type="button" onClick={() => removeWord(index)} className="grid size-8 place-items-center rounded-lg text-slate-700 hover:bg-rose-400/10 hover:text-rose-300"><Trash2 className="size-3.5" /></button></div>)}</div>
            {words.length === 0 && <EmptyText>Add at least one specialty for the animated headline.</EmptyText>}
          </EditorSection>
        </div>

        <motion.aside initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#0d1727] xl:sticky xl:top-28">
          <SectionHeader icon={ImageIcon} eyebrow="Hero media" title="Featured visual" />
          <div className="p-5 sm:p-6"><Controller name="visualImage" control={control} render={({ field }) => <ImageUploader images={field.value || []} onChange={field.onChange} compact maxFiles={1} />} /><label className="mt-5 block"><FieldLabel>Alternative text</FieldLabel><input {...register("visualImageAlt")} className="w-full rounded-xl border border-white/[0.08] bg-slate-950/35 px-4 py-3 text-sm outline-none placeholder:text-slate-700 focus:border-violet-400/40" placeholder="Describe the image for accessibility" /></label><p className="mt-3 text-[10px] leading-5 text-slate-600">Transparent PNG or WebP recommended. Keep the subject centered.</p></div>
        </motion.aside>
      </div>

      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-6 overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#0d1727]">
        <div className="flex flex-col justify-between gap-4 border-b border-white/[0.07] p-5 sm:flex-row sm:items-center sm:px-6"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-cyan-400/10 text-cyan-300"><Zap className="size-4" /></span><div><p className="text-[9px] font-bold uppercase tracking-[.2em] text-slate-600">03 · Supporting content</p><h2 className="mt-1 text-sm font-semibold text-slate-100">Feature highlights</h2></div></div><AddButton onClick={() => addFeature({ icon: "Zap", label: "", description: "" })} label="Add feature" cyan /></div>
        <div className="grid gap-4 p-4 sm:p-6 md:grid-cols-2 xl:grid-cols-3">{features.map((field, index) => <FeatureEditor key={field.id} index={index} register={register} onRemove={() => removeFeature(index)} />)}</div>
        {features.length === 0 && <div className="p-6"><EmptyText>Add feature cards to highlight your strengths.</EmptyText></div>}
      </motion.section>
    </div>
  );
}

function EditorSection({ number, icon: Icon, title, description, action, children }) { return <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#0d1727]"><div className="flex items-center justify-between gap-4 border-b border-white/[0.07] px-5 py-4 sm:px-6"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-violet-400/10 text-violet-300"><Icon className="size-4" /></span><div><p className="text-[9px] font-bold uppercase tracking-[.2em] text-slate-600">{number} · Content</p><h2 className="mt-1 text-sm font-semibold text-slate-100">{title}</h2></div></div>{action}</div><div className="p-5 sm:p-6"><p className="mb-5 text-xs text-slate-500">{description}</p>{children}</div></motion.section>; }
function SectionHeader({ icon: Icon, eyebrow, title }) { return <div className="flex items-center gap-3 border-b border-white/[0.07] px-5 py-4"><span className="grid size-9 place-items-center rounded-xl bg-violet-400/10 text-violet-300"><Icon className="size-4" /></span><div><p className="text-[9px] font-bold uppercase tracking-[.2em] text-slate-600">{eyebrow}</p><h2 className="mt-1 text-sm font-semibold text-slate-100">{title}</h2></div></div>; }
function FieldLabel({ children }) { return <span className="mb-2 block text-[9px] font-bold uppercase tracking-[.18em] text-slate-500">{children}</span>; }
function EmptyText({ children }) { return <div className="mt-3 rounded-xl border border-dashed border-white/[0.08] px-4 py-8 text-center text-xs text-slate-600">{children}</div>; }
function AddButton({ onClick, label, cyan = false }) { return <button type="button" onClick={onClick} className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[10px] font-bold uppercase tracking-wider ${cyan ? "border-cyan-400/20 bg-cyan-400/[0.06] text-cyan-300" : "border-violet-400/20 bg-violet-400/[0.07] text-violet-300"}`}><Plus className="size-3.5" />{label}</button>; }
function FeatureEditor({ index, register, onRemove }) { return <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5"><div className="mb-5 flex items-center justify-between"><span className="grid size-9 place-items-center rounded-xl bg-cyan-400/10 text-cyan-300"><Zap className="size-4" /></span><div className="flex items-center gap-2"><span className="text-[9px] font-bold uppercase tracking-wider text-slate-600">Feature {index + 1}</span><button type="button" onClick={onRemove} className="grid size-8 place-items-center rounded-lg text-slate-700 hover:bg-rose-400/10 hover:text-rose-300"><Trash2 className="size-3.5" /></button></div></div><div className="space-y-4"><label className="block"><FieldLabel>Icon</FieldLabel><select {...register(`features.${index}.icon`)} className="w-full rounded-xl border border-white/[0.08] bg-slate-950/35 px-3 py-3 text-xs outline-none">{ICON_OPTIONS.map((option) => <option key={option.value} value={option.value} className="bg-slate-900">{option.value}</option>)}</select></label><label className="block"><FieldLabel>Title</FieldLabel><input {...register(`features.${index}.label`)} className="w-full rounded-xl border border-white/[0.08] bg-slate-950/35 px-3 py-3 text-sm outline-none focus:border-cyan-400/35" placeholder="Feature title" /></label><label className="block"><FieldLabel>Description</FieldLabel><textarea {...register(`features.${index}.description`)} className="min-h-20 w-full resize-none rounded-xl border border-white/[0.08] bg-slate-950/35 px-3 py-3 text-xs leading-5 outline-none focus:border-cyan-400/35" placeholder="Short supporting description" /></label></div></div>; }

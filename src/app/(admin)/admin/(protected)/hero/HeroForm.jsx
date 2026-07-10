"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { motion } from "framer-motion";
import { 
  Save, 
  Plus, 
  Trash2, 
  Terminal, 
  Layers, 
  Code, 
  Zap, 
  Shield, 
  Monitor, 
  Cpu,
  Info,
  Sparkles,
  Image as ImageIcon,
  RefreshCcw
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui";
import ImageUploader from "@/components/admin/ImageUploader";
import { uploadPendingImages } from "@/lib/uploadHelper";

const ICON_OPTIONS = [
  { value: "Terminal", icon: Terminal },
  { value: "Layers", icon: Layers },
  { value: "Code", icon: Code },
  { value: "Zap", icon: Zap },
  { value: "Shield", icon: Shield },
  { value: "Monitor", icon: Monitor },
  { value: "Cpu", icon: Cpu },
];

export default function HeroForm({ initialData, staticFallback }) {
    const [isSaving, setIsSaving] = useState(false);
    
    // Priority logic for visual image
    const initialVisual = initialData?.visualImage 
        ? [initialData.visualImage] 
        : (staticFallback?.visualImage ? [staticFallback.visualImage] : ["/hero-visual.webp"]);

    const defaultValues = {
        description: initialData?.description || staticFallback.description || "",
        visualImage: initialVisual,
        typewriterWords: (initialData?.typewriterWords || staticFallback.typewriterWords || []).map(w => ({ word: w })),
        features: initialData?.features || staticFallback.features || [],
    };

    const { register, control, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues
    });

    useEffect(() => {
        if (initialData && Object.keys(initialData).length > 0) {
            reset({
                ...initialData,
                visualImage: initialData.visualImage ? [initialData.visualImage] : [staticFallback?.visualImage || "/hero-visual.webp"],
                typewriterWords: (initialData.typewriterWords || []).map(w => ({ word: w })),
                features: initialData.features || []
            });
        }
    }, [initialData, reset, staticFallback]);

    const { fields: typewriterFields, append: appendWord, remove: removeWord } = useFieldArray({
        control,
        name: "typewriterWords"
    });

    const { fields: featureFields, append: appendFeature, remove: removeFeature } = useFieldArray({
        control,
        name: "features"
    });

    const onSubmit = async (data) => {
        setIsSaving(true);
        const loadingToast = toast.loading("Updating Hero Section...");
        try {
            let finalVisual = initialData?.visualImage || staticFallback?.visualImage || "/hero-visual.webp";
            
            // Check if there is a new image to upload (an object with a file, or a local path that hasn't been saved yet)
            const currentImg = data.visualImage?.[0];
            const isNewFileObj = typeof currentImg === 'object' && currentImg !== null && currentImg.file;
            const isUnsavedLocalString = typeof currentImg === 'string' && currentImg.startsWith('/') && currentImg !== initialData?.visualImage;

            if (isNewFileObj || isUnsavedLocalString) {
                // Only process upload if a new image is detected
                const filesToUpload = await Promise.all((data.visualImage || []).map(async (item) => {
                    if (typeof item === 'string' && item.startsWith('/') && !item.includes('cloudinary.com')) {
                        try {
                            const response = await fetch(item);
                            const blob = await response.blob();
                            const fileName = item.split('/').pop() || 'image.png';
                            return { file: new File([blob], fileName, { type: blob.type }) };
                        } catch (e) {
                            return item;
                        }
                    }
                    return item;
                }));

                const imageUrls = await uploadPendingImages(filesToUpload);
                if (imageUrls && imageUrls.length > 0 && typeof imageUrls[0] === 'string' && imageUrls[0].startsWith('http')) {
                    finalVisual = imageUrls[0];
                }
            } else if (typeof currentImg === 'string') {
                // Image hasn't changed (it's already a Cloudinary URL or the existing DB string)
                finalVisual = currentImg;
            }

            const formattedData = {
                description: data.description,
                visualImage: finalVisual,
                typewriterWords: data.typewriterWords.map(w => w.word).filter(Boolean),
                features: data.features
            };

            const res = await fetch("/api/hero", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formattedData)
            });

            if (!res.ok) throw new Error("Failed to update Hero Section");

            toast.success("Hero Section Updated Successfully!", { id: loadingToast });
        } catch (error) {
            toast.error(error.message, { id: loadingToast });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-[1300px] mx-auto pb-40 px-4 md:px-0">
            {/* Header Area */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-16 px-6">
                <div>
                   <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white">Hero <span className="text-accent underline decoration-accent/20 underline-offset-8">Management</span></h1>
                   <p className="text-muted-foreground mt-4 font-medium italic opacity-60 flex items-center gap-2">
                     <Monitor className="w-5 h-5 text-accent" /> Customize your home page hero section.
                   </p>
                </div>
                <Button 
                    onClick={handleSubmit(onSubmit)} 
                    disabled={isSaving}
                    className="h-20 w-full lg:w-72 rounded-3xl font-black uppercase tracking-[0.2em] shadow-[0_20px_40px_rgba(var(--accent),0.2)] hover:shadow-[0_20px_60px_rgba(var(--accent),0.4)] transition-all bg-accent text-black"
                >
                    {isSaving ? "Saving..." : "Save Changes"}
                </Button>
            </div>

            <div className="space-y-12">
                
                {/* 🎨 MEDIA SECTION */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass p-10 md:p-14 rounded-[3.5rem] border border-white/5 relative overflow-hidden group"
                >
                    <div className="flex items-center gap-4 mb-10">
                        <div className="p-4 rounded-2xl bg-accent/10 border border-accent/20">
                            <ImageIcon className="w-8 h-8 text-accent" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-[0.1em] italic">Hero Visual</h2>
                            <p className="text-xs font-bold text-accent/40 uppercase tracking-widest mt-1 italic opacity-50">Upload your main hero image</p>
                        </div>
                    </div>

                    <div className="relative w-full min-h-[400px] rounded-[2.5rem] bg-black/40 border-2 border-dashed border-white/10 hover:border-accent/40 transition-all p-8">
                        <Controller
                            name="visualImage"
                            control={control}
                            render={({ field }) => (
                                <ImageUploader 
                                    images={field.value || []}
                                    onChange={field.onChange}
                                    label="Choose Hero Image (Transparent PNG recommended)"
                                    maxFiles={1}
                                />
                            )}
                        />
                    </div>
                </motion.div>

                {/* ⚙️ CONTENT CONFIG */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <motion.div 
                         initial={{ opacity: 0, x: -30 }}
                         animate={{ opacity: 1, x: 0 }}
                         className="glass p-10 md:p-14 rounded-[3.5rem] border border-white/5 space-y-8"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-3.5 rounded-2xl bg-accent/10 border border-accent/20 text-accent"><Info size={24} /></div>
                            <h3 className="text-xl font-black uppercase tracking-widest italic">Hero Description</h3>
                        </div>
                        <textarea 
                            {...register("description", { required: true })}
                            className="w-full bg-black/40 border border-white/10 rounded-[2rem] p-8 min-h-[300px] focus:ring-4 focus:ring-accent/10 outline-none transition-all font-medium leading-relaxed text-lg"
                            placeholder="Briefly describe what you do..."
                        />
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass p-10 md:p-14 rounded-[3.5rem] border border-white/5 space-y-8"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3.5 rounded-2xl bg-accent/10 border border-accent/20 text-accent"><Terminal size={24} /></div>
                                <h3 className="text-xl font-black uppercase tracking-widest italic">Typewriter Words</h3>
                            </div>
                            <Button type="button" variant="outline" onClick={() => appendWord({ word: "" })} className="rounded-xl border-accent/20 text-accent h-12 w-12 p-0"><Plus /></Button>
                        </div>
                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {typewriterFields.map((field, index) => (
                                <div key={field.id} className="flex gap-4 items-center">
                                    <input 
                                        {...register(`typewriterWords.${index}.word`)}
                                        className="flex-1 bg-black/20 border border-white/5 rounded-2xl px-6 py-4 outline-none font-bold"
                                    />
                                    <button type="button" onClick={() => removeWord(index)} className="text-red-500/20 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                <motion.div 
                     initial={{ opacity: 0, y: 30 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="glass p-10 md:p-14 rounded-[3.5rem] border border-white/5"
                >
                    <div className="flex items-center justify-between mb-12 text-accent">
                         <div className="flex items-center gap-3">
                            <div className="p-3.5 rounded-2xl bg-accent/10 border border-accent/20"><Zap size={24} /></div>
                            <h3 className="text-xl font-black uppercase tracking-widest italic">Features Cards</h3>
                        </div>
                        <Button variant="outline" onClick={() => appendFeature({ icon: "Zap", label: "", description: "" })} className="rounded-2xl border-accent/30 text-accent h-12 px-6">Add Card</Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {featureFields.map((field, index) => (
                            <div key={field.id} className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] relative group hover:bg-white/[0.05] transition-all">
                                <button type="button" onClick={() => removeFeature(index)} className="absolute top-6 right-6 text-white/10 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                                <div className="space-y-5 mt-4">
                                     <div className="grid gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase text-accent/40 tracking-widest italic ml-1">Icon</label>
                                            <select {...register(`features.${index}.icon`)} className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-xs outline-none">
                                                {ICON_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.value}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase text-accent/40 tracking-widest italic ml-1">Label</label>
                                            <input {...register(`features.${index}.label`)} className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-xs outline-none" />
                                        </div>
                                     </div>
                                     <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-accent/40 tracking-widest italic ml-1">Description</label>
                                        <input {...register(`features.${index}.description`)} className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-xs outline-none" />
                                     </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

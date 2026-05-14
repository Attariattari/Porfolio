"use client";

import { X, Save, RefreshCcw, LayoutTemplate } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

export default function FormModal({ 
  isOpen, 
  onClose, 
  title, 
  schema, 
  defaultValues, 
  onSubmit, 
  fields 
}) {
  const { 
    register, 
    handleSubmit, 
    reset, 
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting } 
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues || {}
  });

  useEffect(() => {
    if (isOpen) {
      reset(defaultValues || {});
    }
  }, [isOpen, defaultValues, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-xl" 
        onClick={onClose} 
      />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 50 }}
        className="w-full max-w-4xl bg-[#0a0f1c] border border-white/10 rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 relative z-10 shadow-3xl overflow-hidden"
      >
        {/* Decorative background element */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-accent/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="flex justify-between items-center mb-6 md:mb-10 border-b border-white/10 pb-6 md:pb-8 relative z-10">
          <div>
            <h2 className="text-xl md:text-3xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3 md:gap-4 leading-tight">
              <LayoutTemplate className="w-6 h-6 md:w-8 md:h-8 text-accent" />
              {title}
            </h2>
            <p className="text-[10px] md:text-sm text-slate-500 mt-2 font-medium">Please fill in the required fields to save changes.</p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 md:p-3 rounded-xl md:rounded-2xl hover:bg-white/5 text-slate-500 hover:text-white transition-all border border-white/5 hover:border-white/10"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 md:space-y-8 relative z-10 overflow-y-auto max-h-[60vh] md:max-h-[70vh] pr-2 md:pr-4 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 md:gap-x-10 gap-y-6 md:gap-y-8">
            {fields.map((field) => (
              <div key={field.name} className={`${field.fullWidth ? 'md:col-span-2' : ''} flex flex-col gap-2`}>
                <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-accent/80 pl-2">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1 pb-1 transform scale-150 inline-block">*</span>}
                </label>
                
                {field.type === 'textarea' ? (
                  <textarea
                    {...register(field.name)}
                    placeholder={field.placeholder}
                    className="w-full h-32 p-4 md:p-5 bg-white/[0.03] border border-white/10 rounded-xl md:rounded-2xl text-xs md:text-sm focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent/40 transition-all font-medium resize-none placeholder:text-muted-foreground/30 focus:bg-white/[0.05]"
                  />
                ) : field.type === 'select' ? (
                  <select
                    {...register(field.name)}
                    className="w-full p-4 md:p-5 bg-white/[0.03] border border-white/10 rounded-xl md:rounded-2xl text-xs md:text-sm focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent/40 transition-all font-medium appearance-none cursor-pointer focus:bg-white/[0.05]"
                  >
                    <option value="" className="bg-[#0a0f1c]">Select {field.label}</option>
                    {field.options?.map(opt => (
                      <option key={opt.value} value={opt.value} className="bg-[#0a0f1c]">
                          {opt.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === 'custom' ? (
                  field.render({ register, errors, control, setValue, watch })
                ) : (
                  <input
                    type={field.type || 'text'}
                    {...register(field.name)}
                    placeholder={field.placeholder}
                    className="w-full p-4 md:p-5 bg-white/[0.03] border border-white/10 rounded-xl md:rounded-2xl text-xs md:text-sm focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent/40 transition-all font-medium placeholder:text-muted-foreground/30 focus:bg-white/[0.05]"
                  />
                )}
                
                {errors[field.name] && (
                  <p className="text-[9px] md:text-[10px] text-red-400 font-bold uppercase tracking-wider pl-4 pt-1 opacity-90 italic">
                      &times; {errors[field.name].message}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6 md:pt-10 mt-6 md:mt-10 border-t border-white/10">
            <button 
              type="button" 
              onClick={() => reset()}
              className="px-6 md:px-8 py-4 md:py-5 rounded-xl md:rounded-2xl border border-white/10 hover:bg-white/5 font-black uppercase text-[10px] md:text-xs tracking-[0.2em] text-slate-500 transition-all flex items-center justify-center gap-3 active:scale-95 group"
            >
              <RefreshCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700" />
              Reset Form
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 py-4 md:py-5 rounded-xl md:rounded-2xl bg-accent text-black font-black uppercase text-[10px] md:text-xs tracking-[0.2em] hover:bg-accent/90 transition-all shadow-xl shadow-accent/20 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isSubmitting ? (
                 <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Processing...
                 </>
              ) : (
                <>
                  <Save className="w-4 h-4 md:w-5 md:h-5 group-hover:scale-110 transition-all" />
                  Publish Changes
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

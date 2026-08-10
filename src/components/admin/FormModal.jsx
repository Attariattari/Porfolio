"use client";

import { X, Save, RefreshCcw, LayoutTemplate } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import useModalScrollLock from "@/hooks/useModalScrollLock";
import useAdminStore from "@/lib/store/adminStore";

export default function FormModal({
  isOpen,
  onClose,
  title,
  schema,
  defaultValues,
  onSubmit,
  fields,
}) {
  const { sidebarCollapsed } = useAdminStore();
  useModalScrollLock(isOpen);

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues || {},
  });

  useEffect(() => {
    if (isOpen) {
      reset(defaultValues || {});
    }
  }, [isOpen, defaultValues, reset]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-y-0 right-0 z-50 transition-[left] duration-300 flex items-center justify-center p-6 overflow-y-auto left-0 ${
        sidebarCollapsed ? "lg:left-20" : "lg:left-72"
      }`}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/80 backdrop-blur-xl"
        onClick={onClose}
      />

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 50 }}
        className="w-full max-w-4xl bg-card border border-border rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 relative z-10 shadow-3xl overflow-hidden"
      >
        {/* Decorative background element */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-accent/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex justify-between items-center mb-6 md:mb-10 border-b border-border pb-6 md:pb-8 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent/10 rounded-2xl text-accent border border-accent/20">
              <LayoutTemplate className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-foreground tracking-tight">
                {title}
              </h2>
              <p className="text-xs text-muted-foreground font-medium mt-1">
                Fill in the details below to update records.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 rounded-2xl hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fields.map((field) => (
              <div
                key={field.name}
                className={field.fullWidth ? "col-span-full" : ""}
              >
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </label>
                {field.type === "textarea" ? (
                  <textarea
                    {...register(field.name)}
                    rows={field.rows || 4}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-3 bg-muted/50 border border-border text-foreground rounded-xl focus:ring-2 focus:ring-accent focus:border-accent text-sm outline-none transition-all placeholder:text-muted-foreground/60"
                  />
                ) : field.type === "select" ? (
                  <select
                    {...register(field.name)}
                    className="w-full px-4 py-3 bg-muted/50 border border-border text-foreground rounded-xl focus:ring-2 focus:ring-accent focus:border-accent text-sm outline-none transition-all"
                  >
                    {field.options.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-card text-foreground">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type || "text"}
                    {...register(field.name)}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-3 bg-muted/50 border border-border text-foreground rounded-xl focus:ring-2 focus:ring-accent focus:border-accent text-sm outline-none transition-all placeholder:text-muted-foreground/60"
                  />
                )}
                {errors[field.name] && (
                  <p className="text-xs text-destructive mt-1 font-semibold">
                    {errors[field.name]?.message}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-border mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl bg-accent text-accent-foreground font-semibold text-sm hover:opacity-90 shadow-lg shadow-accent/20 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCcw className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

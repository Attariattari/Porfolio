"use client";

import { AlertTriangle, Sparkles, Trash2, X } from "lucide-react";
import { motion } from "framer-motion";
import useModalScrollLock from "@/hooks/useModalScrollLock";

export default function ConfirmDialog({
  isOpen,
  title = "Delete Entry",
  message = "Are you sure you want to delete this resource? This action cannot be undone.",
  onConfirm,
  onCancel,
  confirmText = "Delete Permanently",
  cancelText = "Cancel",
  isDeleting = false,
  tone = "danger"
}) {
  useModalScrollLock(isOpen);
  if (!isOpen) return null;

  const isAccent = tone === "accent";
  const Icon = isAccent ? Sparkles : AlertTriangle;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="confirmation-title">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-background/75 backdrop-blur-md"
        onClick={onCancel}
      />

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative z-10 w-full max-w-md overflow-hidden rounded-[2rem] border border-border/70 bg-card shadow-2xl"
      >
        <div className={`h-1 w-full ${isAccent ? "bg-accent" : "bg-status-danger"}`} />
        <button type="button" onClick={onCancel} disabled={isDeleting} className="absolute right-4 top-5 grid h-9 w-9 place-items-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-50" aria-label="Close confirmation">
          <X className="h-4 w-4" />
        </button>
        <div className="p-6 sm:p-8">
          <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border ${isAccent ? "border-accent/20 bg-accent/10 text-accent" : "border-status-danger/20 bg-status-danger/10 text-status-danger"}`}>
            <Icon className="h-6 w-6" />
          </div>
          <p className={`text-[9px] font-black uppercase tracking-[.2em] ${isAccent ? "text-accent" : "text-status-danger"}`}>{isAccent ? "AI editorial action" : "Confirmation required"}</p>
          <h3 id="confirmation-title" className="mt-2 pr-10 text-xl font-black tracking-tight text-foreground sm:text-2xl">{title}</h3>
          <p className="mt-3 text-sm font-medium leading-6 text-muted-foreground">
            {message}
          </p>
        </div>
        <div className="flex flex-col-reverse gap-3 border-t border-border/70 bg-muted/20 p-5 sm:flex-row sm:justify-end sm:px-8">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="h-11 rounded-xl border border-border bg-background px-5 text-xs font-bold text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-70 ${isAccent ? "bg-accent text-accent-foreground shadow-lg shadow-accent/20 hover:bg-accent/90" : "bg-status-danger text-white shadow-lg shadow-status-danger/20 hover:brightness-110"}`}
          >
            {isDeleting ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-4 h-4 border-2 border-border border-t-white rounded-full"
                />
                Deleting...
              </>
            ) : (
              <>
                {isAccent ? <Sparkles className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                {confirmText}
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

"use client";

import { AlertTriangle, Trash2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ConfirmDialog({ 
  isOpen, 
  title = "Delete Entry", 
  message = "Are you sure you want to delete this resource? This action cannot be undone.", 
  onConfirm, 
  onCancel,
  confirmText = "Delete Permanently",
  cancelText = "Cancel",
  isDeleting = false
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-0">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm shadow-2xl" 
        onClick={onCancel} 
      />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="w-full max-w-md bg-[#0d1526] border border-white/10 rounded-3xl p-8 relative z-10 shadow-3xl"
      >
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
            <AlertTriangle className="w-8 h-8" />
          </div>
        </div>
        
        <div className="text-center mb-8">
          <h3 className="text-2xl font-black text-foreground italic uppercase tracking-tight">{title}</h3>
          <p className="text-muted-foreground text-sm mt-3 leading-relaxed font-medium">
            {message}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 px-6 py-4 rounded-2xl border border-white/10 hover:bg-white/5 font-black uppercase text-xs tracking-widest text-muted-foreground transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button 
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-6 py-4 rounded-2xl bg-red-500 text-white font-black uppercase text-xs tracking-widest hover:bg-red-600 transition-all shadow-xl shadow-red-500/20 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <>
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                {confirmText}
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

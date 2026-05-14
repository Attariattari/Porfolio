"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Trash2, X } from "lucide-react";

export default function DeleteConfirmationModal({ isOpen, onClose, onConfirm, loading }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md overflow-hidden bg-[#0f172a] border border-white/10 rounded-[2rem] shadow-2xl"
        >
          {/* Header/Banner */}
          <div className="h-2 bg-gradient-to-r from-red-500/50 via-red-500 to-red-500/50"></div>

          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hovrer:bg-white/5 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2">
              Confirm <span className="text-red-500">Delete</span>
            </h3>
            <p className="text-slate-400 font-medium leading-relaxed mb-8">
              Are you sure you want to permanently delete this message? This action cannot be undone and will remove the message from your database.
            </p>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className="flex-1 px-6 py-4 rounded-2xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Now
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

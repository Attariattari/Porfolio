"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import BookingForm from "./BookingForm";

export default function BookingModal({
  isOpen,
  onClose,
  initialServiceSlug = "",
  initialService = "",
  sourcePage = "modal",
  contextTitle = "",
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[150] flex items-end justify-center p-0 md:items-center md:p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-modal-title"
      >
        <button
          type="button"
          className="absolute inset-0 bg-background/90 backdrop-blur-2xl"
          onClick={onClose}
          aria-label="Close booking modal"
        />

        <motion.div
          initial={{ opacity: 0, y: "100%" }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-[2.5rem] border-t border-border/80 bg-background/95 shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl md:max-h-[90vh] md:rounded-[2.5rem] md:border"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-accent/50" />
          <div className="mx-auto mb-2 mt-4 h-1.5 w-12 shrink-0 rounded-full bg-border/60 md:hidden" />
          <div className="relative flex items-center justify-between border-b border-border/70 bg-card/70 p-7 md:p-9">
            <div>
              <h2
                id="booking-modal-title"
                className="text-2xl font-black tracking-tight text-foreground md:text-3xl"
              >
                Book a <span className="text-accent">Strategy Call</span>
              </h2>
              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                Share the details and choose a preferred slot
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-background/70 text-foreground transition-all hover:border-accent/50 hover:bg-accent hover:text-accent-foreground"
              aria-label="Close booking modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto bg-card/35 p-7 custom-scrollbar md:p-9">
            <BookingForm
              initialServiceSlug={initialServiceSlug || initialService}
              source="modal"
              sourcePage={sourcePage}
              contextTitle={contextTitle}
              onSuccess={onClose}
              submitLabel="Request Call Slot"
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

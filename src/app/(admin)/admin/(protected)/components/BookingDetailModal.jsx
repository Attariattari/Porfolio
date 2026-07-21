"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function BookingDetailModal({ booking, isOpen, onClose }) {
  if (!booking) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-card border border-border/70 rounded-xl max-w-lg w-full shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
                <h2 className="text-lg font-bold text-foreground truncate">
                  {booking.name}
                </h2>
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Email
                  </p>
                  <p className="text-sm text-foreground">{booking.email}</p>
                </div>

                {booking.phone && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                      Phone
                    </p>
                    <p className="text-sm text-foreground">{booking.phone}</p>
                  </div>
                )}

                {booking.service && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                      Service
                    </p>
                    <p className="text-sm text-foreground capitalize">
                      {booking.serviceTitle || booking.service.replace(/-/g, " ")}
                    </p>
                  </div>
                )}

                {booking.preferredDate && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                      Preferred Date
                    </p>
                    <p className="text-sm text-foreground">{booking.preferredDate}</p>
                  </div>
                )}

                {booking.preferredTime && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                      Preferred Time
                    </p>
                    <p className="text-sm text-foreground">{booking.preferredTime}</p>
                  </div>
                )}

                {booking.message && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                      Message
                    </p>
                    <p className="text-sm text-foreground/80">"{booking.message}"</p>
                  </div>
                )}

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Status
                  </p>
                  <p className="text-sm text-foreground capitalize">{booking.status}</p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-border/50 flex items-center justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-muted hover:bg-muted/70 text-muted-foreground hover:text-foreground transition-colors"
                >
                  Close
                </button>
                <Link
                  href={`/admin/bookings/${booking._id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-accent hover:bg-accent/90 text-accent-foreground transition-colors"
                >
                  View Details
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

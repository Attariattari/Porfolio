"use client";

import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  Calendar,
  Clock,
  Filter,
  ArrowUpDown
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDeleteBooking } from "@/app/(admin)/hooks/useBookings";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { BOOKING_STATUS_OPTIONS } from "@/lib/constants";

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "All Status" },
  ...BOOKING_STATUS_OPTIONS,
];

export default function BookingList({
  bookings = [],
  pagination,
  loading,
  filters,
  onFilterChange,
  onPageChange,
  onSelectBooking,
}) {
  const [searchInput, setSearchInput] = useState(filters.search || "");
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, bookingId: null });
  const deleteMutation = useDeleteBooking();

  const handleSearch = (e) => {
    setSearchInput(e.target.value);
    onFilterChange({ search: e.target.value });
  };

  const handleDelete = async () => {
    if (!deleteModal.bookingId) return;
    deleteMutation.mutate(deleteModal.bookingId, {
      onSuccess: () => {
        setDeleteModal({ isOpen: false, bookingId: null });
      }
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      new: "bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-sm",
      read: "bg-muted text-muted-foreground border-border",
      seen: "bg-muted text-muted-foreground border-border",
      confirmed: "bg-accent/10 text-accent border-accent/20 shadow-sm",
      completed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-sm",
      rejected: "bg-red-500/10 text-red-400 border-red-500/20",
      cancelled: "bg-muted text-muted-foreground border-border",
    };
    return badges[status] || "bg-muted text-muted-foreground border-border";
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const serviceFilterOptions = [
    { value: "", label: "All Services" },
    ...Array.from(
      new Map(
        bookings
          .map((booking) => [
            booking.serviceSlug || booking.service,
            {
              value: booking.serviceSlug || booking.service,
              label: booking.serviceTitle || booking.service || "Unknown Service",
            },
          ])
          .filter(([value]) => Boolean(value)),
      ).values(),
    ),
  ];

  const getBookingService = (booking) =>
    booking.serviceTitle || booking.service || booking.serviceSlug || "Selected service";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center bg-card/50 border border-border/70 p-2 rounded-2xl backdrop-blur-md">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
          <input
            type="text"
            placeholder="Search bookings..."
            className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border/70 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent/40 focus:bg-muted transition-all placeholder:text-muted-foreground/80"
            value={searchInput}
            onChange={handleSearch}
          />
        </div>

        <div className="flex flex-wrap md:flex-nowrap gap-2">
          <div className="relative min-w-[160px]">
            <select
              className="w-full pl-4 pr-10 py-2.5 bg-muted/50 border border-border/70 rounded-xl text-xs font-semibold text-foreground/80 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-accent/40"
              value={filters.service || ""}
              onChange={(e) => onFilterChange({ service: e.target.value || null })}
            >
              {serviceFilterOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-card text-foreground">{opt.label}</option>
              ))}
            </select>
            <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          </div>

          <div className="relative min-w-[140px]">
            <select
              className="w-full pl-4 pr-10 py-2.5 bg-muted/50 border border-border/70 rounded-xl text-xs font-semibold text-foreground/80 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-accent/40"
              value={filters.status || ""}
              onChange={(e) => onFilterChange({ status: e.target.value || null })}
            >
              {STATUS_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-card text-foreground">{opt.label}</option>
              ))}
            </select>
            <ArrowUpDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-card/60 to-transparent border border-border rounded-[2rem] overflow-hidden backdrop-blur-xl shadow-3xl">
        <div className="min-h-[400px]">
          {loading ? (
             <div className="flex flex-col justify-center items-center py-32 gap-4">
                <div className="w-12 h-12 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
                <p className="text-xs font-black uppercase tracking-[0.3em] text-accent/60">Fetching Schedules...</p>
             </div>
          ) : bookings.length === 0 ? (
            <div className="py-32 text-center">
              <Calendar className="w-12 h-12 text-muted-foreground/80 mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground font-bold uppercase tracking-widest">No Bookings Found</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-white/[0.03]">
                {bookings.map((booking) => (
                  <div
                    key={booking._id}
                    className={`p-6 space-y-4 hover:bg-card/50 transition-colors relative group ${
                      booking.status === 'new' ? 'bg-accent/[0.03] border-l-2 border-accent' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        {booking.status === 'new' && (
                          <div className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-foreground text-sm">{booking.name}</div>
                          <div className="text-[10px] text-muted-foreground">{booking.email}</div>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-[0.1em] border ${getStatusBadge(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 bg-card/50 p-3 rounded-xl border border-border/70">
                      <div className="space-y-1">
                        <span className="text-[8px] font-black uppercase tracking-[0.1em] text-muted-foreground">Service</span>
                        <div className="text-[10px] font-bold text-foreground/80 truncate">{getBookingService(booking)}</div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[8px] font-black uppercase tracking-[0.1em] text-muted-foreground">Schedule</span>
                        <div className="text-[10px] font-bold text-foreground/80 flex items-center gap-1">
                          <Calendar className="w-2.5 h-2.5 text-accent" /> {booking.preferredDate}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button onClick={() => onSelectBooking(booking)} className="flex-1 py-2 rounded-xl bg-accent/10 border border-accent/20 text-accent hover:bg-accent hover:text-foreground transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest">
                        <Eye className="w-3.5 h-3.5" /> View Detail
                      </button>
                      <button onClick={() => setDeleteModal({ isOpen: true, bookingId: booking._id })} className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-foreground transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/70 bg-card/40">
                      <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">CLIENT</th>
                      <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">SERVICE</th>
                      <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">SCHEDULE</th>
                      <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">STATUS</th>
                      <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">OPS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.03]">
                    {bookings.map((booking) => (
                      <motion.tr
                        key={booking._id}
                        layout
                        className={`hover:bg-muted/40 transition-all group ${
                          booking.status === 'new' ? 'bg-accent/[0.03] border-l-2 border-accent' : ''
                        }`}
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                             {booking.status === 'new' && (
                                <div className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                                </div>
                             )}
                             <div>
                               <div className="font-bold text-foreground text-sm">{booking.name}</div>
                               <div className="text-[10px] text-muted-foreground">{booking.email}</div>
                             </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{getBookingService(booking)}</span>
                          {booking.sourcePage && (
                            <div className="mt-1 text-[9px] font-semibold text-muted-foreground/80">{booking.sourcePage}</div>
                          )}
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2 text-xs text-foreground/80">
                            <Calendar className="w-3 h-3 text-accent" /> {booking.preferredDate}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-1">
                            <Clock className="w-3 h-3" /> {booking.preferredTime}
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em] border ${getStatusBadge(booking.status)}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => onSelectBooking(booking)} className="p-2 rounded-xl bg-accent/10 border border-accent/20 text-accent hover:bg-accent hover:text-foreground transition-all">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeleteModal({ isOpen: true, bookingId: booking._id })} className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-foreground transition-all">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="border-t border-border/70 px-8 py-6 flex justify-between items-center bg-card/40">
            <p className="text-[10px] font-black uppercase text-muted-foreground">Page {pagination.page} / {pagination.totalPages}</p>
            <div className="flex gap-2">
              <button
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={!pagination.hasPrev || loading}
                className="p-2 rounded-xl border border-border bg-muted/50 text-muted-foreground hover:text-foreground disabled:opacity-50 transition-all font-black"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={!pagination.hasNext || loading}
                className="p-2 rounded-xl border border-border bg-muted/50 text-muted-foreground hover:text-foreground disabled:opacity-50 transition-all font-black"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {deleteModal.isOpen && (
          <DeleteConfirmationModal
            isOpen={deleteModal.isOpen}
            loading={deleteMutation.isPending}
            onClose={() => setDeleteModal({ isOpen: false, bookingId: null })}
            onConfirm={handleDelete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

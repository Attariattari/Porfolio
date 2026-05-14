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
  ArrowUpDown,
  AlertCircle
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDeleteBooking } from "@/app/(admin)/hooks/useBookings";
import { toast } from "sonner";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { SERVICE_OPTIONS, BOOKING_STATUS_OPTIONS } from "@/lib/constants";

const SERVICE_FILTER_OPTIONS = [
  { value: "", label: "All Services" },
  ...SERVICE_OPTIONS,
];

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
      new: "bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]",
      seen: "bg-slate-500/10 text-slate-400 border-white/10",
      confirmed: "bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]",
      completed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]",
      rejected: "bg-red-500/10 text-red-400 border-red-500/20",
      cancelled: "bg-slate-500/10 text-slate-500 border-slate-500/20",
    };
    return badges[status] || "bg-slate-500/10 text-slate-500 border-slate-500/20";
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center bg-white/[0.02] border border-white/5 p-2 rounded-2xl backdrop-blur-md">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-accent transition-colors" />
          <input
            type="text"
            placeholder="Search bookings..."
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent/40 focus:bg-white/[0.08] transition-all placeholder:text-slate-600"
            value={searchInput}
            onChange={handleSearch}
          />
        </div>

        <div className="flex flex-wrap md:flex-nowrap gap-2">
          <div className="relative min-w-[160px]">
            <select
              className="w-full pl-4 pr-10 py-2.5 bg-white/5 border border-white/5 rounded-xl text-xs font-semibold text-slate-300 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-accent/40"
              value={filters.service || ""}
              onChange={(e) => onFilterChange({ service: e.target.value || null })}
            >
              {SERVICE_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#0f172a] text-white">{opt.label}</option>
              ))}
            </select>
            <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
          </div>

          <div className="relative min-w-[140px]">
            <select
              className="w-full pl-4 pr-10 py-2.5 bg-white/5 border border-white/5 rounded-xl text-xs font-semibold text-slate-300 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-accent/40"
              value={filters.status || ""}
              onChange={(e) => onFilterChange({ status: e.target.value || null })}
            >
              {STATUS_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#0f172a] text-white">{opt.label}</option>
              ))}
            </select>
            <ArrowUpDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10 rounded-[2rem] overflow-hidden backdrop-blur-xl shadow-3xl">
        <div className="min-h-[400px]">
          {loading ? (
             <div className="flex flex-col justify-center items-center py-32 gap-4">
                <div className="w-12 h-12 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
                <p className="text-xs font-black uppercase tracking-[0.3em] text-accent/60">Fetching Schedules...</p>
             </div>
          ) : bookings.length === 0 ? (
            <div className="py-32 text-center">
              <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4 opacity-20" />
              <p className="text-slate-400 font-bold uppercase tracking-widest">No Bookings Found</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-white/[0.03]">
                {bookings.map((booking) => (
                  <div 
                    key={booking._id} 
                    className={`p-6 space-y-4 hover:bg-white/[0.02] transition-colors relative group ${
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
                          <div className="font-bold text-white text-sm">{booking.name}</div>
                          <div className="text-[10px] text-slate-500">{booking.email}</div>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-[0.1em] border ${getStatusBadge(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 bg-white/[0.02] p-3 rounded-xl border border-white/5">
                      <div className="space-y-1">
                        <span className="text-[8px] font-black uppercase tracking-[0.1em] text-slate-500">Service</span>
                        <div className="text-[10px] font-bold text-slate-300 truncate">{booking.service?.replace("-", " ")}</div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[8px] font-black uppercase tracking-[0.1em] text-slate-500">Schedule</span>
                        <div className="text-[10px] font-bold text-slate-300 flex items-center gap-1">
                          <Calendar className="w-2.5 h-2.5 text-accent" /> {booking.preferredDate}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button onClick={() => onSelectBooking(booking)} className="flex-1 py-2 rounded-xl bg-accent/10 border border-accent/20 text-accent hover:bg-accent hover:text-white transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest">
                        <Eye className="w-3.5 h-3.5" /> View Detail
                      </button>
                      <button onClick={() => setDeleteModal({ isOpen: true, bookingId: booking._id })} className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all">
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
                    <tr className="border-b border-white/5 bg-white/[0.01]">
                      <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">CLIENT</th>
                      <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">SERVICE</th>
                      <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">SCHEDULE</th>
                      <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">STATUS</th>
                      <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">OPS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.03]">
                    {bookings.map((booking) => (
                      <motion.tr 
                        key={booking._id} 
                        layout
                        className={`hover:bg-white/[0.03] transition-all group ${
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
                               <div className="font-bold text-white text-sm">{booking.name}</div>
                               <div className="text-[10px] text-slate-500">{booking.email}</div>
                             </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{booking.service?.replace("-", " ")}</span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2 text-xs text-slate-300">
                            <Calendar className="w-3 h-3 text-accent" /> {booking.preferredDate}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1">
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
                            <button onClick={() => onSelectBooking(booking)} className="p-2 rounded-xl bg-accent/10 border border-accent/20 text-accent hover:bg-accent hover:text-white transition-all">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeleteModal({ isOpen: true, bookingId: booking._id })} className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all">
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
          <div className="border-t border-white/5 px-8 py-6 flex justify-between items-center bg-white/[0.01]">
            <p className="text-[10px] font-black uppercase text-slate-500">Page {pagination.page} / {pagination.totalPages}</p>
            <div className="flex gap-2">
              <button 
                onClick={() => onPageChange(pagination.page - 1)} 
                disabled={!pagination.hasPrev || loading} 
                className="p-2 rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white disabled:opacity-50 transition-all font-black"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={() => onPageChange(pagination.page + 1)} 
                disabled={!pagination.hasNext || loading} 
                className="p-2 rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white disabled:opacity-50 transition-all font-black"
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

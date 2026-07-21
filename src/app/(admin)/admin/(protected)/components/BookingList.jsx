"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, Search, SlidersHorizontal, Trash2, UserRound, ArrowUpRight } from "lucide-react";
import { useDeleteBooking } from "@/app/(admin)/hooks/useBookings";
import { BOOKING_STATUS_OPTIONS } from "@/lib/constants";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

const statusStyle = {
  new: "bg-amber-400/10 text-amber-300 border-amber-400/20",
  read: "bg-sky-400/10 text-sky-300 border-sky-400/20",
  seen: "bg-sky-400/10 text-sky-300 border-sky-400/20",
  confirmed: "bg-violet-400/10 text-violet-300 border-violet-400/20",
  completed: "bg-emerald-400/10 text-emerald-300 border-emerald-400/20",
  rejected: "bg-rose-400/10 text-rose-300 border-rose-400/20",
  cancelled: "bg-slate-400/10 text-slate-400 border-slate-400/20",
};

export default function BookingList({ bookings = [], pagination, loading, filters, onFilterChange, onPageChange, onSelectBooking }) {
  const [searchInput, setSearchInput] = useState(filters.search || "");
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, bookingId: null });
  const deleteMutation = useDeleteBooking();
  const services = [{ value: "", label: "Every service" }, ...Array.from(new Map(bookings.map((booking) => [booking.serviceSlug || booking.service, { value: booking.serviceSlug || booking.service, label: booking.serviceTitle || booking.service }]).filter(([value]) => value)).values())];

  const handleDelete = () => deleteMutation.mutate(deleteModal.bookingId, { onSuccess: () => setDeleteModal({ isOpen: false, bookingId: null }) });

  return (
    <section className="overflow-hidden rounded-[26px] border border-white/[0.08] bg-[#0d1727] shadow-[0_30px_80px_-45px_rgba(0,0,0,.9)]">
      <div className="flex flex-col gap-4 border-b border-white/[0.07] p-4 lg:flex-row lg:items-center lg:justify-between lg:p-5">
        <div className="relative max-w-xl flex-1">
          <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
          <input value={searchInput} onChange={(event) => { setSearchInput(event.target.value); onFilterChange({ search: event.target.value }); }} placeholder="Find a client, email or service..." className="w-full rounded-xl border border-white/[0.08] bg-slate-950/40 py-3 pl-11 pr-4 text-sm outline-none placeholder:text-slate-600 focus:border-cyan-400/40" />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <FilterSelect value={filters.service || ""} onChange={(value) => onFilterChange({ service: value || null })} options={services} />
          <FilterSelect value={filters.status || ""} onChange={(value) => onFilterChange({ status: value || null })} options={[{ value: "", label: "Every status" }, ...BOOKING_STATUS_OPTIONS]} />
        </div>
      </div>

      <div className="min-h-[440px] p-3 sm:p-5">
        {loading ? <Loading /> : bookings.length === 0 ? <Empty /> : (
          <div className="space-y-2.5">
            {bookings.map((booking, index) => {
              const service = booking.serviceTitle || booking.service || booking.serviceSlug || "Consultation";
              const initials = booking.name?.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase() || "CL";
              return (
                <motion.article key={booking._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.035 }} onClick={() => onSelectBooking(booking)} className="group cursor-pointer rounded-2xl border border-white/[0.065] bg-white/[0.025] p-4 transition hover:border-cyan-400/20 hover:bg-cyan-400/[0.035] sm:p-5">
                  <div className="grid items-center gap-4 md:grid-cols-[minmax(220px,1.25fr)_minmax(160px,.8fr)_minmax(180px,.8fr)_auto]">
                    <div className="flex min-w-0 items-center gap-3.5">
                      <div className="relative grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-cyan-300/20 to-blue-500/10 text-xs font-black text-cyan-200 ring-1 ring-inset ring-cyan-300/15">{initials}{booking.status === "new" && <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-[#0d1727] bg-amber-300" />}</div>
                      <div className="min-w-0"><h3 className="truncate text-sm font-semibold text-slate-100">{booking.name}</h3><p className="mt-1 truncate text-xs text-slate-500">{booking.email}</p></div>
                    </div>
                    <div><p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-600">Service</p><p className="mt-1 truncate text-sm capitalize text-slate-300">{service}</p></div>
                    <div className="flex gap-5"><div><p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-600">Date</p><p className="mt-1 flex items-center gap-1.5 text-xs text-slate-300"><CalendarDays className="size-3.5 text-cyan-400" />{booking.preferredDate || "Pending"}</p></div><div><p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-600">Time</p><p className="mt-1 flex items-center gap-1.5 text-xs text-slate-300"><Clock3 className="size-3.5 text-slate-500" />{booking.preferredTime || "—"}</p></div></div>
                    <div className="flex items-center justify-between gap-2 md:justify-end"><span className={`rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.13em] ${statusStyle[booking.status] || statusStyle.read}`}>{booking.status}</span><button onClick={(event) => { event.stopPropagation(); setDeleteModal({ isOpen: true, bookingId: booking._id }); }} className="grid size-9 place-items-center rounded-lg text-slate-600 opacity-100 transition hover:bg-rose-400/10 hover:text-rose-300 md:opacity-0 md:group-hover:opacity-100"><Trash2 className="size-4" /></button><ArrowUpRight className="size-4 text-slate-600 transition group-hover:text-cyan-300" /></div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>

      {pagination && pagination.totalPages > 1 && <Pagination pagination={pagination} loading={loading} onPageChange={onPageChange} label={`${pagination.total || ""} bookings`} />}
      <AnimatePresence>{deleteModal.isOpen && <DeleteConfirmationModal isOpen loading={deleteMutation.isPending} onClose={() => setDeleteModal({ isOpen: false, bookingId: null })} onConfirm={handleDelete} />}</AnimatePresence>
    </section>
  );
}

function FilterSelect({ value, onChange, options }) { return <label className="relative min-w-40"><SlidersHorizontal className="absolute left-3.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-500" /><select value={value} onChange={(event) => onChange(event.target.value)} className="w-full appearance-none rounded-xl border border-white/[0.08] bg-slate-950/40 py-3 pl-9 pr-8 text-xs text-slate-300 outline-none focus:border-cyan-400/40">{options.map((option) => <option key={option.value} value={option.value} className="bg-slate-900">{option.label}</option>)}</select></label>; }
function Pagination({ pagination, loading, onPageChange, label }) { return <div className="flex items-center justify-between border-t border-white/[0.07] px-5 py-4"><p className="text-xs text-slate-500">Page <span className="text-slate-300">{pagination.page}</span> of {pagination.totalPages} · {label}</p><div className="flex gap-2"><button disabled={!pagination.hasPrev || loading} onClick={() => onPageChange(pagination.page - 1)} className="grid size-9 place-items-center rounded-lg border border-white/[0.08] text-slate-400 disabled:opacity-30"><ChevronLeft className="size-4" /></button><button disabled={!pagination.hasNext || loading} onClick={() => onPageChange(pagination.page + 1)} className="grid size-9 place-items-center rounded-lg border border-white/[0.08] text-slate-400 disabled:opacity-30"><ChevronRight className="size-4" /></button></div></div>; }
function Loading() { return <div className="grid min-h-[390px] place-items-center"><div className="text-center"><div className="mx-auto size-8 animate-spin rounded-full border-2 border-cyan-300/15 border-t-cyan-300" /><p className="mt-4 text-[10px] font-bold uppercase tracking-[.2em] text-slate-600">Loading schedule</p></div></div>; }
function Empty() { return <div className="grid min-h-[390px] place-items-center text-center"><div><UserRound className="mx-auto size-9 text-slate-700" /><p className="mt-4 text-sm font-semibold text-slate-300">No matching bookings</p><p className="mt-1 text-xs text-slate-600">Try adjusting your search or filters.</p></div></div>; }

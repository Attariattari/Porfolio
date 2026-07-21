"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useBookings, useBookingStats, useRealTimeBookingUpdates } from "@/app/(admin)/hooks/useBookings";
import BookingList from "../components/BookingList";
import { CalendarDays, CheckCircle2, Inbox, RefreshCw, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function BookingsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    service: null,
    status: null,
    search: "",
  });

  const bookingsQuery = useBookings(filters);
  const statsQuery = useBookingStats();

  // Initialize Real-time updates (auto refetch)
  useRealTimeBookingUpdates();

  const handleSelectBooking = (booking) => {
    router.push(`/admin/bookings/${booking._id}`);
  };

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleRefresh = async () => {
    await Promise.all([bookingsQuery.refetch(), statsQuery.refetch()]);
    toast.success("Operational data synchronized");
  };

  // Auto-open detail if 'view' param is present
  const searchParams = useSearchParams();
  const viewId = searchParams.get("view");

  useEffect(() => {
    if (viewId) {
      router.push(`/admin/bookings/${viewId}`);
    }
  }, [viewId, router]);

  const totalBookings = statsQuery.data?.total ?? 0;
  const completionRate = totalBookings > 0
    ? Math.round(((statsQuery.data?.completed ?? 0) / totalBookings) * 100)
    : 0;

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 pb-20">
      <section className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#0d1727] shadow-[0_28px_80px_-50px_rgba(0,0,0,.9)]">
        <div className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-cyan-400/[0.06] blur-3xl" />
        <div className="relative flex flex-col justify-between gap-6 border-b border-white/[0.07] p-6 sm:p-8 md:flex-row md:items-center">
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-cyan-300 text-slate-950 shadow-[0_12px_35px_-14px_rgba(103,232,249,.8)]">
              <CalendarDays className="size-5" />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.24em] text-cyan-300/80">Scheduling workspace</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-[-.035em] text-white sm:text-3xl">Booking management</h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">Review new requests, prepare calls and keep every client appointment moving forward.</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={bookingsQuery.isFetching || statsQuery.isFetching}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-white/[0.08] bg-white/[0.035] px-4 py-3 text-xs font-semibold text-slate-400 transition hover:bg-white/[0.06] hover:text-white disabled:opacity-50 md:self-auto"
          >
            <RefreshCw className={`size-4 ${(bookingsQuery.isFetching || statsQuery.isFetching) ? 'animate-spin' : ''}`} />
            Refresh data
          </button>
        </div>
        <div className="grid md:grid-cols-[1.25fr_1fr_1fr_1fr]">
          <div className="flex items-center justify-between border-b border-white/[0.07] bg-amber-300/[0.035] p-5 md:border-b-0 md:border-r sm:p-6">
            <div><p className="text-[9px] font-bold uppercase tracking-[.18em] text-amber-300/70">Needs attention</p>{statsQuery.isLoading ? <StatSkeleton /> : <p className="mt-2 text-3xl font-semibold tracking-tight text-white">{statsQuery.data?.new ?? 0}</p>}<p className="mt-1 text-xs text-slate-500">New booking requests</p></div>
            <span className="relative grid size-11 place-items-center rounded-full bg-amber-300/10 text-amber-300"><Inbox className="size-4" />{(statsQuery.data?.new ?? 0) > 0 && <span className="absolute right-0 top-0 size-2 rounded-full bg-amber-300 ring-4 ring-[#101a29]" />}</span>
          </div>
          <OverviewMetric label="All bookings" value={totalBookings} icon={CalendarDays} loading={statsQuery.isLoading} />
          <OverviewMetric label="Confirmed" value={statsQuery.data?.confirmed ?? 0} icon={ShieldCheck} loading={statsQuery.isLoading} />
          <OverviewMetric label="Completion rate" value={`${completionRate}%`} icon={CheckCircle2} loading={statsQuery.isLoading} last />
        </div>
      </section>

      <div>
        <BookingList
          bookings={bookingsQuery.data?.data || []}
          pagination={bookingsQuery.data?.pagination}
          loading={bookingsQuery.isLoading || bookingsQuery.isFetching}
          filters={filters}
          onFilterChange={handleFilterChange}
          onPageChange={handlePageChange}
          onSelectBooking={handleSelectBooking}
        />
      </div>
    </div>
  );
}

function OverviewMetric({ label, value, icon: Icon, loading, last = false }) {
  return <div className={`flex items-center justify-between border-b border-white/[0.07] p-5 md:border-b-0 sm:p-6 ${last ? "" : "md:border-r"}`}><div><p className="text-[9px] font-bold uppercase tracking-[.18em] text-slate-600">{label}</p>{loading ? <StatSkeleton /> : <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-100">{value}</p>}</div><Icon className="size-4 text-slate-600" /></div>;
}

function StatSkeleton() {
  return <div className="mt-3 h-7 w-12 animate-pulse rounded-md bg-white/[0.06]" />;
}

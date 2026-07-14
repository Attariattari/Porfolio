"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useBookings, useBookingStats, useRealTimeBookingUpdates } from "@/app/(admin)/hooks/useBookings";
import BookingList from "../components/BookingList";
import BookingDetailModal from "../components/BookingDetailModal";
import { Calendar, Clock, CheckCircle2, AlertCircle, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function BookingsPage() {
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
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
    setSelectedBooking(booking);
    setIsDetailOpen(true);
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
    const timer = window.setTimeout(() => {
      if (!viewId || !bookingsQuery.data?.bookings) return;
      const target = bookingsQuery.data.bookings.find(b => b._id === viewId);
      if (target) {
        setSelectedBooking(target);
        setIsDetailOpen(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [viewId, bookingsQuery.data]);

  return (
    <div className="space-y-10 max-w-[1600px] mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black italic uppercase text-white tracking-tighter leading-none mb-4">
            Call <span className="text-accent underline decoration-accent/20 underline-offset-12">Bookings</span>
          </h1>
          <p className="text-slate-400 text-sm font-medium tracking-wide leading-relaxed max-w-2xl">
            SaaS-level scheduling architecture. Manage your <span className="text-white italic">strategic pipeline</span> with instant feedback and professional status workflows.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleRefresh} 
            disabled={bookingsQuery.isFetching || statsQuery.isFetching}
            className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all shadow-2xl disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${(bookingsQuery.isFetching || statsQuery.isFetching) ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          label="Total Bookings" 
          value={statsQuery.data?.total} 
          icon={Calendar} 
          color="blue" 
          loading={statsQuery.isLoading} 
        />
        <StatsCard 
          label="New Requests" 
          value={statsQuery.data?.new} 
          icon={AlertCircle} 
          color="amber" 
          loading={statsQuery.isLoading} 
          highlight={statsQuery.data?.new > 0} 
        />
        <StatsCard 
          label="Confirmed" 
          value={statsQuery.data?.confirmed} 
          icon={Clock} 
          color="purple" 
          loading={statsQuery.isLoading} 
        />
        <StatsCard 
          label="Completed" 
          value={statsQuery.data?.completed} 
          icon={CheckCircle2} 
          color="emerald" 
          loading={statsQuery.isLoading} 
        />
      </div>

      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-accent/20 to-blue-500/20 rounded-[2.5rem] blur-2xl opacity-10 group-hover:opacity-20 transition duration-1000"></div>
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

      <AnimatePresence>
        {isDetailOpen && selectedBooking && (
          <BookingDetailModal
            booking={selectedBooking}
            isOpen={isDetailOpen}
            onClose={() => {
              setIsDetailOpen(false);
              setSelectedBooking(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function StatsCard({ label, value, icon: Icon, color, loading, highlight }) {
  const colorMap = {
    blue: "from-blue-500/20 to-blue-600/5 border-blue-500/30 text-blue-500",
    amber: "from-amber-500/20 to-amber-600/5 border-amber-500/30 text-amber-500",
    purple: "from-purple-500/20 to-purple-600/5 border-purple-500/30 text-purple-500",
    emerald: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/30 text-emerald-500",
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }} 
      className={`relative overflow-hidden bg-gradient-to-br ${colorMap[color]} border rounded-[2rem] p-8 backdrop-blur-md shadow-3xl group hover:-translate-y-1 transition-all duration-500`}
    >
      {highlight && (
        <div className="absolute top-6 right-6 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-current"></span>
        </div>
      )}
      <div className="flex items-center justify-between relative z-10">
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 group-hover:text-slate-400 transition-colors uppercase">{label}</p>
          {loading ? (
             <div className="h-10 w-20 flex items-center">
                <div className="h-6 w-16 bg-white/5 animate-pulse rounded-lg" />
             </div>
          ) : (
            <p className="text-5xl font-black text-white tracking-tighter">{value ?? 0}</p>
          )}
        </div>
        <div className="p-4 rounded-[1.25rem] bg-white/5 border border-white/10 group-hover:scale-110 transition-transform duration-500 shadow-xl">
          <Icon className="w-8 h-8" />
        </div>
      </div>
    </motion.div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useMessages, useMessageStats, useRealTimeMessageUpdates } from "@/app/(admin)/hooks/useMessages";
import MessageList from "../components/MessageList";
import MessageDetailModal from "../components/MessageDetailModal";
import { MessageSquare, Mail, CheckCircle2, Reply, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { AnimatePresence } from "framer-motion";

export default function MessagesPage() {
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    service: null,
    status: null,
    search: "",
    sortBy: "latest",
  });

  // Fetch messages and stats
  const { messages, pagination, loading, error, refetch } = useMessages(filters);
  const { stats, setStats, loading: statsLoading, refetch: refetchStats } = useMessageStats(true);

  // Real-time updates
  useRealTimeMessageUpdates({
    onNewMessage: (message) => {
      refetch();
      refetchStats();
    },
    onStatusUpdate: (id, status) => {
      // If the currently open modal message is the one being updated, update it
      if (selectedMessage && selectedMessage._id === id) {
        setSelectedMessage(prev => ({ ...prev, status }));
      }
      refetch();
      refetchStats();
    },
    onStatsUpdate: (newStats) => {
      if (newStats) {
        setStats(newStats);
      } else {
        refetchStats();
      }
    }
  });

  // Handle message selection
  const handleSelectMessage = useCallback(async (message) => {
    setSelectedMessage(message);
    setIsDetailOpen(true);

    // Mark as seen in background if it's new
    const messageId = message.id || message._id;
    if (message.status === "new" && messageId) {
      try {
        await fetch(`/api/admin/messages/${messageId}`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...(typeof window !== "undefined" && localStorage.getItem("token")
              ? { Authorization: `Bearer ${localStorage.getItem("token")}` }
              : {}),
          },
        });

        // Handle local refresh without toast
        refetch();
        if (stats) {
          setStats(prev => ({
            ...prev,
            newMessages: Math.max(0, prev.newMessages - 1),
            seenMessages: prev.seenMessages + 1
          }));
        }
      } catch (err) {
        console.error("Failed to mark message as seen:", err);
      }
    }
  }, [refetch, setStats, stats]);

  // Handle filters change
  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  // Handle success after reply
  const handleReplySuccess = () => {
    refetch();
    refetchStats();
  };

  // Auto-open detail if 'view' param is present
  const searchParams = useSearchParams();
  const viewId = searchParams.get("view");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!viewId || messages.length === 0) return;
      const target = messages.find(m => m._id === viewId);
      if (target) {
        handleSelectMessage(target);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [viewId, messages, handleSelectMessage]);

  // Handle success after delete
  const handleDeleteSuccess = () => {
    refetch();
    refetchStats();
  };

  // Handle error
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 pb-20">
      {/* Header */}
      <section className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#0d1727] shadow-[0_28px_80px_-50px_rgba(0,0,0,.9)]">
        <div className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-cyan-400/[0.06] blur-3xl" />
        <div className="relative flex flex-col justify-between gap-6 border-b border-white/[0.07] p-6 sm:p-8 md:flex-row md:items-center">
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-cyan-300 text-slate-950 shadow-[0_12px_35px_-14px_rgba(103,232,249,.8)]"><MessageSquare className="size-5" /></span>
            <div><p className="mb-2 text-[10px] font-bold uppercase tracking-[.2em] text-cyan-300/75">Communication desk</p><h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Client messages</h1><p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">Review new inquiries, follow up with clients and keep every conversation moving.</p></div>
          </div>
          <button
            onClick={() => { refetch(); refetchStats(); toast.success("Messages updated"); }}
            disabled={loading || statsLoading}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-white/[0.08] bg-white/[0.035] px-4 py-3 text-xs font-semibold text-slate-400 transition hover:bg-white/[0.06] hover:text-white disabled:opacity-50 md:self-auto"
          >
            <RefreshCw className={`size-4 ${loading || statsLoading ? 'animate-spin' : ''}`} /> Refresh inbox
          </button>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-[1.25fr_1fr_1fr_1fr]">
          <Metric label="Needs attention" value={stats?.newMessages} note="Unread inquiries" icon={Mail} loading={statsLoading} attention />
          <Metric label="All messages" value={stats?.totalMessages} icon={MessageSquare} loading={statsLoading} />
          <Metric label="Reviewed" value={stats?.seenMessages} icon={CheckCircle2} loading={statsLoading} />
          <Metric label="Replied" value={stats?.repliedMessages} icon={Reply} loading={statsLoading} last />
        </div>
      </section>

      {/* Messages List Container */}
      <div>
        <MessageList
          messages={messages}
          pagination={pagination}
          loading={loading}
          filters={filters}
          availableServices={stats?.services || []}
          onFilterChange={handleFilterChange}
          onPageChange={handlePageChange}
          onSelectMessage={handleSelectMessage}
          onDeleteSuccess={handleDeleteSuccess}
        />
      </div>

      {/* Message Detail Modal */}
      <AnimatePresence>
        {isDetailOpen && selectedMessage && (
          <MessageDetailModal
            message={selectedMessage}
            isOpen={isDetailOpen}
            onClose={() => {
              setIsDetailOpen(false);
              setSelectedMessage(null);
            }}
            onReplySuccess={handleReplySuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function Metric({ label, value, note, icon: Icon, loading, attention = false, last = false }) {
  return <div className={`flex items-center justify-between border-b border-white/[0.07] p-5 sm:p-6 md:border-b-0 ${attention ? "bg-amber-300/[0.035]" : ""} ${last ? "" : "md:border-r"}`}><div><p className={`text-[9px] font-bold uppercase tracking-[.18em] ${attention ? "text-amber-300/70" : "text-slate-600"}`}>{label}</p>{loading ? <div className="mt-3 h-7 w-12 animate-pulse rounded-md bg-white/[0.06]" /> : <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-100">{value ?? 0}</p>}{note && <p className="mt-1 text-xs text-slate-500">{note}</p>}</div><span className={`relative grid size-11 place-items-center rounded-full ${attention ? "bg-amber-300/10 text-amber-300" : "text-slate-600"}`}><Icon className="size-4" />{attention && (value ?? 0) > 0 && <span className="absolute right-0 top-0 size-2 rounded-full bg-amber-300 ring-4 ring-[#101a29]" />}</span></div>;
}

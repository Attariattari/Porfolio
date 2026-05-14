"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useMessages, useMessageStats, useRealTimeMessageUpdates } from "@/app/(admin)/hooks/useMessages";
import MessageList from "../components/MessageList";
import MessageDetailModal from "../components/MessageDetailModal";
import { MessageSquare, Mail, CheckCircle2, Reply, RefreshCw, Send } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

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
  const handleSelectMessage = async (message) => {
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
  };

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
    if (viewId && messages.length > 0) {
      const target = messages.find(m => m._id === viewId);
      if (target) {
        handleSelectMessage(target);
      }
    }
  }, [viewId, messages]);

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
    <div className="space-y-10 max-w-[1600px] mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black italic uppercase text-white tracking-tighter leading-none mb-4">
            Client <span className="text-accent underline decoration-accent/20 underline-offset-12">Messages</span>
          </h1>
          <p className="text-slate-400 text-sm font-medium tracking-wide">
            Manage and respond to all client inquiries in <span className="text-white">real-time</span>.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { refetch(); refetchStats(); toast.success("Messages updated"); }} 
            className="p-3 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all group"
            title="Refresh messages"
          >
            <RefreshCw className={`w-5 h-5 group-active:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          label="Total Messages" 
          value={stats?.totalMessages} 
          icon={MessageSquare} 
          color="blue"
          loading={statsLoading}
        />
        <StatsCard 
          label="Unread / New" 
          value={stats?.newMessages} 
          icon={Mail} 
          color="amber"
          loading={statsLoading}
          highlight={stats?.newMessages > 0}
        />
        <StatsCard 
          label="Seen Messages" 
          value={stats?.seenMessages} 
          icon={CheckCircle2} 
          color="purple"
          loading={statsLoading}
        />
        <StatsCard 
          label="Replied" 
          value={stats?.repliedMessages} 
          icon={Reply} 
          color="emerald"
          loading={statsLoading}
        />
      </div>

      {/* Messages List Container */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-accent/20 to-blue-500/20 rounded-[2.5rem] blur-2xl opacity-20 group-hover:opacity-30 transition duration-1000"></div>
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

function StatsCard({ label, value, icon: Icon, color, loading, highlight }) {
  const colorMap = {
    blue: "from-blue-500/20 to-blue-600/5 border-blue-500/30 text-blue-500 shadow-blue-500/5",
    amber: "from-amber-500/20 to-amber-600/5 border-amber-500/30 text-amber-500 shadow-amber-500/5",
    purple: "from-purple-500/20 to-purple-600/5 border-purple-500/30 text-purple-500 shadow-purple-500/5",
    emerald: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/30 text-emerald-500 shadow-emerald-500/5",
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className={`relative overflow-hidden bg-gradient-to-br ${colorMap[color]} border rounded-3xl p-6 backdrop-blur-md shadow-2xl transition-all duration-300`}
    >
      {highlight && (
        <div className="absolute top-0 right-0 w-2 h-2 m-4 rounded-full bg-current animate-ping" />
      )}
      <div className="flex items-center justify-between relative z-10">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{label}</p>
          {loading ? (
            <div className="h-9 w-16 bg-white/5 animate-pulse rounded-lg" />
          ) : (
            <p className="text-4xl font-black text-white tabular-nums drop-shadow-sm">
              {value ?? 0}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 ${colorMap[color].split('text-')[1].split(' ')[0]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      
      {/* Decorative inner glow */}
      <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-current opacity-[0.03] blur-3xl rounded-full" />
    </motion.div>
  );
}
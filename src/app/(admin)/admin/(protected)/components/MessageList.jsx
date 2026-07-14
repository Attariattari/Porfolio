"use client";

import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  Loader,
  MessageSquare,
  Filter,
  ArrowUpDown,
  MoreVertical,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDeleteMessage } from "@/app/(admin)/hooks/useMessages";
import { toast } from "sonner";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

import { SERVICE_OPTIONS, STATUS_OPTIONS } from "@/lib/constants";



const STATUS_FILTER_OPTIONS = [
  { value: "", label: "All Status" },
  ...STATUS_OPTIONS,
];

export default function MessageList({
  messages,
  pagination,
  loading,
  filters,
  availableServices = [],
  onFilterChange,
  onPageChange,
  onSelectMessage,
  onDeleteSuccess,
}) {
  // Generate dynamic service filter options
  const serviceFilterOptions = [
    { value: "", label: "All Services" },
    ...availableServices.map(svc => {
      const predefined = SERVICE_OPTIONS.find(opt => opt.value === svc);
      return {
        value: svc,
        label: predefined ? predefined.label : svc.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
      };
    })
  ];
  const [searchInput, setSearchInput] = useState(filters.search || "");
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, messageId: null });
  const { deleteMessage, loading: deleting } = useDeleteMessage();

  const handleSearch = (e) => {
    setSearchInput(e.target.value);
    onFilterChange({ search: e.target.value });
  };

  const handleDelete = async () => {
    if (!deleteModal.messageId) return;

    const result = await deleteMessage(deleteModal.messageId);
    if (result.success) {
      toast.success("Message deleted successfully.");
      setDeleteModal({ isOpen: false, messageId: null });
      onDeleteSuccess?.();
    } else {
      toast.error(result.error || "Failed to delete message");
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      new: "bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-sm",
      seen: "bg-accent/10 text-accent border-accent/20 shadow-sm",
      replied: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-sm",
    };
    return badges[status] || "bg-muted text-muted-foreground border-border";
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Search & Filters Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center bg-card/50 border border-border/70 p-2 rounded-2xl backdrop-blur-md">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search messages..."
            className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border/70 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 focus:bg-muted transition-all placeholder:text-muted-foreground/80"
            value={searchInput}
            onChange={handleSearch}
          />
        </div>

        <div className="flex flex-wrap md:flex-nowrap gap-2">
          <div className="relative min-w-[160px]">
            <select
              className="w-full pl-4 pr-10 py-2.5 bg-muted/50 border border-border/70 rounded-xl text-xs font-semibold text-foreground/80 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary/40 focus:bg-muted transition-all"
              value={filters.service || ""}
              onChange={(e) => onFilterChange({ service: e.target.value || null })}
            >
              {serviceFilterOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-card text-foreground">
                  {opt.label}
                </option>
              ))}
            </select>
            <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          </div>

          <div className="relative min-w-[140px]">
            <select
              className="w-full pl-4 pr-10 py-2.5 bg-muted/50 border border-border/70 rounded-xl text-xs font-semibold text-foreground/80 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary/40 focus:bg-muted transition-all"
              value={filters.status || ""}
              onChange={(e) => onFilterChange({ status: e.target.value || null })}
            >
              {STATUS_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-card text-foreground">
                  {opt.label}
                </option>
              ))}
            </select>
            <ArrowUpDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-gradient-to-br from-card/60 to-transparent border border-border rounded-[2rem] overflow-hidden backdrop-blur-xl shadow-3xl">
        <div className="min-h-[400px]">
          {loading ? (
            <div className="flex flex-col justify-center items-center py-32 gap-4">
              <div className="relative">
                <div className="w-12 h-12 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
                <div className="absolute inset-0 blur-lg bg-accent/20 rounded-full animate-pulse" />
              </div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-accent/60 animate-pulse">Syncing Streams...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="py-32 text-center">
              <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-border">
                <MessageSquare className="w-8 h-8 text-muted-foreground/80" />
              </div>
              <p className="text-muted-foreground font-bold uppercase tracking-widest">No Transmissions Found</p>
              <p className="text-muted-foreground/80 text-xs mt-2">Adjust your filters to see more results</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-white/[0.03]">
                {messages.map((message, idx) => (
                  <div
                    key={message._id}
                    className={`p-6 space-y-4 hover:bg-card/50 transition-colors relative group ${
                      message.status === 'new' ? 'bg-accent/[0.03] border-l-2 border-accent' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-[10px] ${
                          message.status === 'new' ? 'bg-accent text-foreground' : 'bg-muted/50 text-muted-foreground'
                        }`}>
                          {message.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-foreground text-sm tracking-tight">{message.name}</p>
                          <p className="text-[10px] text-muted-foreground font-medium">{formatDate(message.createdAt)}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-[0.15em] border ${getStatusBadge(message.status)}`}>
                        {message.status}
                      </span>
                    </div>

                    <p className="text-[11px] text-foreground/80 line-clamp-2 font-medium bg-card/50 px-3 py-2 rounded-lg border border-border/70 italic">
                      &ldquo;{message.subject || message.message}&rdquo;
                    </p>

                    <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.1em] text-muted-foreground">
                      <span className="w-1 h-1 bg-accent rounded-full" />
                      {message.service?.replace("-", " ") || "General Inquiry"}
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button onClick={() => onSelectMessage(message)} className="flex-1 py-2 rounded-xl bg-accent/10 border border-accent/20 text-accent hover:bg-accent hover:text-foreground transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest">
                        <Eye className="w-3.5 h-3.5" /> Read
                      </button>
                      <button onClick={() => setDeleteModal({ isOpen: true, messageId: message._id })} className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-foreground transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border/70 bg-card/40">
                      <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground w-[25%]">
                        SENDER IDENTITY
                      </th>
                      <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground w-[35%]">
                        CARRIER PAYLOAD
                      </th>
                      <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                        PROTOCOL
                      </th>
                      <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                        STATUS
                      </th>
                      <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                        TIMESTAMP
                      </th>
                      <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                        OPS
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.03]">
                    {messages.map((message, idx) => (
                      <motion.tr
                        key={message._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="hover:bg-muted/40 transition-all group"
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-[10px] ${
                              message.status === 'new' ? 'bg-accent text-foreground' : 'bg-muted/50 text-muted-foreground'
                            }`}>
                              {message.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-foreground text-sm tracking-tight group-hover:text-accent transition-colors">
                                {message.name}
                              </p>
                              <p className="text-[10px] text-muted-foreground font-medium">
                                {message.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <p className="text-sm text-foreground/80 line-clamp-1 font-medium bg-card/50 px-3 py-1.5 rounded-lg border border-border/70">
                            {message.subject || message.message}
                          </p>
                        </td>
                        <td className="px-8 py-5">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest inline-flex items-center gap-2">
                            <span className="w-1 h-1 bg-accent rounded-full" />
                            {message.service?.replace("-", " ") || "General"}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em] border ${getStatusBadge(
                              message.status
                            )}`}
                          >
                            {message.status}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right whitespace-nowrap">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                            {formatDate(message.createdAt)}
                          </p>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex justify-end gap-2 transition-opacity">
                            <button
                              onClick={(e) => { e.stopPropagation(); onSelectMessage(message); }}
                              className="p-2 rounded-xl bg-accent/10 border border-accent/20 text-accent hover:bg-accent hover:text-foreground transition-all shadow-lg shadow-accent/10"
                              title="Open Stream"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setDeleteModal({ isOpen: true, messageId: message._id }); }}
                              disabled={deleting}
                              className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-foreground transition-all disabled:opacity-50"
                              title="Delete Message"
                            >
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

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="border-t border-border/70 px-8 py-6 flex flex-col sm:flex-row justify-between items-center gap-4 bg-card/40">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              Page {pagination.page} / {pagination.totalPages} <span className="mx-2 text-muted-foreground/20">|</span> Total {pagination.total} Messages
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={!pagination.hasPrev || loading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-muted/50 text-muted-foreground font-black text-[10px] uppercase tracking-widest hover:text-foreground hover:bg-muted disabled:opacity-50 transition-all active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" /> PREV
              </button>
              <button
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={!pagination.hasNext || loading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-muted/50 text-muted-foreground font-black text-[10px] uppercase tracking-widest hover:text-foreground hover:bg-muted disabled:opacity-50 transition-all active:scale-95"
              >
                NEXT <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        loading={deleting}
        onClose={() => setDeleteModal({ isOpen: false, messageId: null })}
        onConfirm={handleDelete}
      />
    </div>
  );
}

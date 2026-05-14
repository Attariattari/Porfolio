"use client";

import { X, Send, Clock, Copy, CheckCircle2, User, Mail, Hash, Shield, Trash2, ArrowRight } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useSendReply, useDeleteMessage } from "@/app/(admin)/hooks/useMessages";
import { toast } from "sonner";

import DeleteConfirmationModal from "./DeleteConfirmationModal";

export default function MessageDetailModal({
  message,
  isOpen,
  onClose,
  onReplySuccess,
}) {
  const [replyText, setReplyText] = useState("");
  const [copied, setCopied] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { sendReply, loading: replying } = useSendReply();
  const { deleteMessage, loading: deleting } = useDeleteMessage();

  if (!isOpen) return null;

  const handleSendReply = async () => {
    if (!replyText.trim()) {
      toast.error("Reply cannot be empty");
      return;
    }

    const result = await sendReply(message._id, replyText.trim());
    if (result.success) {
      toast.success("Reply sent successfully");
      setReplyText("");
      onReplySuccess?.();
      onClose();
    } else {
      toast.error(result.error || "Failed to send reply");
    }
  };

  const handleDelete = async () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    const result = await deleteMessage(message._id);
    if (result.success) {
      toast.success("Message deleted");
      setIsDeleteModalOpen(false);
      onClose();
    } else {
      toast.error(result.error || "Failed to delete message");
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(message.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      new: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      seen: "bg-slate-500/10 text-slate-400 border-white/10",
      replied: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    };
    return badges[status] || "bg-slate-500/10 text-slate-400 border-white/10";
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-[#020617]/80 backdrop-blur-md"
        onClick={onClose}
      />

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-4xl bg-[#0f172a] border border-white/10 rounded-2xl relative z-10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 md:px-8 py-5 md:py-6 border-b border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6 bg-white/[0.02]">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center text-lg md:text-xl font-bold shrink-0 ${
              message.status === 'new' ? 'bg-primary text-white' : 'bg-white/10 text-slate-400'
            }`}>
              {message.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg md:text-xl font-semibold text-white truncate max-w-[150px] md:max-w-none">{message.name}</h2>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border shrink-0 ${getStatusBadge(message.status)}`}>
                  {message.status}
                </span>
              </div>
              <p className="text-[11px] md:text-sm text-slate-400 flex items-center gap-2 mt-0.5">
                <Clock className="w-3 h-3 md:w-3.5 md:h-3.5" />
                {formatDate(message.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 border-white/5 pt-4 sm:pt-0">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="p-2 md:p-2.5 rounded-lg md:rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 md:p-2.5 rounded-lg md:rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
        {/* Contact info and metadata */}
        <div className="px-6 md:px-8 py-5 md:py-6 bg-white/[0.01] border-b border-white/5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="min-w-0">
            <p className="text-[10px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3 h-3" /> Contact Email
            </p>
            <div className="flex items-center gap-2 overflow-hidden">
              <p className="text-xs md:text-sm font-medium text-slate-200 truncate" title={message.email}>{message.email}</p>
              <button 
                onClick={handleCopyEmail} 
                className="p-1.5 rounded-lg bg-white/5 hover:bg-primary/20 hover:text-primary transition-all shrink-0"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="min-w-0">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
              <Hash className="w-3 h-3" /> Service Requested
            </p>
            <p className="text-xs md:text-sm font-medium text-slate-200 capitalize truncate" title={message.service?.replace("-", " ") || "General Inquiry"}>
              {message.service?.replace("-", " ") || "General Inquiry"}
            </p>
          </div>

          <div className="min-w-0 sm:col-span-2 lg:col-span-1">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
              <Shield className="w-3 h-3" /> Subject Line
            </p>
            <p className="text-xs md:text-sm font-medium text-slate-200 truncate" title={message.subject || "No Subject Provided"}>
              {message.subject || "No Subject Provided"}
            </p>
          </div>
        </div>

          {/* Message Row */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-400">
              <User className="w-4 h-4" />
              <h3 className="text-[10px] md:text-xs font-bold uppercase tracking-widest">Message Body</h3>
            </div>
            <div className="p-5 md:p-6 bg-white/[0.03] border border-white/10 rounded-xl md:rounded-2xl">
              <p className="text-sm md:text-base text-slate-300 leading-relaxed whitespace-pre-wrap">
                {message.message}
              </p>
            </div>
          </div>

          {/* Reply Section */}
          <div className="pt-8 border-t border-white/10 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Send className="w-4 h-4" />
                {message.status === 'replied' ? 'Official Response' : 'Reply to Message'}
              </h3>
            </div>

            {message.adminReply?.text ? (
              <div className="p-5 md:p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-xl md:rounded-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-[0.05]">
                  <CheckCircle2 className="w-12 h-12 md:w-16 md:h-16" />
                </div>
                <div className="relative z-10">
                  <p className="text-sm md:text-base text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {message.adminReply.text}
                  </p>
                  <p className="mt-4 text-[11px] font-medium text-emerald-500/60 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    Replied on {formatDate(message.adminReply.repliedAt)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your response to the user..."
                  className="w-full h-40 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-5 md:p-6 text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all resize-none placeholder:text-slate-600"
                  disabled={replying}
                />
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-[11px] text-slate-500 order-2 sm:order-1">
                    Characters: {replyText.length}
                  </p>
                  <button
                    onClick={handleSendReply}
                    disabled={replying || !replyText.trim()}
                    className="w-full sm:w-auto px-6 py-3 md:py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 order-1 sm:order-2"
                  >
                    {replying ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                    Send Response
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        loading={deleting}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

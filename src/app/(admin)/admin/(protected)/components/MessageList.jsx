"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Inbox, Search, SlidersHorizontal, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useDeleteMessage } from "@/app/(admin)/hooks/useMessages";
import { SERVICE_OPTIONS, STATUS_OPTIONS } from "@/lib/constants";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

const statusStyle = { new: "bg-amber-300 text-slate-950", seen: "bg-sky-400/10 text-sky-300 ring-1 ring-sky-400/20", replied: "bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-400/20" };

export default function MessageList({ messages = [], pagination, loading, filters, availableServices = [], onFilterChange, onPageChange, onSelectMessage, onDeleteSuccess }) {
  const [searchInput, setSearchInput] = useState(filters.search || "");
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, messageId: null });
  const { deleteMessage, loading: deleting } = useDeleteMessage();
  const serviceOptions = [{ value: "", label: "All topics" }, ...availableServices.map((service) => ({ value: service, label: SERVICE_OPTIONS.find((option) => option.value === service)?.label || service.replaceAll("-", " ") }))];

  const handleDelete = async () => {
    const result = await deleteMessage(deleteModal.messageId);
    if (!result.success) return toast.error(result.error || "Could not delete message");
    toast.success("Message deleted"); setDeleteModal({ isOpen: false, messageId: null }); onDeleteSuccess?.();
  };

  return (
    <section className="grid min-h-[590px] overflow-hidden rounded-[26px] border border-white/[0.08] bg-[#0d1727] shadow-[0_30px_80px_-45px_rgba(0,0,0,.9)] lg:grid-cols-[250px_1fr]">
      <aside className="border-b border-white/[0.07] bg-white/[0.025] p-5 lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-3 border-b border-white/[0.07] pb-5"><span className="grid size-10 place-items-center rounded-xl bg-cyan-400/10 text-cyan-300"><Inbox className="size-5" /></span><div><p className="text-sm font-semibold text-slate-100">Inbox</p><p className="text-xs text-slate-500">{pagination?.total ?? messages.length} conversations</p></div></div>
        <p className="mb-3 mt-5 text-[9px] font-bold uppercase tracking-[.2em] text-slate-600">Message status</p>
        <nav className="flex gap-2 overflow-x-auto lg:flex-col">
          {[{ value: "", label: "All messages" }, ...STATUS_OPTIONS].map((option) => <button key={option.value} onClick={() => onFilterChange({ status: option.value || null })} className={`flex items-center justify-between whitespace-nowrap rounded-xl px-3 py-2.5 text-left text-xs transition ${(!filters.status && !option.value) || filters.status === option.value ? "bg-cyan-400/10 font-semibold text-cyan-200 ring-1 ring-inset ring-cyan-400/15" : "text-slate-500 hover:bg-white/[0.035] hover:text-slate-300"}`}><span>{option.label}</span>{option.value === "new" && <span className="size-1.5 rounded-full bg-amber-300" />}</button>)}
        </nav>
        <p className="mb-3 mt-6 text-[9px] font-bold uppercase tracking-[.2em] text-slate-600">Topic</p>
        <label className="relative block"><SlidersHorizontal className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-600" /><select value={filters.service || ""} onChange={(event) => onFilterChange({ service: event.target.value || null })} className="w-full appearance-none rounded-xl border border-white/[0.07] bg-slate-950/35 py-2.5 pl-9 pr-3 text-xs capitalize text-slate-400 outline-none">{serviceOptions.map((option) => <option key={option.value} value={option.value} className="bg-slate-900">{option.label}</option>)}</select></label>
      </aside>

      <div className="min-w-0">
        <div className="border-b border-white/[0.07] p-4"><div className="relative"><Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-600" /><input value={searchInput} onChange={(event) => { setSearchInput(event.target.value); onFilterChange({ search: event.target.value }); }} placeholder="Search sender, email or message..." className="w-full rounded-xl border border-white/[0.07] bg-slate-950/35 py-3 pl-11 pr-4 text-sm outline-none placeholder:text-slate-600 focus:border-cyan-400/35" /></div></div>
        <div className="min-h-[470px]">
          {loading ? <div className="grid min-h-[470px] place-items-center"><div className="size-8 animate-spin rounded-full border-2 border-cyan-300/15 border-t-cyan-300" /></div> : messages.length === 0 ? <div className="grid min-h-[470px] place-items-center text-center"><div><Inbox className="mx-auto size-10 text-slate-700" /><p className="mt-4 text-sm font-semibold text-slate-300">Your inbox is clear</p><p className="mt-1 text-xs text-slate-600">No messages match this view.</p></div></div> : <div className="divide-y divide-white/[0.055]">{messages.map((message, index) => <MessageRow key={message._id} message={message} index={index} onOpen={() => onSelectMessage(message)} onDelete={() => setDeleteModal({ isOpen: true, messageId: message._id })} deleting={deleting} />)}</div>}
        </div>
        {pagination && pagination.totalPages > 1 && <div className="flex items-center justify-between border-t border-white/[0.07] px-5 py-4"><p className="text-xs text-slate-500">Page {pagination.page} of {pagination.totalPages}</p><div className="flex gap-2"><button disabled={!pagination.hasPrev || loading} onClick={() => onPageChange(pagination.page - 1)} className="grid size-9 place-items-center rounded-lg border border-white/[0.08] text-slate-400 disabled:opacity-30"><ChevronLeft className="size-4" /></button><button disabled={!pagination.hasNext || loading} onClick={() => onPageChange(pagination.page + 1)} className="grid size-9 place-items-center rounded-lg border border-white/[0.08] text-slate-400 disabled:opacity-30"><ChevronRight className="size-4" /></button></div></div>}
      </div>
      <DeleteConfirmationModal isOpen={deleteModal.isOpen} loading={deleting} onClose={() => setDeleteModal({ isOpen: false, messageId: null })} onConfirm={handleDelete} />
    </section>
  );
}

function MessageRow({ message, index, onOpen, onDelete, deleting }) {
  const initials = message.name?.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase() || "M";
  const date = new Date(message.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  return <motion.article initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * .025 }} onClick={onOpen} className={`group cursor-pointer px-4 py-4 transition hover:bg-cyan-400/[0.035] sm:px-6 ${message.status === "new" ? "bg-cyan-400/[0.025]" : ""}`}><div className="flex gap-3.5"><div className={`grid size-10 shrink-0 place-items-center rounded-full text-[10px] font-black ${message.status === "new" ? "bg-cyan-400 text-white" : "bg-white/[0.06] text-slate-400"}`}>{initials}</div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className={`truncate text-sm ${message.status === "new" ? "font-bold text-white" : "font-medium text-slate-300"}`}>{message.name}</h3><p className="mt-0.5 truncate text-xs text-slate-600">{message.email}</p></div><div className="flex shrink-0 items-center gap-2"><span className="hidden text-[10px] text-slate-600 sm:block">{date}</span><span className={`rounded-full px-2 py-1 text-[8px] font-black uppercase tracking-[.12em] ${statusStyle[message.status] || statusStyle.seen}`}>{message.status}</span></div></div><p className="mt-3 truncate text-sm font-medium text-slate-300">{message.subject || "General inquiry"}</p><p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{message.message}</p><div className="mt-3 flex items-center justify-between"><span className="rounded-md bg-white/[0.04] px-2 py-1 text-[9px] capitalize text-slate-500">{message.service?.replaceAll("-", " ") || "General"}</span><button disabled={deleting} onClick={(event) => { event.stopPropagation(); onDelete(); }} className="grid size-8 place-items-center rounded-lg text-slate-700 opacity-100 hover:bg-rose-400/10 hover:text-rose-300 sm:opacity-0 sm:group-hover:opacity-100"><Trash2 className="size-3.5" /></button></div></div></div></motion.article>;
}

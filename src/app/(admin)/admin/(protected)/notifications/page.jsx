"use client";

import { useState, useEffect } from "react";
import useAdminStore from "@/lib/store/adminStore";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Search, Filter, Trash2, Check, UserCheck, UserX, MessageSquare, ShieldAlert, Cpu, Loader2, ArrowRightCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { formatName } from "@/lib/utils";

export default function NotificationsPage() {
    const { notifications, fetchNotifications, updateNotification, deleteNotification, updateUserStatus } = useAdminStore();
    const [filter, setFilter] = useState("all");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications().then(() => setLoading(false));
    }, []);

    const filteredNotifications = notifications.filter(n => {
        if (filter === "all") return true;
        if (filter === "unread") return n.status === "unread";
        if (filter === "read") return n.status === "read";
        if (filter === "user_requests") return n.type === "USER_REQUEST";
        return n.type === filter;
    });

    const markAllRead = async () => {
        const unread = notifications.filter(n => n.status === "unread");
        for (const n of unread) { await updateNotification(n._id || n.id, "read"); }
        toast.success("Security monitors stabilized.");
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
             <Loader2 className="w-12 h-12 text-blue-500 animate-spin opacity-50 mb-6" />
             <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em] animate-pulse">Syncing Event Log...</p>
        </div>
    );

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
                <div>
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white mb-2">
                        MUHYO TECH <span className="text-blue-500">Log</span>
                    </h1>
                    <p className="text-slate-400 text-sm font-medium tracking-tight opacity-70">
                        Detailed event stream and administrative alerts.
                    </p>
                </div>
                
                <div className="flex items-center gap-4">
                    <button 
                        onClick={markAllRead}
                        className="px-6 py-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-[10px] font-black uppercase text-blue-400 tracking-widest hover:bg-blue-500 hover:text-white transition-all shadow-lg shadow-blue-500/5 flex items-center gap-3"
                    >
                        <Check className="w-4 h-4" /> Stabilize Log
                    </button>
                    <div className="px-5 py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
                         <Bell className="w-5 h-5 text-slate-500" />
                         <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Unread Logs: <span className="text-blue-500">{notifications.filter(n=>n.status==='unread').length}</span></p>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-2">
                {['all', 'unread', 'read', 'user_requests', 'MESSAGE', 'SYSTEM'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                            filter === f 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-600/20' 
                            : 'bg-[#0f172a]/40 text-slate-500 border-white/5 hover:border-blue-500/30'
                        }`}
                    >
                        {f.replace('_', ' ')}
                    </button>
                ))}
            </div>

            {/* Log List */}
            <div className="grid gap-4">
                <AnimatePresence mode="popLayout">
                    {filteredNotifications.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-20 text-center bg-[#0f172a]/20 border border-white/5 rounded-[3rem]">
                             <ShieldAlert className="w-16 h-16 text-slate-600 mx-auto mb-6 opacity-30" />
                             <h3 className="text-xl font-bold text-slate-500 uppercase tracking-widest italic">All Quiet in the Console.</h3>
                             <p className="text-sm text-slate-600 mt-2 font-medium tracking-tight">No events match your current filter criteria.</p>
                        </motion.div>
                    ) : (
                        filteredNotifications.map((n) => {
                            const Icon = n.type === 'USER_REQUEST' ? UserCheck : n.type === 'MESSAGE' ? MessageSquare : Cpu;
                            const isUnread = n.status === 'unread';
                            const isPendingUser = n.type === 'USER_REQUEST' && n.status === 'unread';
                            const nId = n._id || n.id;

                            return (
                                <motion.div
                                    key={nId}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className={`group relative bg-[#0f172a]/60 backdrop-blur-2xl border border-white/5 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:bg-white/[0.03] ${isUnread ? 'border-l-4 border-l-blue-500' : ''}`}
                                >
                                    <div className="flex items-start md:items-center gap-4 md:gap-8 flex-1">
                                        <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center border shrink-0 transition-all ${isUnread ? 'bg-blue-500/10 border-blue-500/30 text-blue-500' : 'bg-slate-500/5 border-white/5 text-slate-600 opacity-60'}`}>
                                            <Icon className="w-5 h-5 md:w-6 md:h-6" />
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-1 md:mb-2">
                                                <h3 className={`text-base md:text-lg font-black italic tracking-tight truncate ${isUnread ? 'text-white' : 'text-slate-400'}`}>{n.title}</h3>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 md:py-1 rounded-md ${
                                                        n.type === 'USER_REQUEST' ? 'bg-blue-600/10 text-blue-500' :
                                                        n.type === 'MESSAGE' ? 'bg-indigo-600/10 text-indigo-500' :
                                                        'bg-slate-600/10 text-slate-500'
                                                    }`}>
                                                        {n.type}
                                                    </span>
                                                    <span className="text-[8px] md:text-[9px] text-slate-500 font-bold uppercase tracking-widest opacity-60">
                                                        {formatDistanceToNow(new Date(n.createdAt))} ago
                                                    </span>
                                                </div>
                                            </div>
                                            <p className={`text-[11px] md:text-sm font-medium tracking-tight leading-relaxed line-clamp-2 md:line-clamp-none ${isUnread ? 'text-slate-300' : 'text-slate-500 opacity-60'}`}>
                                                {n.message}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between md:justify-end gap-4 border-t border-white/5 md:border-t-0 pt-4 md:pt-0">
                                        {isPendingUser && (
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={async () => {
                                                        const match = n.message.match(/\(([^)]+)\)/);
                                                        const email = match ? match[1] : n.message.split(' ')[0];
                                                        await updateUserStatus(email, 'approve');
                                                    }}
                                                    className="p-3 md:p-4 bg-emerald-600/10 text-emerald-500 border border-emerald-600/20 rounded-xl md:rounded-2xl hover:bg-emerald-600 hover:text-white transition-all shadow-xl shadow-emerald-500/10"
                                                    title="Approve immediately"
                                                >
                                                    <UserCheck className="w-5 h-5 md:w-6 md:h-6" />
                                                </button>
                                                <button 
                                                    onClick={async () => {
                                                        const match = n.message.match(/\(([^)]+)\)/);
                                                        const email = match ? match[1] : n.message.split(' ')[0];
                                                        await updateUserStatus(email, 'deny');
                                                    }}
                                                    className="p-3 md:p-4 bg-red-600/10 text-red-500 border border-red-600/20 rounded-xl md:rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-xl shadow-red-500/10"
                                                    title="Deny immediately"
                                                >
                                                    <UserX className="w-5 h-5 md:w-6 md:h-6" />
                                                </button>
                                                <div className="w-px h-8 bg-white/10 mx-1 md:hidden" />
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2 md:gap-3 group-hover:opacity-100 transition-opacity ml-auto md:ml-0">
                                            {isUnread ? (
                                                <button 
                                                    onClick={() => updateNotification(nId, 'read')}
                                                    className="p-3 md:p-4 bg-blue-500/10 text-blue-500 rounded-xl md:rounded-2xl border border-blue-500/20 hover:bg-blue-500 hover:text-black transition-all"
                                                    title="Mark read"
                                                >
                                                    <Check className="w-4 h-4 md:w-5 md:h-5" />
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => updateNotification(nId, 'unread')}
                                                    className="p-3 md:p-4 bg-slate-500/10 text-slate-500 rounded-xl md:rounded-2xl border border-white/5 hover:bg-white/10 hover:text-white transition-all"
                                                    title="Mark unread"
                                                >
                                                    <ArrowRightCircle className="w-4 h-4 md:w-5 md:h-5 rotate-180" />
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => deleteNotification(nId)}
                                                className="p-3 md:p-4 bg-red-500/10 text-red-500 rounded-xl md:rounded-2xl border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
                                                title="Delete entry"
                                            >
                                                <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
            </div>

            <div className="pt-10 opacity-30 text-center">
                 <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-600">Administrative Log Manifest v2.4 • SECURE_RECORD_ALPHA</p>
            </div>
        </div>
    );
}

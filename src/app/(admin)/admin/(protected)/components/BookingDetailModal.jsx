"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Calendar, 
  Clock, 
  Mail, 
  Phone, 
  User, 
  MessageSquare,
  CheckCircle2, 
  XCircle,
  Video,
  FileEdit,
  Send,
  Loader2,
  ShieldCheck,
  Save,
  Zap,
  Info,
  ChevronRight,
  CalendarCheck,
  Trophy,
  History,
  Lock,
  AlertCircle
} from "lucide-react";
import { useUpdateBooking, useBookingDetail } from "@/app/(admin)/hooks/useBookings";
import { toast } from "sonner";

export default function BookingDetailModal({ booking: initialBooking, isOpen, onClose }) {
  const { data: booking = initialBooking, isLoading: isFetchingLive } = useBookingDetail(initialBooking?._id);
  
  const [editData, setEditData] = useState({
    meetingLink: "",
    adminNote: "",
  });
  const [showRejectionInput, setShowRejectionInput] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showManualEmail, setShowManualEmail] = useState(false);
  const [customMessage, setCustomMessage] = useState("");

  const updateMutation = useUpdateBooking();

  const isFinalized = booking?.status === 'completed' || booking?.status === 'rejected' || booking?.status === 'cancelled';

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!booking) return;
      setEditData({
        meetingLink: booking.meetingLink || "",
        adminNote: booking.adminNote || "",
      });
      setRejectionReason(booking.rejectionReason || "");
    }, 0);
    return () => window.clearTimeout(timer);
  }, [booking]);

  if (!booking) return null;

  const handleUpdateDetails = async () => {
    updateMutation.mutate({
      id: booking._id,
      ...editData
    }, {
      onSuccess: () => {
        toast.success("Operational details synchronized");
      }
    });
  };

  const handleStatusTransition = async (newStatus, extras = {}) => {
    updateMutation.mutate({
      id: booking._id,
      status: newStatus,
      ...editData,
      ...extras
    }, {
      onSuccess: () => {
        toast.success(`Lifecycle status: ${newStatus.toUpperCase()}`);
        if (newStatus === 'rejected') setShowRejectionInput(false);
      }
    });
  };

  const handleManualEmail = async () => {
    if (!customMessage.trim()) return toast.error("Please enter a message");
    
    updateMutation.mutate({
      id: booking._id,
      isManualEmail: true,
      customMessage: customMessage
    }, {
      onSuccess: () => {
        toast.success("Professional communication dispatched");
        setShowManualEmail(false);
        setCustomMessage("");
      }
    });
  };

  const getStatusDisplay = (status) => {
    const displays = {
      new: { label: "Pending Review", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
      read: { label: "Under Evaluation", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
      seen: { label: "Under Evaluation", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
      confirmed: { label: "Authorized Call", color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
      completed: { label: "Session Finished", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
      rejected: { label: "Request Declined", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
      cancelled: { label: "Deleted", color: "text-slate-500", bg: "bg-slate-500/10", border: "border-slate-500/20" },
    };
    return displays[status] || displays.new;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#070c18]/90 backdrop-blur-2xl" 
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 30 }}
        className="relative w-full max-w-5xl bg-[#0f172a] border border-white/10 rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col lg:flex-row max-h-[95vh]"
      >
        {/* Left Sidebar: Intelligence & Meta */}
        <div className="w-full lg:w-[380px] p-8 lg:p-12 bg-white/[0.01] border-r border-white/5 space-y-10 overflow-y-auto">
           <div className="flex items-center justify-between lg:hidden mb-10">
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusDisplay(booking.status).bg} ${getStatusDisplay(booking.status).color} ${getStatusDisplay(booking.status).border}`}>
                {getStatusDisplay(booking.status).label}
              </span>
              <button onClick={onClose} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all text-slate-400">
                <X className="w-5 h-5" />
              </button>
           </div>

           <div className="space-y-6">
             <div className="relative inline-block text-accent mx-auto lg:mx-0">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-[2rem] bg-gradient-to-br from-accent/20 to-current flex items-center justify-center border border-accent/20 shadow-2xl">
                   <User className="w-8 h-8 md:w-10 md:h-10" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 md:w-6 md:h-6 rounded-lg bg-emerald-500 border-4 border-[#0f172a] flex items-center justify-center">
                   <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-white animate-pulse" />
                </div>
             </div>
             <div className="text-center lg:text-left">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tighter italic uppercase leading-tight">{booking.name}</h2>
                <div className="flex flex-col gap-2 mt-4 lg:mt-6">
                   <div className="flex items-center gap-3 text-slate-400 text-[10px] md:text-xs font-medium bg-white/[0.02] p-2.5 md:p-3 rounded-xl md:rounded-2xl border border-white/5 overflow-hidden">
                      <Mail className="w-3.5 h-3.5 text-accent shrink-0" />
                      <span className="truncate">{booking.email}</span>
                   </div>
                   {booking.phone && (
                      <div className="flex items-center gap-3 text-slate-400 text-[10px] md:text-xs font-medium bg-white/[0.02] p-2.5 md:p-3 rounded-xl md:rounded-2xl border border-white/5">
                         <Phone className="w-3.5 h-3.5 text-accent shrink-0" />
                         {booking.phone}
                      </div>
                   )}
                </div>
             </div>
           </div>

           <div className="space-y-6 pt-6 border-t border-white/5 text-accent">
              <div className="space-y-4">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 flex items-center gap-2">
                    <History className="w-3 h-3" /> Audit Meta
                 </h3>
                 <div className="p-5 rounded-3xl bg-accent/[0.03] border border-accent/10 space-y-3">
                    <p className="text-[10px] font-black tracking-widest text-accent uppercase">{booking.serviceTitle || booking.service?.replace("-", " ")}</p>
                    <div className="flex flex-col gap-2 text-white text-[11px] font-bold">
                       <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-slate-500" /> {booking.preferredDate}</div>
                       <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-slate-500" /> {booking.preferredTime}</div>
                       {booking.sourcePage && (
                         <div className="flex items-center gap-2"><Info className="w-3.5 h-3.5 text-slate-500" /> {booking.sourcePage}</div>
                       )}
                    </div>
                 </div>
              </div>

              {booking.message && (
                 <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">Client Message</h3>
                    <p className="relative text-sm text-slate-400 leading-relaxed bg-white/[0.02] p-6 rounded-2xl border border-white/5 italic font-medium">
                        &ldquo;{booking.message}&rdquo;
                    </p>
                 </div>
              )}
           </div>
        </div>

        {/* Right Content: Operations & Orchestration */}
        <div className="flex-1 p-8 lg:p-12 space-y-10 overflow-y-auto bg-gradient-to-br from-white/[0.01] to-transparent">
           <div className="hidden lg:flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusDisplay(booking.status).bg} ${getStatusDisplay(booking.status).color} ${getStatusDisplay(booking.status).border} shadow-2xl`}>
                   {getStatusDisplay(booking.status).label}
                 </span>
                 {isFetchingLive && <Loader2 className="w-3 h-3 text-accent animate-spin" />}
              </div>
              <button 
                onClick={onClose} 
                className="group flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
           </div>

           <div className="grid grid-cols-1 gap-12">
              {/* CONFIGURATION PANEL */}
              <div className="space-y-8">
                 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                       <LayoutIcon icon={Zap} color="text-accent" />
                       <h3 className="text-lg md:text-xl font-black italic uppercase tracking-tighter text-white">Administration Logic</h3>
                    </div>
                    {!isFinalized && (
                      <button 
                        onClick={handleUpdateDetails}
                        disabled={updateMutation.isPending}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-accent text-black rounded-xl md:rounded-2xl hover:bg-accent/80 transition-all font-black uppercase text-[10px] tracking-widest shadow-lg shadow-accent/20"
                      >
                        {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Sync Changes</>}
                      </button>
                    )}
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                       <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Video Link Integration</label>
                       <input 
                         type="text" 
                         disabled={isFinalized}
                         className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-3xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:opacity-50 transition-all"
                         placeholder="Authorized Meeting URL"
                         value={editData.meetingLink}
                         onChange={(e) => setEditData({...editData, meetingLink: e.target.value})}
                       />
                    </div>
                    <div className="space-y-3">
                       <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Internal Operational Note</label>
                       <input 
                         type="text" 
                         disabled={isFinalized}
                         className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-3xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:opacity-50 transition-all"
                         placeholder="Private administrative info..."
                         value={editData.adminNote}
                         onChange={(e) => setEditData({...editData, adminNote: e.target.value})}
                       />
                    </div>
                 </div>
              </div>

              {/* PIPELINE AUTHORIZATION - DISABLED WHEN FINALIZED */}
              <div className="pt-10 border-t border-white/5 space-y-8">
                 <div className="flex items-center gap-4">
                    <LayoutIcon icon={ShieldCheck} color="text-indigo-400" />
                    <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">Pipeline Directives</h3>
                 </div>

                 {isFinalized ? (
                    <div className={`p-6 md:p-8 rounded-2xl md:rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 group border ${
                      booking.status === 'rejected' 
                        ? 'bg-red-500/10 border-red-500/20' 
                        : booking.status === 'completed'
                          ? 'bg-emerald-500/10 border-emerald-500/20'
                          : 'bg-white/5 border-white/10'
                    }`}>
                       <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                          <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shrink-0 ${
                            booking.status === 'rejected' 
                              ? 'bg-red-500 shadow-red-500/20' 
                              : 'bg-emerald-500 shadow-emerald-500/20'
                          }`}>
                             {booking.status === 'rejected' ? <AlertCircle className="w-6 h-6 md:w-7 md:h-7 text-white" /> : <CheckCircle2 className="w-6 h-6 md:w-7 md:h-7 text-black" />}
                          </div>
                          <div>
                             <h4 className={`font-black uppercase tracking-tighter text-base md:text-lg italic ${
                               booking.status === 'rejected' ? 'text-red-500' : 'text-emerald-500'
                             }`}>
                                {booking.status === 'rejected' ? 'Transaction Termination Executed' : 'Transaction Lifecycle Finalized'}
                             </h4>
                             <p className="text-[9px] md:text-[10px] text-slate-500 uppercase tracking-widest mt-1">Status: {booking.status.toUpperCase()} • All operational buttons are currently locked.</p>
                          </div>
                       </div>
                       <Lock className={`hidden md:block w-6 h-6 transition-colors ${
                          booking.status === 'rejected' ? 'text-red-500/40' : 'text-emerald-500/40'
                       }`} />
                    </div>
                 ) : (
                    <div className="flex flex-col sm:flex-row gap-4">
                       {booking.status !== 'confirmed' && (
                          <button 
                            onClick={() => handleStatusTransition('confirmed')}
                            disabled={updateMutation.isPending}
                            className="w-full sm:flex-1 h-16 md:h-20 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-[10px] md:text-xs tracking-widest md:tracking-[0.25em] rounded-2xl md:rounded-3xl transition-all flex items-center justify-center gap-4 shadow-xl shadow-indigo-500/20 active:scale-95 group"
                          >
                            <CalendarCheck className="w-5 h-5 group-hover:scale-110 transition-transform" /> 
                            {updateMutation.isPending ? 'Processing...' : 'Authorize Call'}
                          </button>
                       )}
                       
                       {booking.status === 'confirmed' && (
                          <button 
                            onClick={() => handleStatusTransition('completed')}
                            disabled={updateMutation.isPending}
                            className="w-full sm:flex-1 h-16 md:h-20 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-[10px] md:text-xs tracking-widest md:tracking-[0.25em] rounded-2xl md:rounded-3xl transition-all flex items-center justify-center gap-4 shadow-xl shadow-emerald-500/20 active:scale-95 group"
                          >
                            <Trophy className="w-5 h-5 group-hover:scale-110 transition-transform text-amber-300" /> 
                            {updateMutation.isPending ? 'Finalizing...' : 'Mark as Successful'}
                          </button>
                       )}

                       <button 
                          onClick={() => setShowRejectionInput(!showRejectionInput)}
                          className={`w-full sm:w-auto px-10 h-16 md:h-20 font-black uppercase text-[9px] md:text-[10px] tracking-widest rounded-2xl md:rounded-3xl transition-all active:scale-95 border ${showRejectionInput ? 'bg-red-500 text-white border-red-500' : 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20'}`}
                       >
                          <XCircle className="w-4 h-4 mx-auto mb-1" /> 
                          {showRejectionInput ? 'Close' : 'Decline'}
                       </button>
                    </div>
                 )}

                 <AnimatePresence>
                    {showRejectionInput && !isFinalized && (
                       <motion.div 
                         initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                         className="bg-red-500/[0.03] border border-red-500/10 p-8 rounded-[2.5rem] space-y-5"
                       >
                          <textarea 
                            className="w-full p-6 bg-white/5 border border-red-500/20 rounded-[1.5rem] text-sm focus:outline-none focus:ring-1 focus:ring-red-500/40 text-white min-h-[120px]"
                            placeholder="Rejection justification (Client will receive this via email)..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                          />
                          <button 
                            onClick={() => handleStatusTransition('rejected', { rejectionReason })}
                            className="w-full py-4 bg-red-600 text-white font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-red-500 transition-all"
                          >
                            Confirm Global Decline
                          </button>
                       </motion.div>
                    )}
                 </AnimatePresence>
              </div>

              {/* CORRESPONDENCE SECTION */}
              <div className="pt-10 border-t border-white/5 space-y-6">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <LayoutIcon icon={Send} color="text-slate-400" />
                       <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">Operational Messaging</h3>
                    </div>
                    {!isFinalized && (
                      <button onClick={() => setShowManualEmail(!showManualEmail)} className="text-[9px] font-black uppercase tracking-widest text-accent underline underline-offset-4">
                        {showManualEmail ? 'Hide Dispatcher' : 'Send Custom Update'}
                      </button>
                    )}
                 </div>

                 <AnimatePresence>
                    {showManualEmail && !isFinalized && (
                       <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] space-y-6">
                          <textarea 
                            className="w-full p-6 bg-white/5 border border-white/10 rounded-[1.5rem] text-sm min-h-[140px] focus:outline-none"
                            placeholder="Drafting professional transmission..."
                            value={customMessage}
                            onChange={(e) => setCustomMessage(e.target.value)}
                          />
                          <button onClick={handleManualEmail} className="w-full py-4 bg-white text-black font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-accent transition-all flex items-center justify-center gap-4">
                            <Send className="w-5 h-5" /> Dispatch Transmit
                          </button>
                       </motion.div>
                    )}
                 </AnimatePresence>
              </div>
           </div>
        </div>
      </motion.div>
    </div>
  );
}

function LayoutIcon({ icon: Icon, color }) {
  return (
    <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 ${color}`}>
       <Icon className="w-5 h-5" />
    </div>
  );
}

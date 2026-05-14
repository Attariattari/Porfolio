"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Key,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ArrowRight,
  Shield,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import EditorialBackground from "@/components/ui/EditorialBackground";

// Premium Background Images
const LOGIN_IMAGE = "/admin-auth-bg.png";
const SIGNUP_IMAGE = "/admin-signup-bg.png";

export default function AuthContainer({ defaultView = "login" }) {
  const [view, setView] = useState(defaultView); // login, setup, reset, verify, pending, success, denied, reverify
  const [email, setEmail] = useState("");
  const [passkey, setPasskey] = useState("");
  const [code, setCode] = useState("");
  const [showPasskey, setShowPasskey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newPasskey, setNewPasskey] = useState("");
  const [isDesktop, setIsDesktop] = useState(false);
  const router = useRouter();

  const isAltMode = view !== "login";

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  useEffect(() => {
    if (view !== "pending" || !email) return;
    const eventSource = new EventSource("/api/admin/events");
    eventSource.addEventListener("user", (e) => {
      const data = JSON.parse(e.data);
      if (data.email.toLowerCase() === email.toLowerCase()) {
        if (data.status === "approved") {
          toast.success("Access Approved. Welcome back.");
          playSuccessSound();
          eventSource.close();
          setView("login");
        } else if (data.status === "denied") {
          toast.error("Access Denied", { description: "Your request was declined." });
          eventSource.close();
          setView("denied");
        }
      }
    });
    return () => eventSource.close();
  }, [view, email]);

  const playSuccessSound = () => {
    try {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(1046.5, context.currentTime);
      gain.gain.setValueAtTime(0, context.currentTime);
      gain.gain.linearRampToValueAtTime(0.2, context.currentTime + 0.1);
      gain.gain.linearRampToValueAtTime(0, context.currentTime + 0.5);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.5);
    } catch (e) {}
  };

  const handleSendCode = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!email) return setError("Please enter your email.");
    setLoading(true);
    setError("");
    const type = (view === "reset" || view === "reverify") ? "reset" : "setup";
    try {
      const res = await fetch("/api/admin/verify-request", {
        method: "POST",
        body: JSON.stringify({ email, type }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Verification code sent!");
        setView("verify");
      } else {
        setError(data.message || "Request failed. Try again.");
      }
    } catch (err) {
      setError("Connection failed. Check your network.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (code.length < 6) return setError("Enter the 6-digit code.");
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/verify-code", {
        method: "POST",
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.pendingApproval) {
          toast.success("Verified! Waiting for admin approval.");
          setView("pending");
        } else {
          setNewPasskey(data.passkey);
          toast.success("Account setup successful.");
          setView("success");
        }
      } else {
        setError(data.message || "Invalid code.");
      }
    } catch (err) {
      setError("Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ email, passkey }),
      });
      const data = await res.json();
      if (data.success) {
        // ⭐ PROFESSIONAL: Store token in localStorage for client-side expiry checks
        if (data.token) {
          localStorage.setItem("admin_token", data.token);
        }
        toast.success("Identity verified. Welcome to Admin Portal.");
        router.push("/admin/dashboard");
      } else {
        if (data.code === "NOT_FOUND") setView("reverify");
        else setError(data.message || "Wrong email or passkey.");
      }
    } catch (err) {
      setError("Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0f1c] flex flex-col font-sans overflow-x-hidden relative">

      <div className="flex-1 w-full flex relative z-10">
        
        {/* PANEL CONTAINER */}
        <div className="flex w-full min-h-full relative flex-col md:flex-row">
            
            {/* IMAGE AREA - Desktop Only (md and up) */}
            <motion.div 
                initial={false}
                animate={{ 
                    x: isAltMode && isDesktop ? "100%" : "0%",
                    borderLeftWidth: isAltMode && isDesktop ? "1px" : "0px",
                    borderRightWidth: isAltMode && isDesktop ? "0px" : "1px",
                }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="hidden lg:block absolute left-0 w-1/2 h-full bg-black z-20 shadow-2xl overflow-hidden border-white/5"
            >
                <div className="relative w-full h-full group">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={isAltMode ? "signup" : "login"}
                            initial={{ opacity: 0, scale: 1.05 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.02 }}
                            transition={{ duration: 0.8 }}
                            className="absolute inset-0"
                        >
                            <Image 
                                src={isAltMode ? SIGNUP_IMAGE : LOGIN_IMAGE}
                                alt="Muhyo Tech Administrative Control"
                                fill
                                className="object-cover transition-transform duration-[10s] group-hover:scale-110"
                                priority
                            />
                        </motion.div>
                    </AnimatePresence>

                    {/* Minimal Vignette for Text Legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1c]/90 via-transparent to-transparent pointer-events-none" />
                    
                    <div className="absolute inset-x-0 bottom-0 p-12 lg:p-16 gap-8 lg:gap-10 flex flex-col justify-end">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-3 px-5 py-2 glass rounded-full border border-white/10 w-fit backdrop-blur-md"
                        >
                            <div className="relative flex h-2 w-2">
                                <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></div>
                                <div className="relative inline-flex rounded-full h-2 w-2 bg-accent"></div>
                            </div>
                            <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Authority Perimeter</span>
                        </motion.div>

                        <div className="space-y-4">
                            <h2 className="text-4xl lg:text-5xl font-black text-white italic tracking-tighter uppercase leading-[0.9]">
                                {isAltMode ? "Secure Onboarding" : "Administrative Gateway"}<br />
                                <span className="text-accent underline decoration-white/10 underline-offset-[14px]">Muhyo Tech</span>
                            </h2>
                            <p className="text-slate-300 text-sm font-medium tracking-tight max-w-[340px] leading-relaxed opacity-70">
                                {isAltMode 
                                    ? "Initiating security clearance protocol for new administrative node establishment." 
                                    : "Access high-level dashboard functions and manage infrastructure with verified credentials."
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* FORM AREA - Centered on Mobile, Half on Desktop */}
            <motion.div 
                initial={false}
                animate={{ x: isAltMode && isDesktop ? "-100%" : "0%" }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className={`w-full lg:w-1/2 min-h-full flex flex-col items-center justify-center p-6 sm:p-12 md:p-16 lg:p-20 absolute right-0 bg-[#0a0f1c] z-10`}
            >
                {/* EditorialBackground anchored to Form Side */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <EditorialBackground text={view === "login" ? "LOGIN" : "SIGNUP"} />
                </div>
                {/* Form Container with better Tablet/Mobile max-width */}
                <div className="w-full max-w-[440px] space-y-10 lg:space-y-12 relative z-10">
                    
                    {/* Header with Responsive Logo */}
                    <div className="flex items-center gap-4 lg:gap-6">
                        <div className="p-1 rounded-xl bg-gradient-to-tr from-accent/20 to-transparent flex-shrink-0">
                            <div className="w-[40px] h-[40px] lg:w-[50px] lg:h-[50px] relative">
                                <Image src="/logo.png" alt="Muhyo Tech" fill className="rounded-lg shadow-xl object-contain" />
                            </div>
                        </div>
                        <div className="h-6 lg:h-8 w-[1px] bg-white/10" />
                        <div className="overflow-hidden">
                            <h3 className="text-[9px] lg:text-[10px] font-black uppercase text-accent tracking-[0.4em] whitespace-nowrap">Admin Operations Center</h3>
                            <p className="text-[9px] lg:text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mt-1 opacity-70">Infrastructure Control V1</p>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {view === "login" && (
                            <motion.div
                                key="login"
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                className="space-y-8 lg:space-y-12"
                            >
                                <div className="space-y-2 lg:space-y-4">
                                    <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight leading-none uppercase italic">Sign In</h1>
                                    <p className="text-slate-500 text-xs lg:text-sm font-medium">Verify your credentials to proceed.</p>
                                </div>

                                <form onSubmit={handleLogin} className="space-y-6 lg:space-y-10">
                                    <div className="space-y-3">
                                        <label className="text-[9px] lg:text-[10px] font-black uppercase text-accent tracking-widest ml-1 opacity-80">Email Anchor</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-accent w-4 h-4 transition-all" />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="admin@muhyo.tech"
                                                className="w-full bg-white/[0.04] border border-white/10 p-4 lg:p-5 pl-14 rounded-2xl lg:rounded-3xl text-white text-xs lg:text-sm outline-none focus:bg-accent/5 focus:border-accent/30 shadow-2xl transition-all duration-300"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center px-1">
                                            <label className="text-[9px] lg:text-[10px] font-black uppercase text-accent tracking-widest ml-1 opacity-80">Security Passkey</label>
                                            <button type="button" onClick={() => setView("reset")} className="text-[9px] lg:text-[10px] font-bold text-slate-600 hover:text-accent transition-colors">Recover?</button>
                                        </div>
                                        <div className="relative group">
                                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-accent w-4 h-4 transition-all" />
                                            <input
                                                type={showPasskey ? "text" : "password"}
                                                value={passkey}
                                                onChange={(e) => setPasskey(e.target.value)}
                                                placeholder="••••••••••••"
                                                className="w-full bg-white/[0.04] border border-white/10 p-4 lg:p-5 pl-14 pr-14 rounded-2xl lg:rounded-3xl text-white text-xs lg:text-sm outline-none focus:bg-accent/5 focus:border-accent/30 shadow-2xl transition-all duration-300 font-mono"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPasskey(!showPasskey)}
                                                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white"
                                            >
                                                {showPasskey ? <EyeOff className="w-5 h-5 opacity-60" /> : <Eye className="w-5 h-5 opacity-60" />}
                                            </button>
                                        </div>
                                    </div>

                                    {error && (
                                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4">
                                            <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
                                            <p className="text-[10px] lg:text-[11px] font-black text-red-400 uppercase tracking-widest leading-none">{error}</p>
                                        </motion.div>
                                    )}

                                    <div className="space-y-4 lg:space-y-6 pt-2">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full py-4 lg:py-6 bg-accent text-[#030712] rounded-2xl lg:rounded-3xl font-black uppercase text-[10px] lg:text-xs tracking-[0.4em] hover:bg-white transition-all active:scale-95 shadow-2xl shadow-accent/20 flex items-center justify-center gap-3 group relative overflow-hidden"
                                        >
                                            {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (
                                                <>
                                                    Establish Access
                                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                                                </>
                                            )}
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setView("setup")}
                                            className="w-full text-center text-[9px] lg:text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 hover:text-white transition-all py-2"
                                        >
                                            Request Admission Node
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}

                        {(view === "setup" || view === "reset" || view === "reverify" || view === "denied") && (
                            <motion.div
                                key="request"
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                className="space-y-8 lg:space-y-12"
                            >
                                <div className="space-y-2 lg:space-y-4">
                                    <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight leading-none uppercase italic">
                                        {view === "reset" ? "Restore" : view === "denied" ? "Denied" : "Register"}
                                    </h1>
                                    <p className="text-slate-500 text-xs lg:text-sm font-medium pl-1">Starting identity verification sequence.</p>
                                </div>

                                <form onSubmit={handleSendCode} className="space-y-8 lg:space-y-12">
                                    <div className="space-y-3">
                                        <label className="text-[9px] lg:text-[10px] font-black uppercase text-accent tracking-widest ml-1 opacity-80">Registration Node (Email)</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-accent w-4 h-4 transition-all" />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="your@email.com"
                                                className="w-full bg-white/[0.04] border border-white/10 p-4 lg:p-5 pl-14 rounded-2xl lg:rounded-3xl text-white text-xs lg:text-sm outline-none focus:bg-accent/5 focus:border-accent/30 shadow-2xl transition-all duration-300"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4">
                                            <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
                                            <p className="text-[10px] lg:text-[11px] font-black text-red-400 uppercase tracking-widest leading-none">{error}</p>
                                        </div>
                                    )}

                                    <div className="space-y-4 lg:space-y-6 pt-2">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full py-4 lg:py-6 bg-accent text-[#030712] rounded-2xl lg:rounded-3xl font-black uppercase text-[10px] lg:text-xs tracking-[0.4em] hover:bg-white transition-all active:scale-95 shadow-2xl shadow-accent/20"
                                        >
                                            {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Initiate Verification"}
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setView("login")}
                                            className="w-full text-center text-[9px] lg:text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 hover:text-white transition-all py-2"
                                        >
                                            Return to Portal Origin
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}
                        
                        {view === "verify" && (
                            <motion.div key="verify" className="space-y-10 lg:space-y-14">
                                <div className="space-y-4 text-center">
                                    <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight leading-none uppercase italic underline decoration-accent/20 underline-offset-8">Verify</h1>
                                    <p className="text-slate-500 text-[11px] lg:text-sm font-medium">Authentication token sent to: <br /><b className="text-accent">{email}</b></p>
                                </div>
                                <form onSubmit={handleVerify} className="space-y-8 lg:space-y-10 text-center">
                                    <div className="relative group inline-block w-full">
                                        <input
                                            type="text"
                                            maxLength={6}
                                            value={code}
                                            onChange={(e) => setCode(e.target.value)}
                                            placeholder="000000"
                                            className="w-full bg-white/[0.05] border border-white/10 p-6 lg:p-8 rounded-[2rem] text-white font-black text-4xl lg:text-6xl tracking-[0.4em] outline-none focus:border-accent/50 text-center shadow-inner relative z-10"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-5 lg:py-6 bg-emerald-600 text-white rounded-[2rem] font-black uppercase text-[10px] lg:text-xs tracking-[0.3em] hover:bg-emerald-500 transition-all shadow-[0_20px_40px_rgba(16,185,129,0.1)]"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Confirm Node Uplink"}
                                    </button>
                                </form>
                            </motion.div>
                        )}

                        {view === "pending" && (
                            <motion.div key="pending" className="text-center space-y-10 lg:space-y-12">
                                <div className="relative mx-auto w-20 h-20 lg:w-24 lg:h-24">
                                    <div className="absolute inset-0 bg-yellow-500/20 blur-[50px] animate-pulse rounded-full" />
                                    <div className="relative w-full h-full bg-[#030712] border-2 border-yellow-500/20 rounded-3xl flex items-center justify-center shadow-2xl">
                                        <Clock className="w-10 h-10 lg:w-12 lg:h-12 text-yellow-500 animate-pulse" />
                                    </div>
                                </div>
                                <div className="space-y-4 lg:space-y-5">
                                    <h2 className="text-2xl lg:text-3xl font-black text-white uppercase italic tracking-tighter">Authorized Waiting</h2>
                                    <p className="text-slate-500 text-[11px] lg:text-[13px] max-w-[280px] mx-auto leading-relaxed">Node verification complete. Stand by for manual administrative approval.</p>
                                </div>
                                <button onClick={() => setView("login")} className="text-accent text-[9px] lg:text-[11px] font-black uppercase tracking-[0.3em] hover:text-white transition-all py-2">Kill Connection</button>
                            </motion.div>
                        )}

                        {view === "success" && (
                            <motion.div key="success" className="text-center space-y-10 lg:space-y-12">
                                <div className="relative mx-auto w-20 h-20 lg:w-24 lg:h-24">
                                    <div className="absolute inset-0 bg-emerald-500/20 blur-[50px] rounded-full" />
                                    <div className="relative w-full h-full bg-[#030712] border-2 border-emerald-500/20 rounded-3xl flex items-center justify-center shadow-2xl">
                                        <CheckCircle2 className="w-10 h-10 lg:w-12 lg:h-12 text-emerald-500" />
                                    </div>
                                </div>
                                <div className="space-y-6 lg:space-y-8">
                                    <div className="p-8 lg:p-10 bg-white/[0.04] border border-white/10 rounded-[2rem] lg:rounded-[2.5rem] relative group select-all">
                                        <p className="text-[9px] lg:text-[10px] font-black uppercase text-accent tracking-[0.4em] mb-3 opacity-70">Master Root Passkey</p>
                                        <div className="text-3xl lg:text-5xl font-mono font-black text-white italic tracking-[0.2em] transition-all group-hover:scale-105">
                                            {newPasskey}
                                        </div>
                                    </div>
                                    <p className="text-amber-500 font-bold uppercase text-[8px] lg:text-[9px] tracking-[0.2em] leading-normal max-w-[240px] mx-auto bg-amber-500/5 py-3 px-6 rounded-full border border-amber-500/10">DESTROY KEY AFTER RECORDING</p>
                                </div>
                                <button onClick={() => setView("login")} className="w-full py-5 lg:py-6 bg-accent text-[#030712] rounded-[2rem] font-black uppercase text-[10px] lg:text-xs tracking-[0.4em] hover:bg-white transition-all shadow-xl shadow-accent/20">Finalize Entry</button>
                            </motion.div>
                        )}

                    </AnimatePresence>

                    {/* Footer for Mobile (Copyright/Version) */}
                    <div className="pt-8 lg:hidden flex flex-col items-center opacity-30 select-none">
                        <div className="w-8 h-px bg-white/10 mb-4" />
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.6em]">Operations Protocol v1.0</p>
                    </div>
                </div>
            </motion.div>

        </div>
      </div>
    </div>
  );
}

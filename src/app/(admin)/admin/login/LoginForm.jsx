"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  Mail,
  Key,
  CheckCircle2,
  Clock,
  ShieldAlert,
  UserX,
  RefreshCcw,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";

export default function LoginForm() {
  const [view, setView] = useState("login"); // login, setup, verify, pending, success, denied, reverify
  const [email, setEmail] = useState("");
  const [passkey, setPasskey] = useState("");
  const [code, setCode] = useState("");
  const [showPasskey, setShowPasskey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newPasskey, setNewPasskey] = useState("");
  const router = useRouter();

  // Real-time Authority Tracing (SSE)
  useEffect(() => {
    if (view !== "pending" || !email) return;

    const eventSource = new EventSource("/api/admin/events");

    eventSource.addEventListener("user", (e) => {
      const data = JSON.parse(e.data);
      if (data.email.toLowerCase() === email.toLowerCase()) {
        if (data.status === "approved") {
          toast.success("Identity Authorized. Access granted.");
          playSuccessSound();
          eventSource.close();
          setView("login");
        } else if (data.status === "denied") {
          toast.error("Identity Refused", {
            description: "Authorization denied by Super Admin.",
          });
          eventSource.close();
          setView("denied");
        } else if (data.status === "removed") {
          toast.error("Authority Revoked", {
            description: "Access node blacklisted for 24 hours.",
          });
          eventSource.close();
          setError("Access node blacklisted for 24 hours.");
          setView("login");
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
    } catch (e) {
      /* Audio */
    }
  };

  const handleSendCode = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!email) return setError("Digital Signature (Email) is required.");
    setLoading(true);
    setError("");

    try {
      // Step 1: Identify if the user exists for proper routing
      // If we are in 'reverify' view, it might be a new user or a recovery

      const setupRes = await fetch("/api/admin/verify-request", {
        method: "POST",
        body: JSON.stringify({ email, type: "setup" }),
      });
      const data = await setupRes.json();

      if (data.success) {
        toast.info("Verification stream initialized. Check your email.");
        setView("verify");
      } else {
        // If it's blocked or failed
        setError(data.message || "Relay failure.");
      }
    } catch (err) {
      setError("System connection error.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (code.length < 6) return setError("Token sequence required.");
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
          toast.success("Identity captured. Submitting for authorization.");
          setLoading(false);
          setView("pending");
        } else {
          setNewPasskey(data.passkey);
          toast.success("Super Admin Root Established.");
          setView("success");
        }
      } else {
        setError(data.message || "Token mismatch.");
      }
    } catch (err) {
      setError("Verification sequence failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, passkey }),
      });
      const data = await res.json();
      
      console.log("[Login Response]", { status: res.status, success: data.success, data });
      
      if (data.success) {
        // Store token in localStorage for API requests
        if (data.token) {
          localStorage.setItem("token", data.token);
          console.log("[Login] ✅ Token stored in localStorage");
        }
        console.log("[Login] ✅ Login successful, redirecting...");
        toast.success("Identity verified. Accessing Administrative Portal...");
        
        // Redirect after success (longer delay to ensure token is stored)
        setTimeout(() => {
          window.location.href = "/admin/dashboard";
        }, 800);
      } else {
        // Log error details to console for debugging
        console.error("[Login] ❌ Login failed:", { 
          code: data.code, 
          message: data.message,
          email: email
        });
        
        setLoading(false);  // Stop loading to show error
        
        if (data.code === "NOT_FOUND") {
          setError("Email account not found in system. Initialize admission first.");
          setView("reverify");
        } else {
          setError(
            data.message ||
              "Authorization refused. Check credentials and try again.",
          );
        }
      }
    } catch (err) {
      console.error("[Login] ❌ Network error:", err);
      setError("Network connection failure. Please check your internet connection.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#030712] flex items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-blue-500/30">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg z-10"
      >
        <div className="bg-[#0f172a]/80 backdrop-blur-3xl border border-white/5 p-12 rounded-[3rem] shadow-3xl overflow-hidden relative">
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-20 h-20 bg-blue-600/10 border border-blue-500/20 rounded-3xl flex items-center justify-center mb-6 shadow-inner transition-transform hover:scale-110 duration-500">
              {view === "pending" ? (
                <Clock className="w-10 h-10 text-yellow-500 animate-pulse" />
              ) : view === "denied" ? (
                <UserX className="w-10 h-10 text-red-500" />
              ) : view === "reverify" ? (
                <UserPlus className="w-10 h-10 text-emerald-500" />
              ) : (
                <ShieldCheck className="w-10 h-10 text-blue-500" />
              )}
            </div>

            <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white mb-3 text-shadow-glow">
              Admin <span className="text-blue-500">Portal</span>
            </h1>
            <p className="text-slate-400 text-[10px] font-black tracking-[0.2em] px-4 opacity-50 uppercase leading-relaxed">
              {view === "setup"
                ? "Requesting Administrative Admission"
                : view === "verify"
                  ? "Identity Trace Stream Active"
                  : view === "pending"
                    ? "Awaiting Authority Authorization"
                    : view === "success"
                      ? "Super Admin Root Node Established"
                      : view === "denied"
                        ? "Identity Authorization Refused"
                        : view === "reverify"
                          ? "Account Admission Portal Initialized"
                          : "Secure Gateway for Authorized Personnel Only"}
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (
                view === "setup" || view === "denied" || view === "reverify"
              ) {
                handleSendCode(e);
              } else if (view === "verify") {
                handleVerify(e);
              } else if (view === "login") {
                handleLogin(e);
              }
            }}
            noValidate
            className="space-y-6"
          >
            {view === "denied" || view === "reverify" ? (
              <div className="space-y-6">
                <div
                  className={`p-8 border rounded-[2rem] text-center space-y-4 ${view === "denied" ? "bg-red-500/5 border-red-500/10" : "bg-emerald-500/5 border-emerald-500/10"}`}
                >
                  {view === "denied" ? (
                    <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
                  ) : (
                    <UserPlus className="w-12 h-12 text-emerald-500 mx-auto" />
                  )}
                  <div>
                    <p
                      className={`text-[10px] font-black uppercase tracking-[0.3em] mb-2 leading-tight ${view === "denied" ? "text-red-400" : "text-emerald-400"}`}
                    >
                      {view === "denied"
                        ? "Access Node Restricted"
                        : "Account Node Missing"}
                    </p>
                    <p className="text-slate-300 text-sm font-bold tracking-tight leading-relaxed opacity-60">
                      {view === "denied"
                        ? "Your previous identity capture has been reviewed and declined. Restore authority through the re-verification stream."
                        : "This digital signature is not mapped within the Authority Database. Initialize admission to establish a new identity node."}
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.3em] shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 ${view === "denied" ? "bg-blue-600 text-white hover:bg-blue-500" : "bg-emerald-600 text-[#030712] hover:bg-emerald-500 shadow-emerald-600/20"}`}
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <RefreshCcw className="w-4 h-4" />{" "}
                      {view === "denied"
                        ? "Initialize Recovery Stream"
                        : "Initialize Admission"}
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setView("login")}
                  className="w-full text-[9px] font-black uppercase text-slate-700 hover:text-white transition-colors tracking-widest text-center mt-2 italic opacity-50 hover:opacity-100"
                >
                  Back to Portal Gateway
                </button>
              </div>
            ) : view === "setup" || view === "verify" ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-blue-500 tracking-[0.2em] ml-2">
                    Digital Signature (Email)
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 w-5 h-5 transition-colors" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={view === "verify"}
                      placeholder="authority@muhyo.tech"
                      className="w-full bg-[#1e293b]/30 border border-white/5 p-5 pl-14 rounded-2xl text-white font-bold text-sm outline-none focus:border-blue-500/20 backdrop-blur-md disabled:opacity-30 transition-all shadow-inner"
                      required
                    />
                  </div>
                </div>
                {view === "verify" && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-blue-500 tracking-[0.2em] ml-2">
                      Verification Stream Token
                    </label>
                    <div className="relative group">
                      <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 w-5 h-5 transition-colors" />
                      <input
                        type="text"
                        maxLength={6}
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="000000"
                        className="w-full bg-[#1e293b]/30 border border-white/5 p-5 pl-14 rounded-2xl text-white font-black text-lg tracking-[1em] outline-none focus:border-blue-500/20 backdrop-blur-md shadow-inner"
                        required
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : view === "pending" ? (
              <div className="bg-yellow-500/5 border border-yellow-500/10 p-10 rounded-[3rem] text-center space-y-6 relative overflow-hidden group">
                <div className="absolute inset-0 bg-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex justify-center relative">
                  <Clock className="w-16 h-16 text-yellow-500 animate-pulse" />
                </div>
                <div className="relative">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-yellow-600 mb-2">
                    Authority Review In Progress
                  </p>
                  <p className="text-slate-400 text-sm font-bold tracking-tight px-2 leading-relaxed opacity-80 italic">
                    Your identity capture is waiting for manual authorization by
                    a Super Admin Root node.
                  </p>
                </div>
                <div className="h-px w-10 bg-white/5 mx-auto relative" />
                <p className="text-[9px] font-black uppercase tracking-[0.6em] text-slate-700 animate-pulse relative">
                  Trace Connection: Stable
                </p>
                <button
                  type="button"
                  onClick={() => setView("login")}
                  className="text-[9px] font-black uppercase text-slate-800 hover:text-white transition-colors tracking-[0.4em] mt-4 relative"
                >
                  Abort Uplink
                </button>
              </div>
            ) : view === "success" ? (
              <div className="bg-blue-600/5 border border-blue-600/10 p-10 rounded-[3rem] text-center space-y-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600/0 via-blue-600 to-blue-600/0 animate-ping" />
                <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto" />
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase text-blue-800 mb-1 tracking-[0.5em] italic">
                    Access Bypass Token Active
                  </p>
                  <p className="text-5xl font-black italic text-white tracking-[0.2em] py-8 bg-[#1e293b]/40 rounded-[2rem] border border-white/5 select-all shadow-inner">
                    {newPasskey}
                  </p>
                </div>
                <p className="text-[9px] text-yellow-600 font-black uppercase tracking-[0.3em] mt-8 leading-relaxed opacity-70 italic">
                  Security Warning: Master Root revealed. Shred digital
                  signature immediately.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-blue-500 tracking-[0.2em] ml-2">
                    Authority Identifier
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 w-5 h-5 transition-colors" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#1e293b]/30 border border-white/5 p-5 pl-14 rounded-2xl text-white font-bold text-sm outline-none focus:border-blue-500/20 backdrop-blur-md transition-all shadow-inner"
                      placeholder="Identifier Signature"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black uppercase text-blue-500 tracking-[0.2em]">
                      Secure Passkey
                    </label>
                    <button
                      type="button"
                      onClick={() => setView("setup")}
                      className="text-[9px] font-black uppercase text-slate-700 hover:text-blue-400 transition-colors tracking-widest italic"
                    >
                      Recalibrate Access?
                    </button>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 w-5 h-5 transition-colors" />
                    <input
                      type={showPasskey ? "text" : "password"}
                      value={passkey}
                      onChange={(e) => setPasskey(e.target.value)}
                      className="w-full bg-[#1e293b]/30 border border-white/5 p-5 pl-14 rounded-2xl text-white font-bold text-sm outline-none focus:border-blue-500/20 backdrop-blur-md transition-all shadow-inner"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasskey(!showPasskey)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors p-1"
                    >
                      {showPasskey ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="p-5 bg-red-600/10 border border-red-600/10 rounded-2xl flex items-center gap-4"
                >
                  <ShieldAlert className="w-6 h-6 text-red-600 shrink-0" />
                  <p className="text-[10px] font-black text-red-200 uppercase tracking-tight italic opacity-70">
                    {error}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {view !== "denied" && view !== "reverify" && (
              <div className="flex flex-col gap-4 pt-4">
                <button
                  type={
                    view === "success" || view === "pending"
                      ? "button"
                      : "submit"
                  }
                  onClick={(e) => {
                    if (view === "success") {
                      window.location.href = "/admin/dashboard";
                    } else if (view === "pending") {
                      setView("login");
                    }
                  }}
                  disabled={loading}
                  className="group w-full py-5 rounded-[2rem] bg-blue-600 text-[#030712] font-black uppercase text-xs tracking-[0.3em] shadow-[0_20px_50px_rgba(37,99,235,0.2)] hover:bg-blue-500 hover:scale-[1.01] transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : view === "setup" ? (
                    "Initialize Admission"
                  ) : view === "verify" ? (
                    "Confirm Identity Trace"
                  ) : view === "success" ? (
                    "Enter Admin Dashboard"
                  ) : view === "pending" ? (
                    "Back to Security Gateway"
                  ) : (
                    "Authorize Session"
                  )}
                  <div className="w-1.5 h-1.5 bg-white/20 rounded-full animate-ping group-hover:bg-white" />
                </button>

                {view === "login" && (
                  <button
                    type="button"
                    onClick={() => setView("setup")}
                    className="text-[10px] font-black uppercase text-slate-700 hover:text-white transition-colors tracking-widest text-center mt-2 italic opacity-40 hover:opacity-100"
                  >
                    No Identity Node? Request Admission
                  </button>
                )}
              </div>
            )}
          </form>

          <div className="mt-16 pt-8 border-t border-white/5 flex flex-col items-center">
            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-1 h-1 bg-blue-600/20 rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
            <p className="text-[9px] font-black text-slate-800 uppercase tracking-[0.8em] select-none text-shadow-glow">
              Secure.Admin_v1.0
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

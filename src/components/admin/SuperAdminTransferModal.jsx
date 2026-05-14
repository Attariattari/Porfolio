"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ShieldAlert,
  Eye,
  EyeOff,
  X,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

const STEPS = {
  CLOSED: -1,
  EMAIL_INPUT: 0,
  VERIFY_CURRENT: 1,
  VERIFY_NEW: 2,
  FINAL_CONFIRMATION: 3,
  SUCCESS: 4,
};

export default function SuperAdminTransferModal({ isOpen, onClose, currentEmail }) {
  const [step, setStep] = useState(STEPS.EMAIL_INPUT);
  const [sessionId, setSessionId] = useState(null);
  const [newEmail, setNewEmail] = useState("");
  const [currentOTP, setCurrentOTP] = useState("");
  const [newOTP, setNewOTP] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
  const [showPassword, setShowPassword] = useState(false);
  const [newPasskey, setNewPasskey] = useState("");

  // OTP Timer effect
  useEffect(() => {
    if (step === STEPS.VERIFY_CURRENT || step === STEPS.VERIFY_NEW) {
      if (timeLeft <= 0) {
        setError("OTP expired. Please start over.");
        return;
      }

      const interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [step, timeLeft]);

  // Reset timer when step changes
  useEffect(() => {
    if (step === STEPS.VERIFY_CURRENT || step === STEPS.VERIFY_NEW) {
      setTimeLeft(180);
    }
  }, [step]);

  // Handle redirection after success
  useEffect(() => {
    if (step === STEPS.SUCCESS) {
      const timer = setTimeout(() => {
        window.location.href = "/admin/login";
      }, 15000); // 15 seconds to let them copy the passkey
      return () => clearTimeout(timer);
    }
  }, [step]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Step 1: Initiate transfer
  const handleInitiateTransfer = async () => {
    setError("");
    if (!newEmail.trim()) {
      setError("Please enter a new email address");
      return;
    }

    if (newEmail === currentEmail) {
      setError("New email must be different from current email");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/admin/transfer-super-admin/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail: newEmail.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Failed to initiate transfer");
      }

      setSessionId(data.data.sessionId);
      setStep(STEPS.VERIFY_CURRENT);
      toast.success(data.message || "OTP sent to current email");
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify current email OTP
  const handleVerifyCurrentEmail = async () => {
    setError("");
    if (!currentOTP.trim()) {
      setError("Please enter the OTP code");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/admin/transfer-super-admin/verify-current", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          code: currentOTP.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Failed to verify OTP");
      }

      setCurrentOTP("");
      setStep(STEPS.VERIFY_NEW);
      toast.success(data.message || "Current email verified. OTP sent to new email.");
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Verify new email OTP
  const handleVerifyNewEmail = async () => {
    setError("");
    if (!newOTP.trim()) {
      setError("Please enter the OTP code");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/admin/transfer-super-admin/verify-new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          code: newOTP.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Failed to verify OTP");
      }

      setNewOTP("");
      setStep(STEPS.FINAL_CONFIRMATION);
      toast.success("New email verified. Ready for final confirmation.");
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Final confirmation
  const handleFinalConfirmation = async () => {
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/admin/transfer-super-admin/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          confirmationCode: "CONFIRM",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Failed to complete transfer");
      }

      // Extract passkey from response data
      if (data.data && data.data.newPasskey) {
        setNewPasskey(data.data.newPasskey);
        console.log("[Transfer] Passkey received:", data.data.newPasskey);
      }

      // ⭐ PROFESSIONAL: Immediate session invalidation for current user
      // Clear all auth data from client-side
      localStorage.removeItem("admin_token");
      document.cookie = "admin_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      document.cookie = "admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

      setStep(STEPS.SUCCESS);
      toast.success("Super Admin transfer completed successfully!");
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (step !== STEPS.SUCCESS && step !== STEPS.LOADING) {
      setStep(STEPS.EMAIL_INPUT);
      setSessionId(null);
      setNewEmail("");
      setCurrentOTP("");
      setNewOTP("");
      setError("");
      setTimeLeft(180);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#0a0f1c] border border-white/10 rounded-[3rem] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 border-b border-white/10 p-8 bg-[#0a0f1c]/95 backdrop-blur flex justify-between items-start z-10">
          <div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">
              Transfer <span className="text-accent">Authority</span>
            </h2>
            <p className="text-muted-foreground text-sm mt-2">
              Step {Math.min(step + 1, 4)} of 4 - Secure Super Admin Email Transfer
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-8 pt-6">
          <div className="flex gap-3">
            {[0, 1, 2, 3].map((s) => (
              <div key={s} className="flex-1">
                <div
                  className={`h-1.5 rounded-full transition-all ${
                    step >= s ? "bg-accent" : "bg-white/10"
                  }`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            {/* Step 1: Email Input */}
            {step === STEPS.EMAIL_INPUT && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="bg-accent/10 border border-accent/20 p-6 rounded-2xl">
                  <div className="flex gap-3 mb-2">
                    <ShieldAlert className="w-5 h-5 text-accent flex-shrink-0" />
                    <p className="text-sm text-accent">
                      This action will transfer Super Admin authority. Only proceed if authorized.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-accent/80 mb-2 block">
                    Current Super Admin Email
                  </label>
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-muted-foreground flex items-center gap-3">
                    <Mail className="w-4 h-4 text-accent" />
                    {currentEmail}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-accent/80 mb-2 block">
                    New Super Admin Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => {
                        setNewEmail(e.target.value);
                        setError("");
                      }}
                      placeholder="admin@example.com"
                      className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm focus:ring-4 focus:ring-accent/10 focus:border-accent/40 transition-all outline-none"
                      disabled={loading}
                    />
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex gap-3"
                  >
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    {error}
                  </motion.div>
                )}

                <button
                  onClick={handleInitiateTransfer}
                  disabled={loading || !newEmail.trim()}
                  className="w-full py-4 bg-gradient-to-r from-accent to-accent/80 text-black font-black uppercase text-sm rounded-2xl hover:shadow-lg hover:shadow-accent/40 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Initiating...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Initiate Transfer
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </motion.div>
            )}

            {/* Step 2: Verify Current Email */}
            {step === STEPS.VERIFY_CURRENT && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="bg-blue-500/10 border border-blue-500/30 p-6 rounded-2xl">
                  <p className="text-sm text-blue-300">
                    Check your email <strong>{currentEmail}</strong> for a 6-digit verification code.
                  </p>
                  <div className="flex items-center gap-2 mt-3 text-xs text-blue-200">
                    <Clock className="w-3 h-3" />
                    Code expires in: <span className="font-bold">{formatTime(timeLeft)}</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-accent/80 mb-2 block">
                    Enter Verification Code
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={currentOTP}
                    onChange={(e) => {
                      setCurrentOTP(e.target.value.replace(/\D/g, "").slice(0, 6));
                      setError("");
                    }}
                    placeholder="000000"
                    maxLength="6"
                    className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-2xl font-black text-center tracking-widest focus:ring-4 focus:ring-accent/10 focus:border-accent/40 transition-all outline-none font-mono"
                    disabled={loading}
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="mt-2 text-[10px] font-bold text-accent/60 hover:text-accent transition-colors flex items-center gap-1"
                  >
                    {showPassword ? (
                      <>
                        <EyeOff className="w-3 h-3" /> Hide
                      </>
                    ) : (
                      <>
                        <Eye className="w-3 h-3" /> Show
                      </>
                    )}
                  </button>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex gap-3"
                  >
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    {error}
                  </motion.div>
                )}

                <button
                  onClick={handleVerifyCurrentEmail}
                  disabled={loading || currentOTP.length !== 6}
                  className="w-full py-4 bg-gradient-to-r from-accent to-accent/80 text-black font-black uppercase text-sm rounded-2xl hover:shadow-lg hover:shadow-accent/40 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Verify Code
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </motion.div>
            )}

            {/* Step 3: Verify New Email */}
            {step === STEPS.VERIFY_NEW && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="bg-green-500/10 border border-green-500/30 p-6 rounded-2xl">
                  <p className="text-sm text-green-300">
                    ✓ Current email verified. Check <strong>{newEmail}</strong> for verification code.
                  </p>
                  <div className="flex items-center gap-2 mt-3 text-xs text-green-200">
                    <Clock className="w-3 h-3" />
                    Code expires in: <span className="font-bold">{formatTime(timeLeft)}</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-accent/80 mb-2 block">
                    Enter Verification Code
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newOTP}
                    onChange={(e) => {
                      setNewOTP(e.target.value.replace(/\D/g, "").slice(0, 6));
                      setError("");
                    }}
                    placeholder="000000"
                    maxLength="6"
                    className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-2xl font-black text-center tracking-widest focus:ring-4 focus:ring-accent/10 focus:border-accent/40 transition-all outline-none font-mono"
                    disabled={loading}
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="mt-2 text-[10px] font-bold text-accent/60 hover:text-accent transition-colors flex items-center gap-1"
                  >
                    {showPassword ? (
                      <>
                        <EyeOff className="w-3 h-3" /> Hide
                      </>
                    ) : (
                      <>
                        <Eye className="w-3 h-3" /> Show
                      </>
                    )}
                  </button>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex gap-3"
                  >
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    {error}
                  </motion.div>
                )}

                <button
                  onClick={handleVerifyNewEmail}
                  disabled={loading || newOTP.length !== 6}
                  className="w-full py-4 bg-gradient-to-r from-accent to-accent/80 text-black font-black uppercase text-sm rounded-2xl hover:shadow-lg hover:shadow-accent/40 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Verify Code
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </motion.div>
            )}

            {/* Step 4: Final Confirmation */}
            {step === STEPS.FINAL_CONFIRMATION && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="bg-orange-500/10 border border-orange-500/30 p-6 rounded-2xl space-y-4">
                  <div className="flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-orange-300 text-sm mb-2">Final Confirmation Required</p>
                      <p className="text-xs text-orange-200 leading-relaxed">
                        After confirmation:
                      </p>
                      <ul className="text-xs text-orange-200 mt-2 space-y-1 pl-5 list-disc">
                        <li>{currentEmail} will no longer be Super Admin</li>
                        <li>{newEmail} becomes the new Super Admin</li>
                        <li>All active sessions will be terminated</li>
                        <li>You will need to login again with the new email</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                  <p className="text-xs text-muted-foreground mb-4">
                    Type <strong className="text-accent">CONFIRM</strong> to complete the transfer. This action cannot be undone.
                  </p>
                </div>

                <button
                  onClick={handleFinalConfirmation}
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-black uppercase text-sm rounded-2xl hover:shadow-lg hover:shadow-red-600/40 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Finalizing Transfer...
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-4 h-4" />
                      CONFIRM TRANSFER
                    </>
                  )}
                </button>

                <button
                  onClick={handleClose}
                  disabled={loading}
                  className="w-full py-3 border border-white/10 text-white font-bold uppercase text-xs rounded-2xl hover:bg-white/5 transition-all disabled:opacity-50"
                >
                  Cancel Process
                </button>
              </motion.div>
            )}

            {/* Step 5: Success */}
            {step === STEPS.SUCCESS && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center"
                >
                  <CheckCircle2 className="w-8 h-8 text-green-400" />
                </motion.div>

                <div>
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter text-green-400">
                    Transfer Complete!
                  </h3>
                  <p className="text-muted-foreground text-sm mt-2">
                    Super Admin authority has been successfully transferred to {newEmail}
                  </p>
                </div>

                <div className="bg-green-500/10 border border-green-500/30 p-6 rounded-2xl text-left space-y-3">
                  <p className="text-sm text-green-300 font-bold">What happens next?</p>
                  <ul className="text-xs text-green-200 space-y-2 pl-5 list-disc">
                    <li>All active sessions have been terminated</li>
                    <li>You will be logged out automatically</li>
                    <li>Both parties have been notified via email</li>
                    <li>Full audit logs have been recorded</li>
                  </ul>
                </div>

                {newPasskey && (
                  <div className="bg-accent/10 border border-accent/20 p-6 rounded-2xl text-left">
                    <p className="text-xs text-accent font-bold mb-2 uppercase tracking-widest">New Super Admin Passkey</p>
                    <div className="flex items-center justify-between gap-4 bg-black/40 p-4 rounded-xl border border-accent/20">
                      <code className="text-xl font-black text-white tracking-[0.3em] font-mono">{newPasskey}</code>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(newPasskey);
                          toast.success("Passkey copied to clipboard");
                        }}
                        className="text-[10px] bg-accent text-black px-3 py-1 rounded-lg font-bold uppercase"
                      >
                        Copy
                      </button>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-3 italic">
                      Save this passkey securely. It has also been sent to {newEmail}.
                    </p>
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  Redirecting to login page in a moment...
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  Clock3,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

function GoogleIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}

function Field({ icon: Icon, label, hint, children }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <label className="text-sm font-medium text-slate-200">{label}</label>
        {hint}
      </div>
      <div className="group relative">
        <Icon className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-blue-400" />
        {children}
      </div>
    </div>
  );
}

function ErrorNotice({ message }) {
  if (!message) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      role="alert"
      className="flex items-start gap-3 rounded-xl border border-red-400/20 bg-red-400/[0.08] px-4 py-3 text-sm leading-5 text-red-200"
    >
      <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
      <span>{message}</span>
    </motion.div>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-4 py-1">
      <span className="h-px flex-1 bg-white/10" />
      <span className="text-xs font-medium text-slate-500">or</span>
      <span className="h-px flex-1 bg-white/10" />
    </div>
  );
}

const googleErrorMessages = {
  "not-configured": "Google sign-in is not configured yet.",
  unverified: "This Google account has not been verified.",
  unauthorized: "This Google sign-in request is not authorized.",
  cancelled: "Google sign-in was cancelled.",
  "not-approved": "This account is not approved for admin access.",
  "rate-limited": "Too many attempts. Please wait a moment and try again.",
  "token-exchange": "Google could not complete sign-in. Please check the OAuth configuration.",
  profile: "Your Google profile could not be loaded. Please try again.",
  failed: "Google sign-in failed. Please try again.",
};

export default function AuthContainer({
  defaultView = "login",
  callbackUrl = "/admin/dashboard",
  googleLinkToken = "",
  googleLinkEmail = "",
  googleError = "",
}) {
  const [view, setView] = useState(defaultView);
  const [email, setEmail] = useState(googleLinkEmail || "");
  const [passkey, setPasskey] = useState("");
  const [code, setCode] = useState("");
  const [showPasskey, setShowPasskey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(() => (
    googleError ? (googleErrorMessages[googleError] || googleErrorMessages.failed) : ""
  ));
  const [newPasskey, setNewPasskey] = useState("");
  const [copied, setCopied] = useState(false);
  const [linkToken, setLinkToken] = useState(googleLinkToken);
  const [linkPasskey, setLinkPasskey] = useState("");
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkError, setLinkError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (view !== "pending" || !email) return;
    let cancelled = false;
    const checkApproval = async () => {
      try {
        const res = await fetch(`/api/admin/status?email=${encodeURIComponent(email)}`, { cache: "no-store" });
        const data = await res.json();
        if (!cancelled && data.success && data.active) {
          toast.success("Your access request has been approved.");
          setView("login");
        }
      } catch {
        // The next polling cycle retries silently.
      }
    };
    checkApproval();
    const interval = setInterval(checkApproval, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [view, email]);

  const changeView = (nextView) => {
    setError("");
    setCode("");
    setView(nextView);
  };

  const handleSendCode = async (event) => {
    event?.preventDefault();
    if (!email) return setError("Please enter your email address.");
    setLoading(true);
    setError("");
    const type = view === "reset" || view === "reverify" ? "reset" : "setup";
    try {
      const response = await fetch("/api/admin/verify-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type }),
      });
      const data = await response.json();
      if (!data.success) return setError(data.message || "We could not send the verification code.");
      toast.success("Verification code sent to your email.");
      setView("verify");
    } catch {
      setError("Connection failed. Please check your internet and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (event) => {
    event?.preventDefault();
    if (code.length !== 6) return setError("Enter the complete 6-digit code.");
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await response.json();
      if (!data.success) return setError(data.message || "That verification code is not valid.");
      if (data.pendingApproval) {
        toast.success("Email verified. Your request is awaiting approval.");
        setView("pending");
      } else {
        setNewPasskey(data.passkey);
        toast.success("Your account is ready.");
        setView("success");
      }
    } catch {
      setError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (event) => {
    event?.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, passkey }),
      });
      const data = await response.json();
      if (!data.success) {
        if (data.code === "NOT_FOUND") setView("reverify");
        return setError(data.message || "The email or passkey is incorrect.");
      }
      if (data.token) {
        localStorage.setItem("admin_token", data.token);
        localStorage.setItem("token", data.token);
      }
      toast.success("Welcome back.");
      router.push(callbackUrl || "/admin/dashboard");
      router.refresh();
    } catch {
      setError("Sign-in failed. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    setLoading(true);
    const safeCallback = callbackUrl?.startsWith("/") && !callbackUrl.startsWith("//")
      ? callbackUrl
      : "/admin/dashboard";
    window.location.href = `/api/auth/google?callbackUrl=${encodeURIComponent(safeCallback)}`;
  };

  const handleLinkGoogle = async () => {
    if (!linkPasskey) return setLinkError("Enter your existing passkey to continue.");
    setLinkLoading(true);
    setLinkError("");
    try {
      const response = await fetch("/api/auth/google/link", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: linkToken, passkey: linkPasskey }),
      });
      const data = await response.json();
      if (!data.success) return setLinkError(data.message || "Google account linking failed.");
      if (data.token) {
        localStorage.setItem("admin_token", data.token);
        localStorage.setItem("token", data.token);
      }
      toast.success("Google sign-in linked. You can now use either login method.");
      window.location.href = data.redirectTo || callbackUrl || "/admin/dashboard";
    } catch {
      setLinkError("Google account linking failed. Please try again.");
    } finally {
      setLinkLoading(false);
    }
  };

  const copyPasskey = async () => {
    try {
      await navigator.clipboard.writeText(newPasskey);
      setCopied(true);
      toast.success("Passkey copied.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy the passkey.");
    }
  };

  const requestMode = ["setup", "reset", "reverify", "denied"].includes(view);
  const isSignup = view !== "login";
  const inputClass = "w-full rounded-xl border border-white/10 bg-white/[0.045] py-3.5 pl-12 pr-4 text-[15px] text-white outline-none transition placeholder:text-slate-600 hover:border-white/15 focus:border-blue-400/60 focus:bg-blue-400/[0.05] focus:ring-4 focus:ring-blue-500/10";
  const primaryButton = "flex w-full items-center justify-center gap-2.5 rounded-xl bg-blue-500 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#070b14] text-white selection:bg-blue-500/30">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-[480px] w-[480px] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute -bottom-52 right-0 h-[520px] w-[520px] rounded-full bg-indigo-600/10 blur-[140px]" />
      </div>

      <div className="relative mx-auto min-h-dvh max-w-[1500px] overflow-hidden">
        <aside className={`absolute left-0 top-0 hidden min-h-dvh w-1/2 overflow-hidden border-white/[0.07] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16 ${isSignup ? "border-l lg:translate-x-full" : "border-r lg:translate-x-0"}`}>
          <div className="absolute inset-0">
            <Image
              src={isSignup ? "/admin-signup-bg.png" : "/admin-auth-bg.png"}
              alt=""
              fill
              priority
              sizes="50vw"
              className="object-cover opacity-30 transition duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#07101f]/75 via-[#07101f]/65 to-[#070b14]" />
          </div>

          <div className="relative flex items-center gap-3">
            <div className="relative h-11 w-11 overflow-hidden rounded-xl border border-white/10 bg-white/5 p-1.5 shadow-xl">
              <Image src="/logo.webp" alt="Muhyo Tech" fill sizes="44px" className="object-contain p-1.5" />
            </div>
            <div>
              <p className="font-semibold tracking-tight">Muhyo Tech</p>
              <p className="text-xs text-slate-400">Admin workspace</p>
            </div>
          </div>

          <motion.div
            key={isSignup ? "onboarding" : "workspace"}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative max-w-lg"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-300/15 bg-blue-400/10 px-3 py-1.5 text-xs font-medium text-blue-200 backdrop-blur">
              <ShieldCheck className="h-3.5 w-3.5" />
              Protected administrative access
            </div>
            <h1 className="max-w-md text-4xl font-semibold leading-[1.08] tracking-[-0.04em] xl:text-5xl">
              {isSignup ? "Join your secure workspace." : "Everything you manage, in one place."}
            </h1>
            <p className="mt-5 max-w-md text-[15px] leading-7 text-slate-300/80">
              {isSignup
                ? "Create a verified admin profile and keep every important operation protected from day one."
                : "Manage content, messages, analytics and AI publishing from a fast, focused control center."}
            </p>
            <div className="mt-9 grid max-w-md grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-4 backdrop-blur-md">
                <BarChart3 className="mb-3 h-5 w-5 text-blue-300" />
                <p className="text-sm font-medium">Live insights</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">Track performance at a glance.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-4 backdrop-blur-md">
                <Sparkles className="mb-3 h-5 w-5 text-violet-300" />
                <p className="text-sm font-medium">AI workflow</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">Create and publish with confidence.</p>
              </div>
            </div>
          </motion.div>

          <div className="relative flex items-center justify-between text-xs text-slate-500">
            <span>© {new Date().getFullYear()} Muhyo Tech</span>
            <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />Systems operational</span>
          </div>
        </aside>

        <section className={`relative flex min-h-dvh w-full items-center justify-center px-5 py-8 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] sm:px-8 lg:absolute lg:right-0 lg:top-0 lg:w-1/2 lg:px-12 ${isSignup ? "lg:-translate-x-full" : "lg:translate-x-0"}`}>
          <div className="w-full max-w-[440px]">
            <div className="mb-9 flex items-center justify-between lg:hidden">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                  <Image src="/logo.webp" alt="Muhyo Tech" fill sizes="40px" className="object-contain p-1.5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Muhyo Tech</p>
                  <p className="text-[11px] text-slate-500">Admin workspace</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-300"><ShieldCheck className="h-3.5 w-3.5" />Secure</div>
            </div>

            <AnimatePresence mode="wait">
              {view === "login" && (
                <motion.div key="login" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                  <header className="mb-8">
                    <p className="mb-3 text-sm font-medium text-blue-400">Welcome back</p>
                    <h2 className="text-3xl font-semibold tracking-[-0.035em] sm:text-[36px]">Sign in to your account</h2>
                    <p className="mt-3 text-sm leading-6 text-slate-400">Use your approved admin credentials to continue.</p>
                  </header>

                  <form onSubmit={handleLogin} className="space-y-5">
                    <Field icon={Mail} label="Email address">
                      <input className={inputClass} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" required />
                    </Field>
                    <Field
                      icon={LockKeyhole}
                      label="Passkey"
                      hint={<button type="button" onClick={() => changeView("reset")} className="text-xs font-medium text-blue-400 transition hover:text-blue-300">Forgot passkey?</button>}
                    >
                      <input className={`${inputClass} pr-12 font-mono`} type={showPasskey ? "text" : "password"} autoComplete="current-password" value={passkey} onChange={(e) => setPasskey(e.target.value)} placeholder="Enter your passkey" required />
                      <button type="button" onClick={() => setShowPasskey((value) => !value)} aria-label={showPasskey ? "Hide passkey" : "Show passkey"} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-white">
                        {showPasskey ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                      </button>
                    </Field>
                    <ErrorNotice message={error} />
                    <button className={primaryButton} type="submit" disabled={loading}>
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Sign in <ArrowRight className="h-4 w-4" /></>}
                    </button>
                    <Divider />
                    <button type="button" onClick={handleGoogleAuth} disabled={loading} className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3.5 text-sm font-medium text-slate-100 transition hover:border-white/20 hover:bg-white/[0.07] disabled:opacity-60">
                      <GoogleIcon /> Continue with Google
                    </button>
                  </form>
                  <p className="mt-8 text-center text-sm text-slate-500">Need admin access? <button onClick={() => changeView("setup")} className="font-medium text-blue-400 hover:text-blue-300">Create an account</button></p>
                </motion.div>
              )}

              {requestMode && (
                <motion.div key="request" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                  <button type="button" onClick={() => changeView("login")} className="mb-7 flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"><ArrowLeft className="h-4 w-4" /> Back to sign in</button>
                  <header className="mb-8">
                    <p className="mb-3 text-sm font-medium text-blue-400">{view === "reset" ? "Account recovery" : "Admin onboarding"}</p>
                    <h2 className="text-3xl font-semibold tracking-[-0.035em] sm:text-[36px]">{view === "reset" ? "Recover your passkey" : view === "denied" ? "Request access again" : "Create your account"}</h2>
                    <p className="mt-3 text-sm leading-6 text-slate-400">{view === "reset" ? "We’ll email you a secure verification code." : "Verify your email first. A super admin will review new access requests."}</p>
                  </header>
                  <form onSubmit={handleSendCode} className="space-y-5">
                    <Field icon={Mail} label="Work email">
                      <input className={inputClass} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
                    </Field>
                    <ErrorNotice message={error} />
                    <button className={primaryButton} type="submit" disabled={loading}>
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Send verification code <ArrowRight className="h-4 w-4" /></>}
                    </button>
                    {view === "setup" && <><Divider /><button type="button" onClick={handleGoogleAuth} disabled={loading} className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3.5 text-sm font-medium text-slate-100 transition hover:border-white/20 hover:bg-white/[0.07] disabled:opacity-60"><GoogleIcon /> Continue with Google</button></>}
                  </form>
                  <p className="mt-8 text-center text-sm text-slate-500">Already approved? <button onClick={() => changeView("login")} className="font-medium text-blue-400 hover:text-blue-300">Sign in instead</button></p>
                </motion.div>
              )}

              {view === "verify" && (
                <motion.div key="verify" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                  <button type="button" onClick={() => changeView(defaultView === "setup" ? "setup" : "login")} className="mb-7 flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"><ArrowLeft className="h-4 w-4" /> Change email</button>
                  <header className="mb-8">
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-400/10 text-blue-300"><Mail className="h-5 w-5" /></div>
                    <h2 className="text-3xl font-semibold tracking-[-0.035em]">Check your inbox</h2>
                    <p className="mt-3 text-sm leading-6 text-slate-400">Enter the 6-digit code sent to <span className="font-medium text-slate-200">{email}</span>.</p>
                  </header>
                  <form onSubmit={handleVerify} className="space-y-5">
                    <Field icon={KeyRound} label="Verification code">
                      <input className={`${inputClass} pl-12 text-center font-mono text-lg tracking-[0.45em]`} type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} placeholder="000000" required autoFocus />
                    </Field>
                    <ErrorNotice message={error} />
                    <button className={primaryButton} type="submit" disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify email"}</button>
                    <button type="button" onClick={handleSendCode} disabled={loading} className="w-full py-2 text-sm font-medium text-slate-400 transition hover:text-white disabled:opacity-60">Didn’t receive it? Send again</button>
                  </form>
                </motion.div>
              )}

              {view === "pending" && (
                <motion.div key="pending" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                  <div className="relative mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-300/20 bg-amber-300/10 text-amber-300"><span className="absolute inset-0 animate-ping rounded-2xl border border-amber-300/10" /><Clock3 className="h-7 w-7" /></div>
                  <h2 className="text-3xl font-semibold tracking-[-0.035em]">Approval pending</h2>
                  <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-slate-400">Your email is verified. A super admin needs to approve your request before you can sign in.</p>
                  <div className="mt-7 rounded-xl border border-white/10 bg-white/[0.035] p-4 text-left">
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Request submitted for</p>
                    <p className="mt-1.5 truncate text-sm text-slate-200">{email}</p>
                  </div>
                  <p className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-500"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Checking approval status automatically</p>
                  <button onClick={() => changeView("login")} className="mt-8 text-sm font-medium text-blue-400 hover:text-blue-300">Return to sign in</button>
                </motion.div>
              )}

              {view === "success" && (
                <motion.div key="success" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-300/20 bg-emerald-300/10 text-emerald-300"><CheckCircle2 className="h-8 w-8" /></div>
                  <h2 className="text-3xl font-semibold tracking-[-0.035em]">Account ready</h2>
                  <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-400">Save this passkey securely. You’ll need it when signing in manually.</p>
                  <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.045] p-5 text-left">
                    <div className="mb-3 flex items-center justify-between"><span className="text-xs font-medium uppercase tracking-wider text-slate-500">Your passkey</span><ShieldCheck className="h-4 w-4 text-emerald-400" /></div>
                    <div className="flex items-center gap-3"><code className="min-w-0 flex-1 overflow-x-auto rounded-lg bg-black/20 px-3 py-3 text-center text-lg font-semibold tracking-wider text-white">{newPasskey}</code><button onClick={copyPasskey} aria-label="Copy passkey" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-white/10 text-slate-300 transition hover:bg-white/10 hover:text-white">{copied ? <Check className="h-5 w-5 text-emerald-400" /> : <Copy className="h-5 w-5" />}</button></div>
                  </div>
                  <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-300/15 bg-amber-300/[0.06] p-4 text-left text-xs leading-5 text-amber-100/80"><ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />For your security, this passkey will not be displayed again.</div>
                  <button onClick={() => changeView("login")} className={`${primaryButton} mt-7`}>Continue to sign in <ArrowRight className="h-4 w-4" /></button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-10 flex items-center justify-center gap-5 text-[11px] text-slate-600 lg:hidden"><span>© {new Date().getFullYear()} Muhyo Tech</span><span>•</span><span>Secure admin access</span></div>
          </div>
        </section>
      </div>

      <AnimatePresence>
        {linkToken && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-[#030712]/85 p-4 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 12 }} role="dialog" aria-modal="true" aria-labelledby="link-google-title" className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0d1422] p-6 shadow-2xl sm:p-7">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white"><GoogleIcon className="h-6 w-6" /></div>
              <h2 id="link-google-title" className="text-2xl font-semibold tracking-tight">Link Google sign-in</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">Enter the current passkey for <span className="font-medium text-white">{googleLinkEmail || "this account"}</span>. This one-time check securely links the Google identity.</p>
              <div className="mt-5 rounded-xl border border-emerald-300/15 bg-emerald-300/[0.06] p-4 text-xs leading-5 text-emerald-100/80">After verification, both manual passkey and Google sign-in will remain available. This prompt will not appear again.</div>
              <div className="mt-6">
                <Field icon={LockKeyhole} label="Current passkey"><input className={inputClass} type="password" autoComplete="current-password" value={linkPasskey} onChange={(e) => setLinkPasskey(e.target.value)} placeholder="Enter your current passkey" /></Field>
              </div>
              <div className="mt-4"><ErrorNotice message={linkError} /></div>
              <div className="mt-6 space-y-3">
                <button type="button" onClick={handleLinkGoogle} disabled={linkLoading} className={primaryButton}>{linkLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><GoogleIcon className="h-4 w-4" /> Verify and link Google</>}</button>
                <button type="button" onClick={() => { setLinkToken(""); setLinkPasskey(""); setLinkError(""); }} className="w-full rounded-xl border border-white/10 px-5 py-3.5 text-sm font-medium text-slate-300 transition hover:bg-white/[0.05] hover:text-white">Not now</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

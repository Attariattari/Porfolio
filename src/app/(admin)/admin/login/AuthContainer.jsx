"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
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
        <label className="text-sm font-semibold text-foreground">{label}</label>
        {hint}
      </div>
      <div className="group relative">
        <Icon className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-accent" />
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
      className="admin-auth-error flex items-start gap-3 rounded-xl border px-4 py-3 text-sm font-semibold leading-5 shadow-sm"
    >
      <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </motion.div>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-4 py-1">
      <span className="h-px flex-1 bg-border" />
      <span className="text-xs font-medium text-muted-foreground">or</span>
      <span className="h-px flex-1 bg-border" />
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
      // Use the validated callback passed by the server. A full navigation makes
      // sure the HttpOnly session cookie from the login response is available to
      // the destination server component before it checks authentication.
      window.location.replace(callbackUrl);
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
  const inputClass = "admin-auth-input w-full rounded-xl border border-border bg-background/75 py-3.5 pl-12 pr-4 text-[15px] text-foreground outline-none transition placeholder:text-muted-foreground/60 hover:border-accent/40 focus:border-accent focus:bg-background focus:ring-4 focus:ring-accent/10";
  const primaryButton = "flex w-full items-center justify-center gap-2.5 rounded-xl bg-accent px-5 py-3.5 text-sm font-semibold text-accent-foreground shadow-sm transition hover:brightness-95 focus:outline-none focus:ring-4 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-60";
  const secondaryButton = "flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-background/70 px-5 py-3.5 text-sm font-semibold text-foreground transition hover:border-accent/35 hover:bg-muted disabled:opacity-60";
  const quietButton = "text-sm font-semibold text-accent transition hover:brightness-75";

  return (
    <main className="relative min-h-dvh overflow-hidden bg-background text-foreground selection:bg-accent/25">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-18rem] h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-accent/[0.09] blur-3xl" />
      </div>

      <section className="relative flex min-h-dvh w-full items-center justify-center px-5 py-10 sm:px-8 sm:py-14">
        <div className="w-full max-w-[500px]">
          <div className="mb-7 flex items-center justify-between px-1">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-foreground shadow-sm">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold tracking-tight text-foreground">Muhyo Tech</p>
                <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">Admin Control Center</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-semibold text-muted-foreground shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Secure access
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-border bg-card p-6 shadow-2xl shadow-foreground/5 sm:p-9">
            <AnimatePresence mode="wait">
              {view === "login" && (
                <motion.div key="login" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                  <header className="mb-8">
                    <p className="mb-3 text-sm font-semibold text-accent">Admin login</p>
                    <h2 className="text-3xl font-semibold tracking-[-0.035em] sm:text-[36px]">Login to your account</h2>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">Use your approved admin credentials to continue.</p>
                  </header>

                  <form onSubmit={handleLogin} className="space-y-5">
                    <Field icon={Mail} label="Email address">
                      <input className={inputClass} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" required />
                    </Field>
                    <Field
                      icon={LockKeyhole}
                      label="Password"
                      hint={<button type="button" onClick={() => changeView("reset")} className="text-xs font-semibold text-accent transition hover:brightness-75">Forgot password?</button>}
                    >
                      <input className={`${inputClass} pr-12 font-mono`} type={showPasskey ? "text" : "password"} autoComplete="current-password" value={passkey} onChange={(e) => setPasskey(e.target.value)} placeholder="Enter your password" required />
                      <button type="button" onClick={() => setShowPasskey((value) => !value)} aria-label={showPasskey ? "Hide password" : "Show password"} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground">
                        {showPasskey ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                      </button>
                    </Field>
                    <ErrorNotice message={error} />
                    <button className={primaryButton} type="submit" disabled={loading}>
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Login <ArrowRight className="h-4 w-4" /></>}
                    </button>
                    <Divider />
                    <button type="button" onClick={handleGoogleAuth} disabled={loading} className={secondaryButton}>
                      <GoogleIcon /> Login with Google
                    </button>
                  </form>
                  <p className="mt-8 text-center text-sm text-muted-foreground">Need admin access? <button onClick={() => changeView("setup")} className={quietButton}>Create an account</button></p>
                </motion.div>
              )}

              {requestMode && (
                <motion.div key="request" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                  <button type="button" onClick={() => changeView("login")} className="mb-7 flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to sign in</button>
                  <header className="mb-8">
                    <p className="mb-3 text-sm font-semibold text-accent">{view === "reset" ? "Account recovery" : "Admin onboarding"}</p>
                    <h2 className="text-3xl font-semibold tracking-[-0.035em] sm:text-[36px]">{view === "reset" ? "Recover your passkey" : view === "denied" ? "Request access again" : "Create your account"}</h2>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{view === "reset" ? "We'll email you a secure verification code." : "Verify your email first. A super admin will review new access requests."}</p>
                  </header>
                  <form onSubmit={handleSendCode} className="space-y-5">
                    <Field icon={Mail} label="Work email">
                      <input className={inputClass} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
                    </Field>
                    <ErrorNotice message={error} />
                    <button className={primaryButton} type="submit" disabled={loading}>
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Send verification code <ArrowRight className="h-4 w-4" /></>}
                    </button>
                    {view === "setup" && <><Divider /><button type="button" onClick={handleGoogleAuth} disabled={loading} className={secondaryButton}><GoogleIcon /> Continue with Google</button></>}
                  </form>
                  <p className="mt-8 text-center text-sm text-muted-foreground">Already approved? <button onClick={() => changeView("login")} className={quietButton}>Sign in instead</button></p>
                </motion.div>
              )}

              {view === "verify" && (
                <motion.div key="verify" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                  <button type="button" onClick={() => changeView(defaultView === "setup" ? "setup" : "login")} className="mb-7 flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Change email</button>
                  <header className="mb-8">
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 text-accent"><Mail className="h-5 w-5" /></div>
                    <h2 className="text-3xl font-semibold tracking-[-0.035em]">Check your inbox</h2>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">Enter the 6-digit code sent to <span className="font-semibold text-foreground">{email}</span>.</p>
                  </header>
                  <form onSubmit={handleVerify} className="space-y-5">
                    <Field icon={KeyRound} label="Verification code">
                      <input className={`${inputClass} pl-12 text-center font-mono text-lg tracking-[0.45em]`} type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} placeholder="000000" required autoFocus />
                    </Field>
                    <ErrorNotice message={error} />
                    <button className={primaryButton} type="submit" disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify email"}</button>
                    <button type="button" onClick={handleSendCode} disabled={loading} className="w-full py-2 text-sm font-semibold text-muted-foreground transition hover:text-accent disabled:opacity-60">Didn’t receive it? Send again</button>
                  </form>
                </motion.div>
              )}

              {view === "pending" && (
                <motion.div key="pending" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                  <div className="relative mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-300"><span className="absolute inset-0 animate-ping rounded-2xl border border-amber-500/10" /><Clock3 className="h-7 w-7" /></div>
                  <h2 className="text-3xl font-semibold tracking-[-0.035em]">Approval pending</h2>
                  <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-muted-foreground">Your email is verified. A super admin needs to approve your request before you can sign in.</p>
                  <div className="mt-7 rounded-xl border border-border bg-muted/50 p-4 text-left">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Request submitted for</p>
                    <p className="mt-1.5 truncate text-sm font-medium text-foreground">{email}</p>
                  </div>
                  <p className="mt-5 flex items-center justify-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Checking approval status automatically</p>
                  <button onClick={() => changeView("login")} className={`${quietButton} mt-8`}>Return to sign in</button>
                </motion.div>
              )}

              {view === "success" && (
                <motion.div key="success" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"><CheckCircle2 className="h-8 w-8" /></div>
                  <h2 className="text-3xl font-semibold tracking-[-0.035em]">Account ready</h2>
                  <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground">Save this passkey securely. You’ll need it when signing in manually.</p>
                  <div className="mt-7 rounded-2xl border border-border bg-muted/50 p-5 text-left">
                    <div className="mb-3 flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your passkey</span><ShieldCheck className="h-4 w-4 text-emerald-500" /></div>
                    <div className="flex items-center gap-3"><code className="min-w-0 flex-1 overflow-x-auto rounded-lg border border-border bg-background px-3 py-3 text-center text-lg font-semibold tracking-wider text-foreground">{newPasskey}</code><button onClick={copyPasskey} aria-label="Copy passkey" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:bg-background hover:text-foreground">{copied ? <Check className="h-5 w-5 text-emerald-500" /> : <Copy className="h-5 w-5" />}</button></div>
                  </div>
                  <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.07] p-4 text-left text-xs leading-5 text-amber-800 dark:text-amber-100/80"><ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />For your security, this passkey will not be displayed again.</div>
                  <button onClick={() => changeView("login")} className={`${primaryButton} mt-7`}>Continue to sign in <ArrowRight className="h-4 w-4" /></button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="mt-6 flex items-center justify-center gap-3 text-[11px] font-medium text-muted-foreground">
            <span>© {new Date().getFullYear()} Muhyo Tech</span>
            <span aria-hidden="true">•</span>
            <span>Authorized personnel only</span>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {linkToken && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-background/55 p-4 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 12 }} role="dialog" aria-modal="true" aria-labelledby="link-google-title" className="w-full max-w-md rounded-3xl border border-border bg-card p-6 text-foreground shadow-2xl sm:p-7">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-background"><GoogleIcon className="h-6 w-6" /></div>
              <h2 id="link-google-title" className="text-2xl font-semibold tracking-tight">Link Google sign-in</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">Enter the current passkey for <span className="font-semibold text-foreground">{googleLinkEmail || "this account"}</span>. This one-time check securely links the Google identity.</p>
              <div className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.07] p-4 text-xs leading-5 text-emerald-800 dark:text-emerald-100/80">After verification, both manual passkey and Google sign-in will remain available. This prompt will not appear again.</div>
              <div className="mt-6">
                <Field icon={LockKeyhole} label="Current passkey"><input className={inputClass} type="password" autoComplete="current-password" value={linkPasskey} onChange={(e) => setLinkPasskey(e.target.value)} placeholder="Enter your current passkey" /></Field>
              </div>
              <div className="mt-4"><ErrorNotice message={linkError} /></div>
              <div className="mt-6 space-y-3">
                <button type="button" onClick={handleLinkGoogle} disabled={linkLoading} className={primaryButton}>{linkLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><GoogleIcon className="h-4 w-4" /> Verify and link Google</>}</button>
                <button type="button" onClick={() => { setLinkToken(""); setLinkPasskey(""); setLinkError(""); }} className={secondaryButton}>Not now</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

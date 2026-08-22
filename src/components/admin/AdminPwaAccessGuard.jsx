"use client";

import { useEffect, useState } from "react";
import { ShieldAlert, LogOut, Mail, Lock, AlertTriangle, ArrowRight } from "lucide-react";
import { toast } from "sonner";

/**
 * AdminPwaAccessGuard Component
 * 
 * Enterprise Device & Clearance Guard:
 * - Detects if the admin portal is running in installed Standalone PWA mode.
 * - When in Standalone mode, verifies that the authenticated user is a verified Super Admin.
 * - If a non-super-admin or unauthorized user logs in through the installed app,
 *   it halts access and displays an enterprise security clearance restriction screen.
 */
export default function AdminPwaAccessGuard({ children }) {
  const [isStandalone, setIsStandalone] = useState(false);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Detect if running inside installed Standalone PWA app
    const checkStandalone = () => {
      const isStandaloneMode =
        (typeof window !== "undefined" &&
          (window.matchMedia("(display-mode: standalone)").matches ||
            window.navigator.standalone === true ||
            document.referrer.includes("android-app://"))) ||
        false;
      setIsStandalone(isStandaloneMode);
    };

    checkStandalone();

    // 2. Fetch authenticated session
    let isMounted = true;
    const fetchSession = async () => {
      try {
        const res = await fetch("/api/admin/me", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setSession(data);
        }
      } catch (err) {
        console.warn("[AdminPwaGuard] Session check error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/admin/logout", { method: "POST" });
      if (res.ok) {
        toast.success("Signed out successfully.");
        localStorage.removeItem("admin_token");
        localStorage.removeItem("token");
        window.location.href = "/admin/login";
      }
    } catch {
      toast.error("Logout failed. Please try again.");
    }
  };

  const isSuperAdmin = ["super-admin", "root-super-admin"].includes(session?.role);

  // If in Standalone mode and user is logged in but NOT a Super Admin, block access
  if (isStandalone && !loading && session && !isSuperAdmin) {
    const userRoleDisplay = session.role
      ? session.role.toUpperCase()
      : "STANDARD USER";

    return (
      <div className="fixed inset-0 z-[9999] flex min-h-screen items-center justify-center bg-[#050811] px-4 py-8 text-slate-100 selection:bg-rose-500 selection:text-white">
        {/* Ambient Security Background Elements */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(244,63,94,0.15),transparent_70%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent,#050811_80%)]" />
        <div className="pointer-events-none absolute h-full w-full bg-[radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />

        <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-3xl border border-rose-500/30 bg-[#090e1a]/95 p-6 sm:p-8 shadow-[0_25px_80px_rgba(244,63,94,0.2)] backdrop-blur-2xl">
          {/* Header Warning Badge */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_12px_rgba(244,63,94,0.9)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-rose-400">
                Enterprise Device Gate
              </span>
            </div>
            <span className="rounded-md border border-rose-500/20 bg-rose-500/10 px-2.5 py-0.5 text-[9px] font-black tracking-widest text-rose-300">
              RESTRICTED 403
            </span>
          </div>

          {/* Primary Alert Icon & Title */}
          <div className="mb-6 text-center sm:text-left">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-500/10 shadow-[0_0_30px_rgba(244,63,94,0.25)] sm:mx-0">
              <ShieldAlert className="h-7 w-7 text-rose-400" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Restricted Application Instance
            </h1>
            <p className="mt-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Super Administrator Clearance Required
            </p>
          </div>

          {/* Body Content in Professional English */}
          <div className="space-y-4 text-xs leading-relaxed text-slate-300">
            <p>
              This dedicated standalone application instance is exclusively provisioned for authorized{" "}
              <strong className="text-white">Super Administrators</strong> of Muhyo Tech.
            </p>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-[11px] leading-normal text-slate-300">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                <div>
                  <span className="font-bold text-white">Access Denied: </span>
                  Your authenticated credentials (<span className="text-rose-300 font-mono font-semibold">{session.email}</span>, Role: <span className="text-amber-300 font-mono font-bold">{userRoleDisplay}</span>) do not hold administrative clearance to operate this standalone workspace.
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-4 text-[11px] text-sky-200">
              <span className="font-bold text-sky-100">Next Steps:</span>
              <ul className="mt-1.5 list-disc pl-4 space-y-1 text-slate-300">
                <li>
                  Sign in with your designated Super Administrator credentials.
                </li>
                <li>
                  Contact the Root Super Administrator (
                  <a
                    href="mailto:attariattari549@gmail.com?subject=Access%20Clearance%20Request%20-%20Muhyo%20Tech%20Admin%20App"
                    className="text-sky-400 underline hover:text-sky-300"
                  >
                    attariattari549@gmail.com
                  </a>
                  ) to request access elevation.
                </li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-white/10">
            <a
              href="mailto:attariattari549@gmail.com?subject=Access%20Clearance%20Request%20-%20Muhyo%20Tech%20Admin%20App"
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              <Mail className="h-4 w-4 text-sky-400" />
              <span>Contact Root Super Admin</span>
            </a>

            <button
              onClick={handleLogout}
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-rose-500 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-[0_10px_25px_rgba(244,63,94,0.4)] hover:bg-rose-600 transition-transform active:scale-95"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out & Switch Account</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Normal flow: render protected children
  return children;
}

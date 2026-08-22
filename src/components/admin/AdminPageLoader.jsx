"use client";

import { ShieldCheck, Sparkles, BrainCircuit } from "lucide-react";

/**
 * High-End Cyber Glassmorphic Loader for Admin Dashboard & Pages.
 * Displays during authentication checks, page transitions, and data hydration.
 */
export default function AdminPageLoader({
  title = "Securing Workspace Telemetry",
  message = "Loading live control center data...",
  fullScreen = false,
  badge = "Muhyo Tech Control Center",
}) {
  const containerClasses = fullScreen
    ? "fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background text-foreground select-none overflow-hidden"
    : "relative w-full min-h-[420px] flex flex-col items-center justify-center rounded-[28px] border border-white/[0.08] bg-[#0d1727]/90 backdrop-blur-md p-8 text-foreground select-none overflow-hidden my-4 shadow-xl";

  return (
    <div className={containerClasses}>
      {/* Background ambient lighting effects */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] bg-violet-500/10 rounded-full blur-[120px]" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] bg-cyan-500/10 rounded-full blur-[80px]" />

      {/* Central Interactive Shield & Pulse Container */}
      <div className="relative flex flex-col items-center max-w-sm px-6 text-center z-10">
        {/* Animated Glowing Ring */}
        <div className="relative flex items-center justify-center size-20 mb-6">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-violet-500 to-cyan-400 opacity-25 animate-ping duration-1000" />
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-violet-500 to-cyan-500 opacity-40 blur-sm animate-pulse" />
          <div className="relative flex items-center justify-center size-16 rounded-2xl bg-[#09111e] border border-violet-400/40 shadow-2xl shadow-violet-500/20">
            <ShieldCheck className="size-8 text-violet-400 animate-pulse" />
          </div>
        </div>

        {/* Title & Brand Status */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-black tracking-[0.25em] uppercase text-violet-300">
            {badge}
          </span>
          <Sparkles className="size-3.5 text-violet-400 animate-bounce" />
        </div>

        <h2 className="text-lg font-bold tracking-tight text-white mb-2">
          {title}
        </h2>

        <p className="text-xs text-slate-400 leading-relaxed mb-6 font-medium max-w-xs">
          {message}
        </p>

        {/* Micro Linear Shimmering Progress Bar */}
        <div className="w-52 h-1.5 bg-slate-800/80 rounded-full overflow-hidden relative border border-white/[0.05]">
          <div
            className="absolute inset-0 bg-gradient-to-r from-violet-500 via-cyan-400 to-violet-500 rounded-full w-[60%]"
            style={{
              animation: "adminLoaderBar 1.4s ease-in-out infinite alternate",
            }}
          />
        </div>
      </div>
    </div>
  );
}

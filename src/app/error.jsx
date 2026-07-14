"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error("System Failure Detected:", error);
  }, [error]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-5 py-12 text-foreground transition-colors sm:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,color-mix(in_srgb,var(--accent)_12%,transparent),transparent_48%)]" />

      <section className="relative z-10 w-full max-w-2xl rounded-3xl border border-border bg-card p-6 text-center shadow-2xl shadow-overlay/10 sm:p-10">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-destructive/25 bg-destructive/10 text-destructive">
          <span className="text-2xl font-black" aria-hidden="true">!</span>
        </div>

        <p className="mb-3 text-[10px] font-black uppercase tracking-[0.32em] text-destructive">
          System error
        </p>
        <h1 className="mb-4 break-words text-2xl font-black uppercase tracking-tight text-foreground sm:text-4xl">
          SYSTEM_FAILURE_MUHYO_TECH
        </h1>
        <p className="mx-auto mb-8 max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">
          Something went wrong while loading this page. You can retry now or return to the home page.
        </p>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="cursor-pointer rounded-xl bg-accent px-7 py-3.5 text-sm font-bold text-accent-foreground shadow-lg shadow-accent/15 transition-all hover:-translate-y-0.5 hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-xl border border-border bg-background px-7 py-3.5 text-sm font-bold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Go to home
          </Link>
        </div>

        {error?.digest && (
          <p className="mt-7 text-xs text-muted-foreground">
            Reference: <span className="font-mono text-foreground">{error.digest}</span>
          </p>
        )}
      </section>
    </main>
  );
}

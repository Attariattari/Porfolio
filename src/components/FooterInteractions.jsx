"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ArrowUp,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Mail,
  Send,
} from "lucide-react";
import { toast } from "sonner";

export function FooterNewsletterForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();

      if (result.success) {
        setSubscribed(true);
        setEmail("");
        toast.success(result.message);
      } else {
        toast.error(result.error || "Subscription failed.");
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-5 flex max-w-md flex-col gap-2 rounded-2xl border border-border/60 bg-muted/20 p-2 sm:flex-row"
    >
      <div className="flex min-w-0 flex-1 items-center gap-3 px-2 py-2 sm:py-0">
        <Mail size={16} className="shrink-0 text-accent" />
        <input
          type="email"
          aria-label="Email address for project updates"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={subscribed ? "Subscribed successfully" : "Get project updates"}
          className="min-w-0 flex-1 bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground/70"
        />
      </div>
      <button
        type="submit"
        disabled={loading || subscribed}
        className="inline-flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-accent px-4 text-xs font-bold text-accent-foreground shadow-lg shadow-accent/20 transition-all hover:bg-accent/90 disabled:opacity-70 sm:w-auto"
        aria-label="Subscribe"
      >
        {loading ? (
          <Loader2 size={15} className="animate-spin" />
        ) : subscribed ? (
          <CheckCircle2 size={15} />
        ) : (
          <>
            Subscribe
            <Send size={14} />
          </>
        )}
      </button>
    </form>
  );
}

export function FooterAnchorLink({ href, children, className }) {
  const handleClick = (event) => {
    if (!href.startsWith("/#")) return;
    const element = document.getElementById(href.split("#")[1]);
    if (!element) return;
    event.preventDefault();
    element.scrollIntoView({ behavior: "smooth" });
    window.history.pushState(null, "", href);
  };

  return <Link href={href} onClick={handleClick} className={className}>{children}</Link>;
}

export function FooterLegalLinks({ links }) {
  const pathname = usePathname();

  return links.map((link) => {
    const isActive = pathname === link.href;
    return (
      <li key={link.name}>
        <Link
          href={link.href}
          aria-current={isActive ? "page" : undefined}
          className={`group -ml-2 flex w-fit items-center rounded-lg px-2 py-1 text-sm font-medium transition-colors ${
            isActive
              ? "bg-accent/10 text-accent"
              : "text-muted-foreground hover:text-accent"
          }`}
        >
          {link.name}
          <ChevronRight
            size={12}
            className={`transition-all ${
              isActive
                ? "translate-x-1 opacity-100"
                : "-translate-x-2 opacity-0 group-hover:translate-x-1 group-hover:opacity-100"
            }`}
          />
        </Link>
      </li>
    );
  });
}

export function FooterBackToTop() {
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="group flex items-center gap-3 text-xs font-bold tracking-normal text-accent transition-transform duration-200 hover:-translate-y-1 active:scale-95"
      aria-label="Back to top"
    >
      <span className="hidden sm:inline">Back to top</span>
      <div className="w-10 h-10 rounded-2xl border border-accent/25 bg-background/60 flex items-center justify-center group-hover:bg-accent/10 transition-colors">
        <ArrowUp size={16} />
      </div>
    </button>
  );
}

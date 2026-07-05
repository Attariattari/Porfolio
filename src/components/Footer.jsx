"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  Mail,
  ArrowUp,
  ChevronRight,
  ExternalLink,
  Send,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import SocialLinks from "./SocialLinks";

import { portfolioData } from "@/lib/data";

export default function Footer({ data }) {
  const footerData = portfolioData.siteConfig.footer;
  const about = data || portfolioData.about;
  const displayName = `${about.firstName || "Muhyo"} ${about.lastName || "Tech"}`;
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const footerLinks = {
    navigation: footerData.navigation,
    resources: footerData.resources,
    legal: footerData.legal,
  };

  const portfolioLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Services", href: "/services" },
    { name: "Projects", href: "/projects" },
    { name: "Goals", href: "/goals" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
  ];

  const handleLinkClick = (e, href) => {
    if (href.startsWith("/#")) {
      const id = href.split("#")[1];
      const element = document.getElementById(id);
      if (element) {
        e.preventDefault();
        element.scrollIntoView({ behavior: "smooth" });
        window.history.pushState(null, "", href);
      }
    }
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await res.json();

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
    <footer className="relative border-t border-border/35 px-6 pt-12 pb-8 overflow-hidden">
      <div className="absolute top-0 left-10 h-24 w-24 rounded-full border border-accent/10 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[460px] h-[460px] bg-accent/5 blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="container mx-auto relative z-10">
        <div className="overflow-hidden rounded-[28px] border border-border/60 bg-background/55 backdrop-blur-sm">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.65fr]">
            <div className="border-b border-border/60 p-6 sm:p-7 lg:border-b-0 lg:border-r">
              <Link href="/" className="mb-5 flex w-fit items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent p-2.5 shadow-lg shadow-accent/20">
                  <Image
                    src="/logo.png"
                    alt="Logo"
                    width={24}
                    height={24}
                    className="h-full w-full object-contain"
                  />
                </div>
                <span className="text-xl font-bold tracking-tight text-foreground">
                  {about.firstName || "Muhyo"}
                  <span className="text-accent">{about.lastName || "Tech"}</span>
                </span>
              </Link>

              <h3 className="mb-3 max-w-md text-2xl font-bold tracking-tight text-foreground">
                Building polished digital products with clean engineering.
              </h3>
              <p className="mb-6 max-w-md text-sm leading-relaxed text-muted-foreground">
                Portfolio work, web apps, dashboards, and launch-ready
                experiences crafted with performance and detail in mind.
              </p>

              <form
                onSubmit={handleSubscribe}
                className="mb-5 flex max-w-md gap-2 rounded-2xl border border-border/60 bg-muted/20 p-2"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3 px-2">
                  <Mail size={16} className="shrink-0 text-accent" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={
                      subscribed ? "Subscribed successfully" : "Get project updates"
                    }
                    className="min-w-0 flex-1 bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground/70"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || subscribed}
                  className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-accent px-4 text-xs font-bold text-accent-foreground shadow-lg shadow-accent/20 transition-all hover:bg-accent/90 disabled:opacity-70"
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

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 rounded-full border border-border/60 bg-muted/20 px-3 py-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-[11px] font-semibold text-foreground/80">
                    Available for selected projects
                  </span>
                </div>
                <SocialLinks
                  className="flex items-center gap-2"
                  buttonClassName="w-9 h-9 rounded-full border border-border/60 bg-muted/15 flex items-center justify-center transition-all duration-300"
                  iconSize="w-4 h-4"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-8 p-6 sm:grid-cols-4 sm:p-7">
              <div>
                <h4 className="mb-4 text-[10px] font-bold tracking-[0.18em] text-accent">
                  PORTFOLIO
                </h4>
                <ul className="space-y-3">
                  {portfolioLinks.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        onClick={(e) => handleLinkClick(e, link.href)}
                        className="group flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-accent"
                      >
                        {link.name}
                        <ChevronRight
                          size={12}
                          className="opacity-0 -translate-x-2 transition-all group-hover:translate-x-1 group-hover:opacity-100"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="mb-4 text-[10px] font-bold tracking-[0.18em] text-accent">
                  RESOURCES
                </h4>
                <ul className="space-y-3">
                  {footerLinks.resources.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        onClick={(e) => handleLinkClick(e, link.href)}
                        className="group flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-accent"
                      >
                        {link.name}
                        <ChevronRight
                          size={12}
                          className="opacity-0 -translate-x-2 transition-all group-hover:translate-x-1 group-hover:opacity-100"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="mb-4 text-[10px] font-bold tracking-[0.18em] text-accent">
                  CONNECT
                </h4>
                <ul className="space-y-3">
                  <li>
                    <a
                      href={`mailto:${about.email}`}
                      className="group flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-accent"
                      aria-label={`Email ${displayName}`}
                    >
                      Email me
                      <ExternalLink
                        size={12}
                        className="ml-1 opacity-50 transition-opacity group-hover:opacity-100"
                      />
                    </a>
                  </li>
                  <li>
                    <Link
                      href="/contact"
                      className="group flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-accent"
                    >
                      Start a project
                      <ChevronRight
                        size={12}
                        className="opacity-0 -translate-x-2 transition-all group-hover:translate-x-1 group-hover:opacity-100"
                      />
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/resume"
                      className="group flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-accent"
                    >
                      View resume
                      <ChevronRight
                        size={12}
                        className="opacity-0 -translate-x-2 transition-all group-hover:translate-x-1 group-hover:opacity-100"
                      />
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="mb-4 text-[10px] font-bold tracking-[0.18em] text-accent">
                  LEGAL
                </h4>
                <ul className="space-y-3">
                  {footerLinks.legal.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="group flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-accent"
                      >
                        {link.name}
                        <ChevronRight
                          size={12}
                          className="opacity-0 -translate-x-2 transition-all group-hover:translate-x-1 group-hover:opacity-100"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-5 flex flex-col md:flex-row justify-between items-center gap-5">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <p className="mb-0 text-[11px] font-medium text-muted-foreground">
              &copy; {new Date().getFullYear()} Muhyo Tech. All rights reserved.
            </p>
            <div className="hidden md:block w-[1px] h-4 bg-border/60" />
            <p className="mb-0 text-[11px] font-medium text-muted-foreground">
              Web experiences, dashboards, and automation workflows.
            </p>
          </div>

          <motion.button
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToTop}
            className="flex items-center gap-3 text-xs font-bold tracking-normal text-accent group"
            aria-label="Back to top"
          >
            <span className="hidden sm:inline">Back to top</span>
            <div className="w-10 h-10 rounded-2xl border border-accent/25 bg-background/60 flex items-center justify-center group-hover:bg-accent/10 transition-colors">
              <ArrowUp size={16} />
            </div>
          </motion.button>
        </div>
      </div>
    </footer>
  );
}

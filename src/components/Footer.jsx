"use client";

import Link from "next/link";
import {
  Mail,
  ArrowUp,
  Globe,
  ShieldCheck,
  MessageSquare,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { motion } from "framer-motion";
import SocialLinks from "./SocialLinks";
import Newsletter from "./Newsletter";

import { portfolioData } from "@/lib/data";

export default function Footer({ data }) {
  const footerData = portfolioData.siteConfig.footer;
  const about = data || portfolioData.about;

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

  return (
    <footer className="relative border-t border-border/40 pt-24 pb-12 overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/5 blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 mb-20">
          {/* Brand Identity */}
          <div className="lg:col-span-4 space-y-8">
            <Link href="/" className="flex items-center gap-3 w-fit">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center p-2 shadow-lg shadow-accent/20">
                <img
                  src="/logo.png"
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {about.firstName || "Muhyo"}
                <span className="text-accent">{about.lastName || "Tech"}</span>
              </span>
            </Link>

            <p className="text-muted-foreground text-base leading-relaxed max-w-sm">
              {footerData.brandDescription}
            </p>

            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-border/50 bg-muted/30 backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold tracking-normal text-foreground/80">
                Available for new ventures
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="lg:col-span-2 lg:ml-auto">
            <h4 className="text-xs font-bold tracking-normal text-foreground mb-8">
              Navigation
            </h4>
            <ul className="flex flex-wrap lg:flex-col gap-x-6 gap-y-3 lg:gap-0 lg:space-y-4">
              {footerLinks.navigation.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-accent transition-colors flex items-center group"
                  >
                    {link.name}
                    <ChevronRight
                      size={12}
                      className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold tracking-normal text-foreground mb-8">
              Resources
            </h4>
            <ul className="flex flex-wrap lg:flex-col gap-x-6 gap-y-3 lg:gap-0 lg:space-y-4">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-accent transition-colors flex items-center group"
                  >
                    {link.name}
                    <ChevronRight
                      size={12}
                      className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Socials */}
          <div className="lg:col-span-4 space-y-8">
            <h4 className="text-xs font-bold tracking-normal text-foreground mb-8">
              Stay connected
            </h4>
            <div className="space-y-6">
              <a
                href={`mailto:${about.email}`}
                className="flex items-center gap-4 group p-4 rounded-2xl border border-border/40 hover:border-accent/40 bg-muted/20 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-background transition-colors">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-[11px] font-semibold tracking-normal text-muted-foreground mb-0.5">
                    Email me
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {about.email}
                  </p>
                </div>
                <ExternalLink
                  size={14}
                  className="ml-auto opacity-40 group-hover:opacity-100 transition-opacity"
                />
              </a>

              <Newsletter />

              <div className="flex flex-col gap-4">
                <p className="text-[11px] font-semibold tracking-normal text-muted-foreground pl-1">
                  Social channels
                </p>
                <SocialLinks
                  buttonClassName="w-11 h-11 rounded-xl border border-border/60 flex items-center justify-center hover:bg-accent hover:border-accent hover:text-background transition-all duration-300"
                  iconSize="w-5 h-5"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <p className="text-[11px] font-medium text-muted-foreground">
              &copy; {new Date().getFullYear()} Muhyo Tech. All rights reserved.
            </p>
            <div className="hidden md:block w-[1px] h-4 bg-border/60" />
            <div className="flex items-center gap-6">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-[11px] font-medium text-muted-foreground hover:text-accent transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <motion.button
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToTop}
            className="flex items-center gap-3 text-xs font-bold tracking-normal text-accent group"
          >
            <span className="hidden sm:inline">Back to top</span>
            <div className="w-10 h-10 rounded-full border border-accent/20 flex items-center justify-center group-hover:bg-accent/5 transition-colors">
              <ArrowUp size={16} />
            </div>
          </motion.button>
        </div>
      </div>
    </footer>
  );
}

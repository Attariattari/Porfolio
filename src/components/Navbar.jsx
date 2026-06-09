"use client";

import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useAdminStore from "@/lib/store/adminStore";
import { portfolioData } from "@/lib/data";

export default function Navbar() {
  const { settings } = useAdminStore();
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Fallback to static data if settings not loaded
  const logo = {
    title: settings?.siteTitle || portfolioData?.siteConfig?.navbar?.logo?.title || "Muhyo",
    accent: settings?.siteAccent || portfolioData?.siteConfig?.navbar?.logo?.accent || "Tech",
  };

  const navLinks = portfolioData.siteConfig?.navbar?.navLinks || [];
  const cta = portfolioData.siteConfig?.navbar?.cta || {};

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "glass py-3 border-b border-border/10"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link href="/" prefetch={true} className="text-2xl font-bold text-foreground">
          {logo.title}
          <span className="text-accent underline decoration-accent/30 underline-offset-4">
            {logo.accent}
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              prefetch={true}
              className="text-sm font-medium text-foreground/80 hover:text-accent transition-colors"
            >
              {link.name}
            </Link>
          ))}
          <ThemeToggle />
          <Link
            href={cta.href}
            prefetch={true}
            className="px-5 py-2 rounded-full bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90 transition-opacity hover-glow"
          >
            {cta.label}
          </Link>
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden flex items-center gap-4">
          <ThemeToggle />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-foreground p-1"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b border-border"
          >
            <div className="px-6 py-8 flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  prefetch={true}
                  onClick={() => setIsOpen(false)}
                  className="text-lg font-medium text-foreground hover:text-accent"
                >
                  {link.name}
                </Link>
              ))}
              <Link
                href={cta.href}
                prefetch={true}
                className="w-full text-center py-3 rounded-lg bg-accent text-accent-foreground font-semibold"
                onClick={() => setIsOpen(false)}
              >
                {cta.label}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

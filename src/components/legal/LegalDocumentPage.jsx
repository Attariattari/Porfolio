"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useRef, useState } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileCheck2,
  Fingerprint,
  Gavel,
  Globe2,
  LockKeyhole,
  Mail,
  Scale,
  ScrollText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import EditorialBackground from "@/components/ui/EditorialBackground";

const ICONS = {
  check: CheckCircle2,
  fingerprint: Fingerprint,
  gavel: Gavel,
  globe: Globe2,
  lock: LockKeyhole,
  scale: Scale,
  scroll: ScrollText,
  shield: ShieldCheck,
  sparkle: Sparkles,
};

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.55, ease: "easeOut" },
};

function SectionNavigator({ sections, documentType }) {
  const trackRef = useRef(null);
  const [position, setPosition] = useState({ atStart: true, atEnd: false });

  const updatePosition = () => {
    const track = trackRef.current;
    if (!track) return;
    const maxScroll = track.scrollWidth - track.clientWidth;
    setPosition({
      atStart: track.scrollLeft <= 4,
      atEnd: track.scrollLeft >= maxScroll - 4,
    });
  };

  const move = (direction) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({
      left: direction * Math.max(240, track.clientWidth * 0.72),
      behavior: "smooth",
    });
  };

  return (
    <nav
      aria-label={`${documentType} sections`}
      className="sticky top-3 z-30 mt-10 overflow-hidden rounded-2xl border border-border/80 bg-background/90 p-2 shadow-xl shadow-black/10 backdrop-blur-xl"
    >
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={() => move(-1)}
          disabled={position.atStart}
          aria-label="Show previous policy sections"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-card text-foreground transition-all hover:border-accent/40 hover:text-accent disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="relative min-w-0 flex-1 overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-background/90 to-transparent" />
          <ol
            ref={trackRef}
            onScroll={updatePosition}
            className="flex snap-x snap-mandatory gap-1.5 overflow-x-auto overscroll-x-contain scroll-smooth px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {sections.map((section, index) => (
              <li key={section.id} className="shrink-0 snap-start">
                <a
                  href={`#${section.id}`}
                  className="flex h-10 items-center gap-2 whitespace-nowrap rounded-xl border border-transparent px-3 text-sm font-semibold text-muted-foreground transition-colors hover:border-accent/15 hover:bg-accent/10 hover:text-accent"
                >
                  <span className="font-mono text-[10px] text-accent/70">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-background/90 to-transparent" />
        </div>

        <button
          type="button"
          onClick={() => move(1)}
          disabled={position.atEnd}
          aria-label="Show next policy sections"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-card text-foreground transition-all hover:border-accent/40 hover:text-accent disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}

export default function LegalDocumentPage({ document }) {
  const alternateHref = document.type === "Privacy Policy" ? "/terms" : "/privacy";
  const alternateLabel = document.type === "Privacy Policy" ? "Terms of Service" : "Privacy Policy";
  const documentUrl = `https://www.muhyotech.com/${document.slug}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: `${document.type} | Muhyo Tech`,
        description: document.description,
        url: documentUrl,
        datePublished: "2026-07-14",
        dateModified: "2026-07-14",
        inLanguage: "en",
        isPartOf: {
          "@type": "WebSite",
          name: "Muhyo Tech",
          url: "https://www.muhyotech.com",
        },
        publisher: {
          "@type": "Organization",
          name: "Muhyo Tech",
          url: "https://www.muhyotech.com",
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://www.muhyotech.com",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: document.type,
            item: documentUrl,
          },
        ],
      },
    ],
  };

  return (
    <main className="relative min-h-screen overflow-hidden py-22 text-foreground ">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <EditorialBackground text="Trust" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[42rem] bg-[radial-gradient(circle_at_15%_20%,color-mix(in_srgb,var(--accent)_15%,transparent),transparent_38%),radial-gradient(circle_at_85%_5%,color-mix(in_srgb,var(--accent)_10%,transparent),transparent_34%)]" />

      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <nav aria-label="Breadcrumb" className="mb-9 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <Link href="/" className="transition-colors hover:text-accent">Muhyo Tech</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground">{document.type}</span>
        </nav>

        <section className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-card/75 p-6 shadow-2xl shadow-black/10 backdrop-blur-xl sm:p-9 lg:p-12">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
          <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-end">
            <div>
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-accent">
                <ShieldCheck className="h-4 w-4" />
                Clear by design
              </div>
              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65 }}
                className="max-w-5xl text-5xl font-black leading-[0.95] tracking-[-0.055em] sm:text-7xl lg:text-[4.9rem] xl:text-[5.4rem]"
              >
                {document.title}
              </motion.h1>
              <p className="mt-7 max-w-3xl text-base font-medium leading-8 text-muted-foreground sm:text-lg">
                {document.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
              <div className="rounded-2xl border border-border/60 bg-background/55 p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <FileCheck2 className="h-4 w-4 text-accent" /> Effective
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{document.effectiveDate}</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/55 p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <Clock3 className="h-4 w-4 text-accent" /> Reading time
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{document.readTime}</p>
              </div>
            </div>
          </div>
        </section>

        <section aria-label="Policy highlights" className="mt-6 grid gap-4 md:grid-cols-3">
          {document.highlights.map((item, index) => {
            const Icon = ICONS[item.icon] || CheckCircle2;
            return (
              <motion.article
                key={item.title}
                {...reveal}
                transition={{ ...reveal.transition, delay: index * 0.06 }}
                className="rounded-2xl border border-border/60 bg-card/55 p-5 backdrop-blur-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 text-accent">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-base font-bold tracking-tight">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.text}</p>
              </motion.article>
            );
          })}
        </section>

        <SectionNavigator
          sections={document.sections}
          documentType={document.type}
        />

        <div className="mt-6 grid gap-5 xl:grid-cols-2">
          {document.sections.map((section, index) => {
            const Icon = ICONS[section.icon] || ScrollText;
            const textLength = (section.paragraphs || []).join(" ").length;
            const isCompact =
              section.compact ?? (!section.items?.length && textLength < 430);
            const useItemColumns = !isCompact && section.items?.length >= 6;
            return (
              <motion.section
                key={section.id}
                id={section.id}
                {...reveal}
                className={`scroll-mt-24 rounded-[1.75rem] border border-border/70 bg-card/60 p-6 shadow-sm backdrop-blur-md transition-colors hover:border-accent/25 sm:p-8 ${isCompact ? "xl:col-span-1" : "xl:col-span-2"
                  }`}
              >
                <div className="flex items-start gap-4 sm:gap-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10 text-accent">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h2 className="text-2xl font-black tracking-[-0.025em] sm:text-3xl">{section.title}</h2>
                      <span className="font-mono text-xs font-bold text-accent/60">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    {section.paragraphs?.map((paragraph) => (
                      <p key={paragraph} className="mt-4 text-[15px] leading-7 text-muted-foreground sm:text-base">
                        {paragraph}
                      </p>
                    ))}
                    {section.items?.length > 0 && (
                      <ul className={`mt-5 grid gap-3 ${useItemColumns ? "md:grid-cols-2 md:gap-x-8" : ""}`}>
                        {section.items.map((item) => (
                          <li key={item} className="flex gap-3 text-[15px] leading-7 text-muted-foreground sm:text-base">
                            <CheckCircle2 className="mt-1.5 h-4 w-4 shrink-0 text-accent" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {section.note && (
                      <div className="mt-6 rounded-2xl border border-accent/20 bg-accent/7 px-4 py-3 text-sm leading-6 text-foreground/80">
                        {section.note}
                      </div>
                    )}
                  </div>
                </div>
              </motion.section>
            );
          })}
        </div>

        <section className="mt-12 overflow-hidden rounded-[2rem] border border-accent/25 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--accent)_14%,var(--card)),var(--card))] p-7 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-accent">
                <Mail className="h-4 w-4" /> Transparency matters
              </div>
              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">Questions about these terms?</h2>
              <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
                Contact us before using a feature or starting a project if anything here is unclear.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href={alternateHref} className="inline-flex h-12 items-center justify-center rounded-xl border border-border bg-background/70 px-5 text-sm font-bold transition-colors hover:border-accent/40 hover:text-accent">
                {alternateLabel}
              </Link>
              <Link href="/contact" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-accent px-5 text-sm font-black text-accent-foreground transition-transform hover:-translate-y-0.5">
                Contact us <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <p className="mt-7 text-center text-xs leading-5 text-muted-foreground">
          Version {document.version} · Last updated {document.updatedDate} · Muhyo Tech, Lahore, Pakistan
        </p>
      </div>
    </main>
  );
}

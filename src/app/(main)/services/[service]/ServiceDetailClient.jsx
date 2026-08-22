import Link from "next/link";
import Image from "next/image";
import { getProjectMediaAlt, getServiceMediaAlt } from "@/lib/mediaAlt";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  CheckCircle2,
  ClipboardList,
  HelpCircle,
  MessageSquare,
  Rocket,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui";
import { getSafeImageSrc } from "@/lib/images/getSafeImageSrc";
import { getServiceSearchContent } from "@/lib/serviceSearchContent";
import {
  professionalCopy,
  defaultProblems,
  defaultDeliverables,
  defaultBenefits,
  defaultProcess,
  defaultClientRequirements,
  defaultTrustPoints,
  defaultFaq,
} from "@/lib/data";
import {
  FAQItem,
  HeroMotion,
  ListMotionCard,
  PreviewMotion,
  Reveal,
  ServiceBookingButton,
} from "./ServiceDetailInteractions";

const normalizeArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const itemTitle = (item) =>
  typeof item === "string" ? item : item?.title || item?.name || "";

const itemDescription = (item) =>
  typeof item === "string" ? "" : item?.description || "";

const itemWhyItHappens = (item, serviceTitle = "") => {
  if (typeof item === "object") {
    if (item.whyItHappens) return item.whyItHappens;
    if (item.cause) return item.cause;
    if (item.rootCause) return item.rootCause;
  }
  const title = (itemTitle(item) || "").toLowerCase();
  if (title.includes("brand") || title.includes("presence") || title.includes("outdated")) {
    return "Using generic templates, outdated visual hierarchy, or legacy code that fails to convey authority.";
  }
  if (title.includes("mobile") || title.includes("responsive") || title.includes("device")) {
    return "Rigid desktop-centric layouts, unoptimized touch targets, and viewport scaling issues on mobile.";
  }
  if (title.includes("lead") || title.includes("conversion") || title.includes("inquir") || title.includes("sales") || title.includes("flow")) {
    return "Hidden or unclear call-to-actions, complex multi-step forms, and lack of social proof or trust badges.";
  }
  if (title.includes("content") || title.includes("management") || title.includes("cms") || title.includes("update")) {
    return "No unified admin interface, requiring expensive developer intervention for even minor text/image edits.";
  }
  if (title.includes("speed") || title.includes("performance") || title.includes("vitals") || title.includes("slow")) {
    return "Bloated JavaScript bundles, uncompressed heavy assets, and missing edge caching / server-side rendering.";
  }
  if (title.includes("seo") || title.includes("search") || title.includes("visibility") || title.includes("ranking")) {
    return "Missing structured JSON-LD data, duplicate metadata tags, and poor semantic HTML heading hierarchy.";
  }
  if (title.includes("database") || title.includes("api") || title.includes("backend") || title.includes("security")) {
    return "Un-indexed queries, missing rate limiting, lack of data validation, and fragile third-party integrations.";
  }
  if (title.includes("maintenance") || title.includes("crash") || title.includes("bug") || title.includes("downtime")) {
    return "Unmaintained dependencies, lack of automated error logging, and absence of staging environments.";
  }
  return `Legacy architecture and un-optimized workflows limiting ${serviceTitle || "your business"} growth.`;
};

const itemHowWeSolveIt = (item, serviceTitle = "") => {
  if (typeof item === "object") {
    if (item.howWeSolveIt) return item.howWeSolveIt;
    if (item.solution) return item.solution;
    if (item.description) return item.description;
  }
  const title = (itemTitle(item) || "").toLowerCase();
  if (title.includes("brand") || title.includes("presence") || title.includes("outdated")) {
    return "We engineer a bespoke, modern interface with custom typography, clean dark/light themes, and premium micro-interactions.";
  }
  if (title.includes("mobile") || title.includes("responsive") || title.includes("device")) {
    return "We build with mobile-first fluid layouts, thumb-friendly navigation, and adaptive image assets for every screen size.";
  }
  if (title.includes("lead") || title.includes("conversion") || title.includes("inquir") || title.includes("sales") || title.includes("flow")) {
    return "We architect frictionless high-converting funnel pathways, strategic sticky CTAs, and instant form validations.";
  }
  if (title.includes("content") || title.includes("management") || title.includes("cms") || title.includes("update")) {
    return "We deliver an intuitive, role-based admin panel where your team can manage content in seconds with 0 code.";
  }
  if (title.includes("speed") || title.includes("performance") || title.includes("vitals") || title.includes("slow")) {
    return "We implement Next.js Server Components, WebP/AVIF media compression, and global CDN edge delivery for <1s load times.";
  }
  if (title.includes("seo") || title.includes("search") || title.includes("visibility") || title.includes("ranking")) {
    return "We inject automated Schema.org rich snippets, dynamic OpenGraph previews, and search-optimized semantic structure.";
  }
  if (title.includes("database") || title.includes("api") || title.includes("backend") || title.includes("security")) {
    return "We build robust REST/GraphQL endpoints with encrypted authentication, MongoDB indexing, and resilient webhooks.";
  }
  return `We implement an end-to-end custom engineering solution tailored specifically for ${serviceTitle || "your requirements"}.`;
};

const itemExpectedOutcome = (item, serviceTitle = "") => {
  if (typeof item === "object") {
    if (item.expectedOutcome) return item.expectedOutcome;
    if (item.outcome) return item.outcome;
    if (item.impact) return item.impact;
    if (item.result) return item.result;
  }
  const title = (itemTitle(item) || "").toLowerCase();
  if (title.includes("brand") || title.includes("presence") || title.includes("outdated")) {
    return "Instant credibility with visitors, premium market positioning, and higher client trust.";
  }
  if (title.includes("mobile") || title.includes("responsive") || title.includes("device")) {
    return "Flawless mobile user experience, 40%+ longer session duration, and drastically lower bounce rates.";
  }
  if (title.includes("lead") || title.includes("conversion") || title.includes("inquir") || title.includes("sales") || title.includes("flow")) {
    return "Measurable 2x–3x lift in qualified business inquiries and customer consultation bookings.";
  }
  if (title.includes("content") || title.includes("management") || title.includes("cms") || title.includes("update")) {
    return "100% independent content management with zero technical bottlenecks or recurring developer fees.";
  }
  if (title.includes("speed") || title.includes("performance") || title.includes("vitals") || title.includes("slow")) {
    return "95+ Google PageSpeed score, instant 0ms transitions, and peak SEO ranking competitiveness.";
  }
  if (title.includes("seo") || title.includes("search") || title.includes("visibility") || title.includes("ranking")) {
    return "Sustainable organic Google traffic growth and first-page rankings for key commercial queries.";
  }
  if (title.includes("database") || title.includes("api") || title.includes("backend") || title.includes("security")) {
    return "99.9% system uptime, airtight data protection, and sub-100ms backend processing speeds.";
  }
  return `Measurable improvements in speed, lead conversion, operational efficiency, and overall ROI.`;
};

const normalizeFaq = (value) =>
  normalizeArray(value).filter((item) => item?.question && item?.answer);

const SectionHeader = ({ eyebrow, title, description }) => (
  <div className="mb-8 max-w-3xl">
    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">
      {eyebrow}
    </p>
    <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">
      {title}
    </h2>
    {description && (
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
        {description}
      </p>
    )}
  </div>
);

export default function ServiceDetailClient({
  service,
  relatedProjects = [],
  relatedServices = [],
}) {
  const content = professionalCopy[service.slug] || {};
  const searchContent = getServiceSearchContent(service.slug);
  const displayTitle =
    searchContent?.h1 ||
    (service.slug === "maintenance-support"
      ? "Website Maintenance & Support in Pakistan"
      : service.title);
  const description =
    searchContent?.metaDescription ||
    service.shortDescription ||
    content.description ||
    service.description;
  const overview =
    service.overview ||
    service.fullDescription ||
    service.description ||
    content.description;
  const promise = content.promise || service.problemSolved || description;
  const problems = normalizeArray(service.problemsSolved).length
    ? normalizeArray(service.problemsSolved)
    : defaultProblems;
  const customDeliverables = [
    ...normalizeArray(service.deliverables),
    ...normalizeArray(service.features),
  ].filter((item, index, items) =>
    items.findIndex((candidate) => itemTitle(candidate) === itemTitle(item)) === index
  );
  const deliverables = customDeliverables.length ? customDeliverables : defaultDeliverables;
  const benefits = normalizeArray(service.benefits).length
    ? normalizeArray(service.benefits)
    : defaultBenefits;
  const process = normalizeArray(service.processSteps).length
    ? normalizeArray(service.processSteps)
    : normalizeArray(service.process).length
      ? normalizeArray(service.process)
      : defaultProcess;
  const baseFaq = normalizeFaq(service.faqs).length
    ? normalizeFaq(service.faqs)
    : normalizeFaq(service.faq).length
      ? normalizeFaq(service.faq)
      : defaultFaq;
  const faq = [...(searchContent?.faqs || []), ...baseFaq].filter(
    (item, index, items) =>
      items.findIndex((candidate) => candidate.question === item.question) ===
      index,
  );
  const techStack = normalizeArray(service.technologies).length
    ? normalizeArray(service.technologies)
    : normalizeArray(service.techStack);
  const clientRequirements = normalizeArray(service.clientRequirements).length
    ? normalizeArray(service.clientRequirements)
    : defaultClientRequirements;
  const highlights = normalizeArray(service.keyHighlights).length
    ? normalizeArray(service.keyHighlights).slice(0, 4)
    : [
      "Responsive experience",
      "Business-focused structure",
      "Clean implementation",
      "Custom quote after discussion",
    ];
  const banner = getSafeImageSrc(service.heroImage || service.banner || service.image, "/portfolio-hero.png");
  const deliveryNote =
    service.deliveryNote ||
    service.deliveryTime ||
    "Timeline is discussed after understanding the project requirements.";
  const ctaTitle = service.ctaTitle || "Ready to Discuss Your Project?";
  const ctaDescription =
    service.ctaDescription ||
    "Share your idea, business goal, or website requirement, and Muhyo Tech will guide you with the right solution.";
  const category = service.category || content.eyebrow || "Muhyo Tech Service";
  const bookCallHref = `/book-a-call?service=${encodeURIComponent(service.slug || "")}`;

  const outcomes = [
    "Better first impression",
    "Clearer visitor journey",
    "Stronger technical foundation",
    "Practical room to scale",
  ];

  return (
    <main className="min-h-screen text-foreground">
      <section className="relative overflow-hidden border-b border-border/50 ">
        <div className="absolute inset-0 " />

        <div className="relative mx-auto grid min-h-[calc(100svh-1px)] max-w-7xl grid-cols-1 items-center gap-12 px-6 py-24 lg:grid-cols-[minmax(0,1fr)_minmax(380px,520px)] lg:py-28">
          <HeroMotion className="lg:max-w-4xl">
            <Link
              href="/services"
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-bold text-muted-foreground shadow-lg shadow-accent/5 transition-colors hover:border-accent/50 hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to services
            </Link>

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-accent">
              <Sparkles className="h-3.5 w-3.5" />
              {category}
            </div>

            <h1 className="max-w-5xl text-5xl font-black leading-[0.98] tracking-tight text-foreground md:text-7xl">
              {displayTitle}
            </h1>
            <p className="mt-7 max-w-3xl text-lg font-medium leading-relaxed text-muted-foreground md:text-xl">
              {description}
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              {highlights.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-bold text-foreground shadow-sm shadow-accent/5"
                >
                  <CheckCircle2 className="h-4 w-4 text-accent" />
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <ServiceBookingButton service={service}>
                Book a Call
                <ArrowRight className="h-4 w-4" />
              </ServiceBookingButton>
              <Link href="/services">
                <Button variant="secondary">View All Services</Button>
              </Link>
              <Link href={bookCallHref}>
                <Button variant="outline">Book This Service</Button>
              </Link>
            </div>
          </HeroMotion>

          <PreviewMotion className="relative rounded-3xl border border-border bg-card p-4 shadow-2xl shadow-accent/10">
            <div className="absolute -inset-3 -z-10 rounded-3xl border border-accent/20 bg-accent/10 blur-2xl" />
            <div className="overflow-hidden rounded-2xl border border-border bg-background">
              <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-muted" />
                  <span className="h-2.5 w-2.5 rounded-full bg-muted" />
                  <span className="h-2.5 w-2.5 rounded-full bg-muted" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                  Service Preview
                </span>
              </div>

              <div className="relative aspect-[16/10] bg-muted">
                <Image
                  src={banner}
                  alt={getServiceMediaAlt({ ...service, title: displayTitle })}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 520px"
                  className="object-cover"
                />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {[category, ...techStack.slice(0, 3).map(itemTitle)]
                .filter(Boolean)
                .map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-bold text-muted-foreground"
                  >
                    {item}
                  </span>
                ))}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-border bg-background p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent">
                  Focus
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  Clear scope and delivery
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-background p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent">
                  Built For
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  Business growth
                </p>
              </div>
            </div>
          </PreviewMotion>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-16">
            <Reveal>
              <SectionHeader
                eyebrow="Service overview"
                title="What this service does for your business"
                description="This page explains the business value, the practical outputs, and the working process before you book a call."
              />
              <div className="rounded-2xl border border-border/60 bg-card/45 p-6 backdrop-blur-xl md:p-8">
                <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
                  {overview}
                </p>
                <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
                  Muhyo Tech helps businesses in Lahore, Pakistan and beyond
                  plan this service around real project scope, online presence,
                  and long-term digital growth.
                </p>
                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                  {[
                    "For businesses, startups, and professionals",
                    "Built around real project requirements",
                    "Focused on clear outcomes and conversion paths",
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-xl border border-border/60 bg-background/45 p-4"
                    >
                      <BadgeCheck className="mb-3 h-5 w-5 text-accent" />
                      <p className="text-sm font-bold leading-snug text-foreground/80">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            {searchContent && (
              <Reveal>
                <SectionHeader
                  eyebrow="Service expertise"
                  title={searchContent.sectionTitle}
                  description={`Clear guidance for businesses comparing ${searchContent.primaryKeyword} and related development options.`}
                />
                <div className="rounded-2xl border border-border/60 bg-card/45 p-6 backdrop-blur-xl md:p-8">
                  <div className="space-y-5">
                    {searchContent.paragraphs.map((paragraph) => (
                      <p
                        key={paragraph}
                        className="text-base leading-relaxed text-muted-foreground md:text-lg"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                  <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
                    {searchContent.idealFor.map((item) => (
                      <article
                        key={item.title}
                        className="rounded-xl border border-border/60 bg-background/45 p-5"
                      >
                        <Target className="mb-4 h-5 w-5 text-accent" />
                        <h3 className="text-base font-bold text-foreground">
                          {item.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          {item.description}
                        </p>
                      </article>
                    ))}
                  </div>
                </div>
              </Reveal>
            )}

            {/* NEW SECTION 1: Who Needs This Service & Key Triggers */}
            {(service.targetAudienceProfiles?.length > 0 || service.buyerIntentTriggers?.length > 0) && (
              <Reveal>
                <SectionHeader
                  eyebrow="Target Audience & Intent"
                  title="Who Needs This Service & When"
                  description="Identify if your business goals, current setup, or growth stage align with this service."
                />
                <div className="space-y-6">
                  {service.targetAudienceProfiles?.length > 0 && (
                    <div className="rounded-2xl border border-border/60 bg-card/45 p-6 backdrop-blur-xl md:p-8 space-y-4">
                      <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                        <Target className="h-5 w-5 text-accent" /> Ideal Business Profiles
                      </h3>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {service.targetAudienceProfiles.map((aud, index) => (
                          <div key={index} className="rounded-xl border border-border/60 bg-background/45 p-4 space-y-1.5">
                            <span className="rounded bg-accent/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-accent">
                              {aud.role || "Target Role"}
                            </span>
                            <p className="text-sm font-semibold text-foreground/90">{aud.label || aud}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {service.buyerIntentTriggers?.length > 0 && (
                    <div className="rounded-2xl border border-border/60 bg-card/45 p-6 backdrop-blur-xl md:p-8 space-y-4">
                      <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                        <Zap className="h-5 w-5 text-accent" /> Key Trigger Events
                      </h3>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {service.buyerIntentTriggers.map((trigger, index) => (
                          <div key={index} className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/45 p-4">
                            <CheckCircle2 className="h-5 w-5 shrink-0 text-accent" />
                            <p className="text-sm font-medium text-foreground/80">{trigger}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Reveal>
            )}

            {/* NEW SECTION 2: Common Buyer Objections & AI Clarifications */}
            {service.commonObjections?.length > 0 && (
              <Reveal>
                <SectionHeader
                  eyebrow="Decision Support"
                  title="Common Doubts & Direct Answers"
                  description="Addressing key technical and strategic questions before you book your consultation."
                />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {service.commonObjections.map((obj, index) => (
                    <div key={index} className="rounded-2xl border border-border/60 bg-card/45 p-6 space-y-3">
                      <h4 className="text-base font-bold text-foreground flex items-start gap-2">
                        <HelpCircle className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
                        {obj.objection || obj}
                      </h4>
                      {obj.response && (
                        <p className="text-sm leading-relaxed text-muted-foreground pl-7 border-l-2 border-accent/30">
                          {obj.response}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </Reveal>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <div className="rounded-2xl border border-border/60 bg-card/70 p-6 shadow-xl backdrop-blur-xl">
              <div className="flex items-center gap-1 text-accent">
                {[1, 2, 3, 4, 5].map((item) => (
                  <Star key={item} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <h3 className="mt-5 text-2xl font-bold tracking-tight">
                Ready to make this service work for your business?
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Share your idea, current challenge, or website link. We will map
                the best next step and keep the plan practical.
              </p>

              <div className="mt-6 space-y-3">
                <ServiceBookingButton service={service} className="w-full">
                  Book a Call
                  <Zap className="h-4 w-4" />
                </ServiceBookingButton>
                <Link href={bookCallHref} className="block">
                  <Button variant="secondary" className="w-full">
                    Book This Service
                  </Button>
                </Link>
                <Link href="/projects" className="block">
                  <Button variant="outline" className="w-full">
                    View related work
                  </Button>
                </Link>
              </div>

              <div className="mt-6 rounded-xl border border-accent/15 bg-accent/10 p-4">
                <div className="flex gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                  <p className="text-xs font-semibold leading-relaxed text-foreground/75">
                    {service.quoteNote || "Pricing depends on requirements, features, timeline, and scope. Book a call to receive a custom quote."}
                  </p>
                </div>
              </div>
            </div>
          </aside>

          <div className="space-y-16 lg:col-span-2">
            <Reveal>
              <SectionHeader
                eyebrow="Business problems"
                title="Problems This Service Helps Solve"
              />
              <div className="space-y-4">
                {problems.map((problem) => (
                  <div
                    key={itemTitle(problem)}
                    className="rounded-2xl border border-border/60 bg-card/45 p-6 backdrop-blur-xl space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-rose-500/15 text-rose-300 border border-rose-500/30 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                        Business Challenge
                      </span>
                      <h4 className="text-base font-bold text-foreground">{itemTitle(problem)}</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-xs">
                      <div className="rounded-xl border border-border/40 bg-background/50 p-3">
                        <span className="font-bold text-muted-foreground uppercase text-[9px] block mb-1">Why It Happens</span>
                        <span className="text-foreground/90 font-medium leading-relaxed">
                          {itemWhyItHappens(problem, service.title)}
                        </span>
                      </div>
                      <div className="rounded-xl border border-accent/20 bg-accent/5 p-3">
                        <span className="font-bold text-accent uppercase text-[9px] block mb-1">How We Solve It</span>
                        <span className="text-foreground/90 font-medium leading-relaxed">
                          {itemHowWeSolveIt(problem, service.title)}
                        </span>
                      </div>
                      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                        <span className="font-bold text-emerald-400 uppercase text-[9px] block mb-1">Expected Outcome</span>
                        <span className="text-foreground/90 font-medium leading-relaxed">
                          {itemExpectedOutcome(problem, service.title)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal className="rounded-2xl border border-border/60 bg-foreground/[0.02] p-6 md:p-8">
              <SectionHeader
                eyebrow="What you get"
                title="Practical deliverables built for real users"
                description="Depending on your project requirements, this service can include..."
              />
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {deliverables.map((feature) => (
                  <div
                    key={itemTitle(feature)}
                    className="flex items-center gap-4 rounded-xl border border-border/60 bg-card/60 p-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-foreground/85">
                        {itemTitle(feature)}
                      </span>
                      {itemDescription(feature) && (
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          {itemDescription(feature)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal>
              <SectionHeader
                eyebrow="Key benefits"
                title="The business value behind the build"
              />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {benefits.map((benefit, index) => (
                  <ListMotionCard
                    key={itemTitle(benefit)}
                    delay={index * 0.04}
                    className="rounded-2xl border border-border/60 bg-card/45 p-5 transition-colors hover:border-accent/35"
                  >
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
                      <Rocket className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-bold tracking-tight">
                      {itemTitle(benefit)}
                    </h3>
                    {itemDescription(benefit) && (
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {itemDescription(benefit)}
                      </p>
                    )}
                  </ListMotionCard>
                ))}
              </div>
            </Reveal>

            <Reveal>
              <SectionHeader
                eyebrow="Work process"
                title="A clear path from idea to launch"
                description={deliveryNote}
              />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {process.map((step, index) => (
                  <ListMotionCard
                    key={`${step.title}-${index}`}
                    delay={index * 0.06}
                    className="rounded-2xl border border-border/60 bg-card/45 p-6 transition-colors hover:border-accent/35"
                  >
                    <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-sm font-black text-accent">
                      0{index + 1}
                    </div>
                    <h3 className="text-xl font-bold tracking-tight">
                      {step.title || step}
                    </h3>
                    {step.description && (
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {step.description}
                      </p>
                    )}
                  </ListMotionCard>
                ))}
              </div>
            </Reveal>

            {techStack.length > 0 && (
              <Reveal>
                <SectionHeader
                  eyebrow="Technology stack"
                  title="Technologies that may be used"
                  description="The exact stack is selected around the selected service, project requirements, performance needs, and long-term maintainability."
                />
                <div className="mt-5 flex flex-wrap gap-3">
                  {techStack.map((tech) => (
                    <span
                      key={itemTitle(tech)}
                      className="rounded-xl border border-border/70 bg-card/45 px-4 py-3 text-sm font-bold text-foreground/75"
                    >
                      {itemTitle(tech)}
                    </span>
                  ))}
                </div>
              </Reveal>
            )}

            <Reveal>
              <SectionHeader
                eyebrow="Client preparation"
                title="What We Need From You"
              />
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {clientRequirements.map((item, index) => (
                  <div
                    key={`${itemTitle(item)}-${index}`}
                    className="flex items-center gap-4 rounded-xl border border-border/60 bg-card/45 p-4"
                  >
                    <ClipboardList className="h-5 w-5 shrink-0 text-accent" />
                    <div>
                      <span className="text-sm font-bold text-foreground/85">
                        {itemTitle(item)}
                      </span>
                      {itemDescription(item) && (
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          {itemDescription(item)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>

            {relatedServices.length > 0 && (
              <Reveal>
                <SectionHeader
                  eyebrow="Related services"
                  title="Services That Work Well With This"
                  description="Explore connected Muhyo Tech services that can support the same website, app, dashboard, or business workflow."
                />
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  {relatedServices.map((relatedService) => (
                    <Link
                      key={relatedService.slug || relatedService._id || relatedService.title}
                      href={`/services/${relatedService.slug || relatedService._id}`}
                      className="group rounded-2xl border border-border/60 bg-card/45 p-5 transition-colors hover:border-accent/35"
                    >
                      <h3 className="text-xl font-bold tracking-tight">
                        {relatedService.title}
                      </h3>
                      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                        {relatedService.shortDescription || relatedService.description}
                      </p>
                      <div className="mt-5 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-accent">
                        View Service <ArrowRight className="h-4 w-4" />
                      </div>
                    </Link>
                  ))}
                </div>
              </Reveal>
            )}

            <Reveal>
              <SectionHeader
                eyebrow="Related work"
                title="Related Projects"
                description="A few relevant examples from the Muhyo Tech project library."
              />
              {relatedProjects.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {relatedProjects.map((project) => (
                    <Link
                      key={project.slug || project._id || project.title}
                      href={`/projects/${project.slug || project._id}`}
                      className="group overflow-hidden rounded-2xl border border-border/70 bg-card shadow-lg shadow-accent/5 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-xl hover:shadow-accent/10"
                    >
                      <div className="grid grid-cols-[116px_minmax(0,1fr)] gap-0">
                        <div className="relative min-h-36 overflow-hidden bg-muted">
                          <Image
                            src={getSafeImageSrc(project.thumbnail || project.thumbnailImage || project.image)}
                            alt={getProjectMediaAlt(project)}
                            fill
                            loading="lazy"
                            sizes="116px"
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        </div>

                        <div className="flex min-h-36 flex-col p-4">
                          {(project.category || project.purpose) && (
                            <span className="mb-2 w-fit rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-accent">
                              {project.category || project.purpose}
                            </span>
                          )}
                          <h3 className="line-clamp-2 text-base font-bold tracking-tight text-foreground">
                            {project.title}
                          </h3>
                          {project.description && (
                            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                              {project.description}
                            </p>
                          )}
                          <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                            <div className="flex min-w-0 flex-wrap gap-1.5">
                              {normalizeArray(project.techStack)
                                .slice(0, 2)
                                .map((tech, techIndex) => (
                                  <span
                                    key={`${itemTitle(tech)}-${techIndex}`}
                                    className="rounded-full border border-border bg-background px-2 py-0.5 text-[9px] font-bold text-muted-foreground"
                                  >
                                    {itemTitle(tech)}
                                  </span>
                                ))}
                            </div>
                            <ArrowRight className="h-4 w-4 shrink-0 text-accent transition-transform group-hover:translate-x-1" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-xl shadow-accent/5 md:p-8">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_auto] md:items-center">
                    <div>
                      <h3 className="text-2xl font-bold tracking-tight text-foreground">
                        Need examples for this service?
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        Explore the Muhyo Tech project library or contact us to
                        discuss the most relevant work for your project type.
                      </p>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Link href="/projects">
                        <Button variant="secondary">View Projects</Button>
                      </Link>
                      <Link href="/contact">
                        <Button variant="outline">Contact Muhyo Tech</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </Reveal>

            <Reveal>
              <SectionHeader
                eyebrow="Trust"
                title="Why Choose Muhyo Tech"
                description="Muhyo Tech focuses on building practical, modern, and scalable web solutions for businesses, startups, and professionals."
              />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {defaultTrustPoints.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-4 rounded-xl border border-border/60 bg-card/45 p-4"
                  >
                    <ShieldCheck className="h-5 w-5 shrink-0 text-accent" />
                    <span className="text-sm font-bold text-foreground/85">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </Reveal>

            {service.intelligence?.blogSupport?.blogs?.length > 0 && (
              <Reveal>
                <SectionHeader
                  eyebrow="Knowledge & Authority"
                  title="Supporting Articles & Technical Guides"
                  description="In-depth articles from the Muhyo Tech engineering library explaining concepts related to this service."
                />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {service.intelligence.blogSupport.blogs.map((article) => (
                    <Link
                      key={article.slug || article._id}
                      href={`/blog/${article.slug}`}
                      className="group rounded-2xl border border-border/60 bg-card/45 p-5 transition-colors hover:border-accent/35"
                    >
                      <span className="rounded bg-accent/10 border border-accent/20 px-2 py-0.5 text-[8px] font-bold text-accent uppercase">
                        {article.authorityRole || "TECHNICAL GUIDE"}
                      </span>
                      <h3 className="mt-2 text-base font-bold tracking-tight text-foreground group-hover:text-accent transition-colors">
                        {article.title}
                      </h3>
                      <div className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-accent">
                        Read Guide <ArrowRight className="h-3.5 w-3.5" />
                      </div>
                    </Link>
                  ))}
                </div>
              </Reveal>
            )}

            <Reveal>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <HelpCircle className="h-5 w-5" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight">
                  Common questions
                </h2>
              </div>
              <div className="space-y-3">
                {faq.map((item) => (
                  <FAQItem
                    key={item.question}
                    question={item.question}
                    answer={item.answer}
                  />
                ))}
              </div>
            </Reveal>

            <Reveal className="rounded-2xl border border-accent/20 bg-accent/10 p-8 text-center md:p-12">
              <BookOpenCheck className="mx-auto mb-5 h-10 w-10 text-accent" />
              <h2 className="text-3xl font-black tracking-tight md:text-5xl">
                {ctaTitle}
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
                {ctaDescription}
              </p>
              <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                <ServiceBookingButton service={service}>
                  {service.ctaPrimaryText || "Book a Call for a Custom Quote"}
                  <ArrowRight className="h-4 w-4" />
                </ServiceBookingButton>
                <Link href={bookCallHref}>
                  <Button variant="secondary">{service.ctaSecondaryText || "Book a Call Page"}</Button>
                </Link>
                <Link
                  href={`https://wa.me/923224458481?text=${encodeURIComponent(`Hello! I want to discuss ${service.title}.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline">Send Message</Button>
                </Link>
                <Link href="/projects">
                  <Button variant="secondary">View Projects</Button>
                </Link>
              </div>
            </Reveal>

          </div>
        </div>
      </section>

    </main>
  );
}

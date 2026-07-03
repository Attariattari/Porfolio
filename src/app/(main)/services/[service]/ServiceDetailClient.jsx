"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  MessageSquare,
  Minus,
  Plus,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui";

const professionalCopy = {
  "web-development": {
    eyebrow: "Performance Web Engineering",
    description:
      "Launch a fast, conversion-focused website built with clean architecture, strong SEO foundations, and a polished user experience that helps visitors trust your brand quickly.",
    promise:
      "A modern web platform that feels premium, loads quickly, ranks better, and makes it easier for customers to take action.",
  },
  "ui-ux-design": {
    eyebrow: "Product Design & UX Strategy",
    description:
      "Turn complex ideas into clear, elegant interfaces with thoughtful user journeys, refined visuals, and practical design systems your team can keep using.",
    promise:
      "A smoother experience that reduces confusion, improves engagement, and makes your product feel easier to understand from the first visit.",
  },
  "api-development": {
    eyebrow: "Backend Systems & APIs",
    description:
      "Build secure APIs, dashboards, databases, and automation flows that keep your product reliable as users, data, and business operations grow.",
    promise:
      "A dependable backend foundation that reduces manual work, protects sensitive data, and gives your frontend the speed it needs.",
  },
  "mobile-app-development": {
    eyebrow: "Mobile Product Development",
    description:
      "Create polished iOS and Android experiences with smooth flows, reliable performance, and the features users expect from a modern mobile product.",
    promise:
      "A mobile app experience that keeps your brand close to users and supports daily engagement without feeling heavy or confusing.",
  },
  "cloud-devops": {
    eyebrow: "Cloud Infrastructure & DevOps",
    description:
      "Stabilize releases, automate deployments, and prepare your application for growth with secure cloud infrastructure and practical monitoring.",
    promise:
      "A calmer engineering workflow with fewer deployment risks, better uptime, and infrastructure that can scale with demand.",
  },
  "seo-digital-growth": {
    eyebrow: "SEO & Growth Systems",
    description:
      "Improve visibility with technical SEO, content structure, analytics, and conversion improvements that help the right customers find and trust you.",
    promise:
      "A stronger growth foundation that brings qualified traffic, clearer insights, and more useful paths from search to conversion.",
  },
};

const defaultProcess = [
  {
    title: "Discovery & Direction",
    description:
      "We clarify your goals, audience, current bottlenecks, and success metrics before choosing the right technical path.",
  },
  {
    title: "Experience & Architecture",
    description:
      "We map user flows, data needs, integrations, and page structure so the final product is easy to use and easy to maintain.",
  },
  {
    title: "Build & Refine",
    description:
      "We implement the solution with clean code, responsive design, performance care, and regular review points.",
  },
  {
    title: "Launch & Improve",
    description:
      "We test, deploy, monitor, and leave you with a stable foundation for future improvements.",
  },
];

const defaultFaq = [
  {
    question: "Can this be customized for my business?",
    answer:
      "Yes. Every service is shaped around your goals, audience, timeline, and existing systems.",
  },
  {
    question: "Do you help after launch?",
    answer:
      "Yes. We can support maintenance, improvements, performance checks, content updates, and new feature work.",
  },
];

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-border/60 bg-card/45 px-5 py-4 backdrop-blur-xl">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-4 text-left"
      >
        <span className="text-sm font-bold text-foreground md:text-base">
          {question}
        </span>
        {isOpen ? (
          <Minus className="h-4 w-4 shrink-0 text-accent" />
        ) : (
          <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        className="overflow-hidden"
      >
        <p className="pt-4 text-sm leading-relaxed text-muted-foreground">
          {answer}
        </p>
      </motion.div>
    </div>
  );
};

export default function ServiceDetailClient({ service }) {
  const content = professionalCopy[service.slug] || {};
  const description = content.description || service.description;
  const promise = content.promise || service.problemSolved;
  const process = service.process?.length ? service.process : defaultProcess;
  const features = service.features?.length ? service.features : service.benefits || [];
  const faq = service.faq?.length ? service.faq : defaultFaq;
  const techStack = service.techStack?.length ? service.techStack : [];
  const banner = service.banner || service.image || "/portfolio-hero.png";

  const outcomes = useMemo(
    () => [
      "Clearer user journeys",
      "Stronger technical foundation",
      "Better launch confidence",
      "Room to scale later",
    ],
    [],
  );

  return (
    <main className="min-h-screen text-foreground">
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0">
          <img src={banner} alt={service.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/88 to-background/35" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
        </div>

        <div className="relative mx-auto grid min-h-[720px] max-w-7xl grid-cols-1 items-end gap-12 px-6 pb-16 pt-28 lg:grid-cols-[minmax(0,1fr)_420px] lg:pb-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <Link
              href="/services"
              className="mb-8 inline-flex items-center gap-2 rounded-xl border border-border/70 bg-card/55 px-4 py-2 text-xs font-bold text-muted-foreground backdrop-blur-xl transition-colors hover:border-accent/40 hover:text-accent"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to services
            </Link>

            <div className="mb-5 inline-flex items-center gap-2 rounded-lg border border-accent/20 bg-accent/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-accent">
              <Sparkles className="h-3.5 w-3.5" />
              {content.eyebrow || "Muhyo Tech Service"}
            </div>

            <h1 className="max-w-5xl text-5xl font-black leading-[0.98] tracking-tight text-foreground md:text-7xl">
              {service.title}
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              {description}
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link href="/contact">
                <Button>
                  Start this project
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link
                href={`https://wa.me/923224458481?text=${encodeURIComponent(`Hello! I want to discuss ${service.title}.`)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline">
                  Quick WhatsApp
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="rounded-2xl border border-white/10 bg-card/70 p-6 shadow-2xl backdrop-blur-2xl"
          >
            <div className="flex items-center gap-3 border-b border-border/60 pb-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <Target className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">
                  Best for
                </p>
                <p className="text-sm font-bold text-foreground">
                  Businesses ready to improve results
                </p>
              </div>
            </div>

            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              {promise}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {outcomes.map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-border/60 bg-background/45 p-3"
                >
                  <CheckCircle2 className="mb-2 h-4 w-4 text-accent" />
                  <p className="text-xs font-bold leading-snug text-foreground/80">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </motion.aside>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-16">
            <section>
              <div className="mb-8 flex items-end justify-between gap-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">
                    Delivery process
                  </p>
                  <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">
                    A clear path from idea to launch
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {process.map((step, index) => (
                  <motion.div
                    key={`${step.title}-${index}`}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.06 }}
                    className="rounded-2xl border border-border/60 bg-card/45 p-6 transition-colors hover:border-accent/35"
                  >
                    <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-sm font-black text-accent">
                      0{index + 1}
                    </div>
                    <h3 className="text-xl font-bold tracking-tight">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-border/60 bg-foreground/[0.02] p-6 md:p-8">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">
                What you get
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
                Practical deliverables built for real users
              </h2>

              <div className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-2">
                {features.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-4 rounded-xl border border-border/60 bg-card/60 p-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-bold text-foreground/85">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {techStack.length > 0 && (
              <section>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">
                  Technology stack
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  {techStack.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-xl border border-border/70 bg-card/45 px-4 py-3 text-sm font-bold text-foreground/75"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </section>
            )}

            <section>
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
            </section>
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
                <Link href="/contact" className="block">
                  <Button className="w-full">
                    Book a project call
                    <Zap className="h-4 w-4" />
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
                    Built with clean implementation, launch care, and a focus on
                    measurable business value.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

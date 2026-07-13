"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  HelpCircle,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import BookingForm from "@/components/bookings/BookingForm";
import EditorialBackground from "@/components/ui/EditorialBackground";
import { Button } from "@/components/ui";

const callFor = [
  "Custom Website Development",
  "Full-Stack Web App",
  "Admin Dashboard",
  "Website Redesign",
  "API / Database Integration",
  "SEO-Friendly Website Setup",
];

const nextSteps = [
  "Submit Your Details",
  "Requirement Review",
  "Project Discussion",
  "Custom Quote / Next Step",
];

const preparation = [
  "Project idea or business goal",
  "Pages/features you need",
  "Reference websites if available",
  "Logo/brand details if available",
  "Existing website link if redesign",
  "Domain/hosting details if available",
  "Timeline expectations",
];

const faqs = [
  ["Is the project discussion free?", "Yes. The discussion helps understand your requirements and the right next step before any project scope is finalized."],
  ["What should I share before booking?", "Share your project idea, business goal, required pages/features, references, and any existing website link if available."],
  ["Can I discuss a website redesign?", "Yes. You can discuss redesign goals, current website issues, content structure, performance, and conversion improvements."],
  ["Can you build admin dashboards?", "Yes. Muhyo Tech can plan and build dashboards for content, leads, bookings, users, analytics, and custom workflows."],
  ["Can you connect APIs and databases?", "Yes. Projects can include API integrations, MongoDB, authentication, file uploads, email, payments, and internal systems."],
  ["Do you help with deployment?", "Yes. Deployment support, domain guidance, hosting setup, and launch checks can be discussed based on project scope."],
  ["How is pricing decided?", "Pricing depends on project scope, features, timeline, and level of customization. After reviewing your requirements, Muhyo Tech can guide you with a custom quote."],
  ["How long does a project take?", "Timeline depends on project size, content readiness, integrations, revisions, and technical requirements."],
  ["Can I select a specific service?", "Yes. Choose the service that best matches your project. If you are not sure, select the closest option and explain your goal in the message."],
  ["What happens after I submit the form?", "After reviewing your message, I'll guide you with the right approach based on your project scope and requirements."],
];

const badges = ["Project Discussion", "Web Development", "Full-Stack Solutions", "Custom Quote"];

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-border/60 bg-card/45 p-5 backdrop-blur-xl">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-4 text-left"
      >
        <span className="text-sm font-bold text-foreground md:text-base">{question}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-accent transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{answer}</p>}
    </div>
  );
}

export default function BookCallClient({ initialServiceSlug = "" }) {
  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-8">
      <EditorialBackground text="BOOK CALL" />

      <section className="relative z-10 mx-auto grid min-h-[70vh] max-w-7xl items-center gap-12 lg:grid-cols-[1fr_420px]">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-4 py-2 text-xs font-bold text-accent">
            <Sparkles className="h-4 w-4" />
            Strategy call booking
          </div>
          <h1 className="text-5xl font-black leading-tight tracking-tight text-foreground md:text-7xl">
            Let&apos;s Discuss Your Project
          </h1>
          <p className="mt-6 max-w-2xl text-base font-medium leading-relaxed text-muted-foreground md:text-lg">
            Share your project idea, requirements, or business goal, and Muhyo Tech will guide you with the right web solution.
          </p>
          <div className="mt-7 flex flex-wrap gap-2">
            {badges.map((badge) => (
              <span key={badge} className="rounded-full border border-border/60 bg-card/60 px-4 py-2 text-xs font-bold text-foreground/80">
                {badge}
              </span>
            ))}
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#booking-form">
              <Button className="w-full sm:w-auto">
                Fill Booking Form
                <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
            <Link href="/services">
              <Button variant="outline" className="w-full sm:w-auto">
                View Services
              </Button>
            </Link>
          </div>
        </div>

        <aside className="rounded-2xl border border-border/60 bg-card/55 p-6 shadow-xl backdrop-blur-xl">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            What this call is for
          </h2>
          <div className="mt-6 space-y-4">
            {callFor.map((item) => (
              <div key={item} className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                <span className="text-sm font-semibold text-foreground/80">{item}</span>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section id="booking-form" className="relative z-10 mx-auto grid max-w-7xl gap-10 py-16 lg:grid-cols-[380px_1fr]">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">
            Booking Form
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-5xl">
            Share the details
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            The same booking form is used across quick popups and this dedicated page, so every request goes into the same admin dashboard.
          </p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card/55 p-6 shadow-xl backdrop-blur-xl md:p-8">
          <BookingForm
            initialServiceSlug={initialServiceSlug}
            source="page"
            sourcePage="/book-a-call"
            submitLabel="Submit Booking Request"
          />
        </div>
      </section>

      <section className="relative z-10 mx-auto grid max-w-7xl gap-8 py-12 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-card/45 p-6 md:p-8">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">What Happens Next</h2>
          <div className="mt-6 grid gap-4">
            {nextSteps.map((step, index) => (
              <div key={step} className="flex gap-4 rounded-xl border border-border/60 bg-background/35 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-sm font-black text-accent">
                  {index + 1}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">{step}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    After reviewing your message, I&apos;ll guide you with the right approach based on your project scope and requirements.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card/45 p-6 md:p-8">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">What to Prepare Before Booking</h2>
          <div className="mt-6 grid gap-3">
            {preparation.map((item) => (
              <div key={item} className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                <span className="text-sm font-semibold text-foreground/80">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl py-12">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <HelpCircle className="h-5 w-5" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Common Questions</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {faqs.map(([question, answer]) => (
            <FAQItem key={question} question={question} answer={answer} />
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl py-12">
        <div className="rounded-2xl border border-accent/20 bg-accent/10 p-8 text-center md:p-12">
          <MessageSquare className="mx-auto mb-5 h-10 w-10 text-accent" />
          <h2 className="text-3xl font-black tracking-tight text-foreground md:text-5xl">
            Prefer a quick message?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            You can also share your project idea through WhatsApp or the contact form if a call is not the right first step.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href="https://wa.me/923224458481?text=Hi MuhyoTech! I'd like to discuss a new project."
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="w-full sm:w-auto">WhatsApp Muhyo Tech</Button>
            </a>
            <Link href="/contact">
              <Button variant="outline" className="w-full sm:w-auto">Contact Page</Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

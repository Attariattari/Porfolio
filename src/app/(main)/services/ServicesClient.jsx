"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Services from "@/components/Services";
import { SectionWrapper, Card, Button } from "@/components/ui";
import {
  Zap,
  Rocket,
  ArrowRight,
  Shield,
  Laptop,
  MessageSquare,
  Monitor,
  Code,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getServiceMediaAlt } from "@/lib/mediaAlt";
import EditorialBackground from "@/components/ui/EditorialBackground";
import dynamic from "next/dynamic";
import {
  servicesAudienceCards,
  servicesPageFaqs,
  servicesTechnologyGroups,
} from "@/lib/servicesSeo";

const BookingModal = dynamic(() => import("@/components/BookingModal"), {
  ssr: false,
});

const IconMap = {
  Zap,
  Shield,
  Laptop,
  Rocket,
  MessageSquare,
  Monitor,
  Code,
};

const resolveIcon = (icon) => {
  if (typeof icon === "string") return IconMap[icon] || Zap;
  return icon;
};

const ServiceSlider = ({ services }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const serviceCount = services?.length || 0;

  useEffect(() => {
    if (serviceCount === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % serviceCount);
    }, 5000);

    return () => clearInterval(timer);
  }, [serviceCount]);

  if (!services || services.length === 0) return null;

  return (
    <div className="relative w-full max-w-[600px] mx-auto group/img-side">
      {/* Accent glow — same as Portfolio image side */}
      <div className="absolute inset-0 bg-accent/20 blur-[40px] rounded-full scale-90 animate-pulse -z-10" />

      <div className="theme-media-frame relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-border/70 bg-background">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            {/* Background image with animated scale-in — OPTIMIZED with Next/Image */}
            <motion.div
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="absolute inset-0"
            >
              {(services[currentIndex].heroImage ||
                services[currentIndex].banner ||
                services[currentIndex].image) && (
                <Image
                  src={
                    services[currentIndex].heroImage ||
                    services[currentIndex].banner ||
                    services[currentIndex].image
                  }
                  alt={getServiceMediaAlt(services[currentIndex])}
                  fill
                  sizes="(max-width: 768px) 100vw, 600px"
                  className="object-cover transition-transform duration-1000 group-hover/img-side:scale-110"
                  loading="lazy"
                />
              )}
              {/* Dark gradient overlay */}
              <div className="theme-media-gradient absolute inset-0 z-10" />
              <div className="theme-media-tint absolute inset-0 z-10" />
            </motion.div>

            {/* Overlay content at bottom — same structure as Portfolio */}
            <div className="absolute inset-0 p-8 md:p-10 flex flex-col justify-end pointer-events-none z-20">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.4,
                  duration: 0.8,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="relative z-10 pointer-events-auto"
              >
                {/* Accent badge — same as Portfolio category badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/90 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-[0.3em] mb-4 shadow-xl">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  Service {currentIndex + 1}
                </div>
                {/* Title — same as Portfolio */}
                <h3 className="text-2xl md:text-3xl font-black text-white mb-4 leading-[1.1] tracking-tighter drop-shadow-2xl">
                  {services[currentIndex].title}
                </h3>
                {/* Description — same italic border-l style as Portfolio */}
                <p className="text-white/70 text-xs md:text-sm line-clamp-2 italic font-medium border-l-2 border-accent/50 pl-3 mb-6">
                  &quot;{services[currentIndex].shortDescription || services[currentIndex].description}&quot;
                </p>
                <Link
                  href={`/services/${services[currentIndex].slug || services[currentIndex]._id}`}
                >
                  <motion.div
                    whileHover={{ x: 10 }}
                    className="flex items-center gap-3 text-accent font-black uppercase tracking-[0.2em] text-[10px] md:text-xs bg-white/5 w-fit px-4 py-2 rounded-lg backdrop-blur-sm border border-white/10"
                  >
                    Experience details <ArrowRight className="w-5 h-5" />
                  </motion.div>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation dots */}
        <div className="absolute top-8 right-8 flex flex-col gap-3">
          {services.map((_, idx) => (
            <button
              key={idx}
              type="button"
              aria-label={`Show service ${idx + 1}: ${services[idx].title}`}
              aria-current={idx === currentIndex ? "true" : undefined}
              onClick={() => setCurrentIndex(idx)}
              className="group relative h-12 w-1 flex items-center justify-center cursor-pointer"
            >
              <div className="h-full w-full bg-white/20 rounded-full overflow-hidden transition-all group-hover:bg-white/40">
                {idx === currentIndex && (
                  <div
                    key={currentIndex}
                    className="service-slider-progress absolute inset-x-0 top-0 bg-accent"
                  />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Glass reflection — same as Portfolio */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none z-30" />
      </div>
    </div>
  );
};

export default function ServicesClient({ services, pageData }) {
  const { serviceFeatures, serviceProcess, servicesPage } = pageData;
  const { hero, stats, cta: servicesCta } = servicesPage;
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState("");

  const openBooking = (service = "") => {
    setSelectedService(service);
    setBookingOpen(true);
  };

  return (
    <div className="min-h-screen pt-0">
      <section className="relative min-h-[80vh] flex items-center pt-14 pb-14 overflow-hidden">
        <EditorialBackground text="SERVICES" />
        <div className="max-w-7xl mx-auto px-4 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h4 className="text-accent text-sm font-black uppercase tracking-[0.5em] mb-6 flex items-center gap-4">
                <span className="w-12 h-[1px] bg-accent opacity-50"></span>
                {hero.badge}
              </h4>
              <h1 className="text-5xl md:text-7xl font-black text-foreground mb-8 leading-tight tracking-tighter">
                {hero.title}
              </h1>
              <p className="max-w-xl text-muted-foreground text-lg mb-10">
                {hero.description}
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={() =>
                    document
                      .getElementById("services")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Explore Services <ArrowRight className="w-5 h-5 inline" />
                </Button>
                <Button variant="outline" onClick={() => openBooking()}>
                  Book a Call
                </Button>
              </div>
            </motion.div>
            <div className="relative z-10">
              <ServiceSlider services={services} />
            </div>
          </div>
        </div>
      </section>
      <Services data={services} />
      <SectionWrapper
        title="What You Get"
        subtitle="The Advantage"
        className="bg-secondary/5"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {serviceFeatures.map((feature, index) => (
            <div
              key={index}
              className="p-8 rounded-3xl bg-background border border-border/50 hover:border-accent/30 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-6 group-hover:bg-accent group-hover:text-white transition-all">
                {(() => {
                  const Icon = resolveIcon(feature.icon);
                  return <Icon className="w-6 h-6" />;
                })()}
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </SectionWrapper>
      <SectionWrapper title="How I Work" subtitle="The Process">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-center">
          {serviceProcess.map((step, index) => (
            <div key={index}>
              <div className="w-16 h-16 rounded-full bg-background border-2 border-accent flex items-center justify-center text-accent mx-auto mb-6 font-black text-xl">
                {index + 1}
              </div>
              <h3 className="text-lg font-bold mb-2 uppercase tracking-widest">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground italic">
                &quot;{step.description}&quot;
              </p>
            </div>
          ))}
        </div>
      </SectionWrapper>
      <SectionWrapper
        title="Technologies Used"
        subtitle="Modern Stack"
        className="bg-secondary/5"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {servicesTechnologyGroups.map((group) => (
            <div
              key={group.title}
              className="p-8 rounded-3xl bg-background border border-border/50 hover:border-accent/30 transition-all group"
            >
              <h3 className="text-xl font-bold mb-4">{group.title}</h3>
              <div className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1.5 md:px-4 md:py-2 rounded-lg bg-card border border-border hover:border-accent/40 text-[10px] md:text-xs font-bold text-foreground/80 transition-colors shadow-sm"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SectionWrapper>
      <SectionWrapper title="Who These Services Are For" subtitle="Built For">
        <div className="mb-8 max-w-3xl mx-auto text-center">
          <p className="text-muted-foreground text-sm md:text-lg leading-relaxed">
            Muhyo Tech helps businesses in Lahore, Pakistan and beyond build
            modern websites, admin systems, full-stack web apps, and custom web
            solutions that support a stronger online presence.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {servicesAudienceCards.map((audience) => (
            <div
              key={audience.title}
              className="p-8 rounded-3xl bg-background border border-border/50 hover:border-accent/30 transition-all group"
            >
              <h3 className="text-xl font-bold mb-3">{audience.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {audience.description}
              </p>
            </div>
          ))}
        </div>
      </SectionWrapper>
      <SectionWrapper title="Common Questions" subtitle="Services FAQ">
        <div className="max-w-4xl mx-auto space-y-4">
          {servicesPageFaqs.map((item) => (
            <div
              key={item.question}
              className="p-6 rounded-3xl bg-background border border-border/50 hover:border-accent/30 transition-all"
            >
              <h3 className="text-lg font-bold mb-3">{item.question}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.answer}
              </p>
            </div>
          ))}
        </div>
      </SectionWrapper>
      <SectionWrapper className="pb-12">
        <Card className="p-12 md:p-20 text-center relative overflow-hidden border-accent/20">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-black text-foreground mb-6 uppercase tracking-tighter">
              {servicesCta.title}
            </h2>
            <p className="text-muted-foreground mb-10 max-w-xl mx-auto text-lg italic">
              &quot;{servicesCta.description}&quot;
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => openBooking("Start Your Project")}>
                Start Your Project
              </Button>
              <Link href="/book-a-call">
                <Button variant="secondary">Book a Call Page</Button>
              </Link>
              <Link href="/projects">
                <Button variant="outline">View My Work</Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline">Contact Muhyo Tech</Button>
              </Link>
            </div>
          </div>
        </Card>
      </SectionWrapper>

      {bookingOpen && (
        <BookingModal
          isOpen
          onClose={() => setBookingOpen(false)}
          initialServiceSlug={selectedService}
          initialService={selectedService}
          sourcePage="services"
        />
      )}
    </div>
  );
}

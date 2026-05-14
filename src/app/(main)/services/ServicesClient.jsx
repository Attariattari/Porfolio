"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Services from "@/components/Services";
import { SectionWrapper, Card, Button } from "@/components/ui";
import { Zap, Rocket, ArrowRight, Shield, Laptop, MessageSquare, Monitor, Code } from "lucide-react";
import Link from "next/link";
import EditorialBackground from "@/components/ui/EditorialBackground";
import BookingModal from "@/components/BookingModal";

const IconMap = {
  Zap, Shield, Laptop, Rocket, MessageSquare, Monitor, Code
};

const resolveIcon = (icon) => {
  if (typeof icon === 'string') return IconMap[icon] || Zap;
  return icon;
};

const ServiceSlider = ({ services }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!services || services.length === 0) return;
    const interval = 5000;
    const step = 100;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % services.length);
      setProgress(0);
    }, interval);

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + 100 / (interval / step);
      });
    }, step);

    return () => {
      clearInterval(timer);
      clearInterval(progressTimer);
    };
  }, [services?.length]);

  if (!services || services.length === 0) return null;

  return (
    <div className="relative w-full aspect-[4/3] md:aspect-square max-w-[600px] mx-auto group">
      <div className="absolute inset-0 bg-accent/20 blur-[40px] rounded-full scale-90 animate-pulse -z-10" />
      <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] border border-white/10 bg-background">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <motion.div
              initial={{ scale: 1.2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${services[currentIndex].banner || services[currentIndex].image})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="absolute inset-0 bg-black/20" />
            </motion.div>
            <div className="absolute inset-0 p-8 md:p-14 flex flex-col justify-end pointer-events-none">
              <motion.div
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 pointer-events-auto"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/90 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-[0.3em] mb-6 shadow-xl">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  Service {currentIndex + 1}
                </div>
                <h3 className="text-3xl md:text-5xl font-black text-white mb-6 leading-[1.1] tracking-tighter drop-shadow-2xl">
                  {services[currentIndex].title}
                </h3>
                <p className="text-white/70 text-sm md:text-base mb-8 line-clamp-2 italic font-medium max-w-md border-l-2 border-accent/50 pl-4">
                  "{services[currentIndex].description}"
                </p>
                <Link href={`/services/${services[currentIndex].slug || services[currentIndex]._id}`}>
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
        <div className="absolute top-10 right-10 flex flex-col gap-3">
          {services.map((_, idx) => (
            <button
              key={idx}
              onClick={() => { setCurrentIndex(idx); setProgress(0); }}
              className="group relative h-12 w-1 flex items-center justify-center cursor-pointer"
            >
              <div className="h-full w-full bg-white/20 rounded-full overflow-hidden transition-all group-hover:bg-white/40">
                {idx === currentIndex && (
                  <motion.div initial={{ height: "0%" }} animate={{ height: `${progress}%` }} className="absolute inset-0 bg-accent" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function ServicesClient({ services, initialData }) {
  const { serviceFeatures, serviceProcess, siteConfig } = initialData;
  const { servicesPage } = siteConfig;
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
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}>
              <h4 className="text-accent text-sm font-black uppercase tracking-[0.5em] mb-6 flex items-center gap-4">
                <span className="w-12 h-[1px] bg-accent opacity-50"></span>
                {hero.badge}
              </h4>
              <h1 className="text-5xl md:text-7xl font-black text-foreground mb-8 leading-tight tracking-tighter">
                {hero.title}
              </h1>
              <p className="max-w-xl text-muted-foreground text-lg mb-10">{hero.description}</p>
              <div className="flex flex-wrap gap-4">
                <Button onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}>
                  Explore Services <ArrowRight className="w-5 h-5 inline" />
                </Button>
                <Button variant="outline" onClick={() => openBooking()}>Book a Call</Button>
              </div>
            </motion.div>
            <div className="relative z-10">
              <ServiceSlider services={services} />
            </div>
          </div>
        </div>
      </section>
      <Services data={services} />
      <SectionWrapper title="What You Get" subtitle="The Advantage" className="bg-secondary/5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {serviceFeatures.map((feature, index) => (
            <div key={index} className="p-8 rounded-3xl bg-background border border-border/50 hover:border-accent/30 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-6 group-hover:bg-accent group-hover:text-white transition-all">
                {(() => { const Icon = resolveIcon(feature.icon); return <Icon className="w-6 h-6" />; })()}
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </SectionWrapper>
      <SectionWrapper title="How I Work" subtitle="The Process">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-center">
          {serviceProcess.map((step, index) => (
            <div key={index}>
              <div className="w-16 h-16 rounded-full bg-background border-2 border-accent flex items-center justify-center text-accent mx-auto mb-6 font-black text-xl">{index + 1}</div>
              <h3 className="text-lg font-bold mb-2 uppercase tracking-widest">{step.title}</h3>
              <p className="text-sm text-muted-foreground italic">"{step.description}"</p>
            </div>
          ))}
        </div>
      </SectionWrapper>
      <SectionWrapper className="pb-12">
        <Card className="p-12 md:p-20 text-center relative overflow-hidden border-accent/20">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-black text-foreground mb-6 uppercase tracking-tighter">{servicesCta.title}</h2>
            <p className="text-muted-foreground mb-10 max-w-xl mx-auto text-lg italic">"{servicesCta.description}"</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => openBooking("Start Your Project")}>Start Your Project</Button>
              <Link href="/projects"><Button variant="outline">View My Work</Button></Link>
            </div>
          </div>
        </Card>
      </SectionWrapper>
      
      <BookingModal 
        isOpen={bookingOpen} 
        onClose={() => setBookingOpen(false)} 
        initialService={selectedService} 
      />
    </div>
  );
}

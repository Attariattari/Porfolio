"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui";

const BookingModal = dynamic(() => import("@/components/BookingModal"), {
  ssr: false,
});

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export function HeroMotion({ children, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function PreviewMotion({ children, className = "" }) {
  return (
    <motion.aside
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.1 }}
      className={className}
    >
      {children}
    </motion.aside>
  );
}

export function Reveal({ children, className = "" }) {
  return (
    <motion.section
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55 }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

export function ListMotionCard({ children, className = "", delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function FAQItem({ question, answer }) {
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
}

export function ServiceBookingButton({ service, children, className = "" }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button className={className} onClick={() => setIsOpen(true)}>
        {children}
      </Button>
      {isOpen && (
        <BookingModal
          isOpen
          onClose={() => setIsOpen(false)}
          initialServiceSlug={service.slug}
          initialService={service.title || service.slug || ""}
          sourcePage="service-detail"
          contextTitle={service.title}
        />
      )}
    </>
  );
}

"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Button } from "@/components/ui";

const ImageLightbox = dynamic(
  () => import("@/components/ImageLightbox").then((mod) => mod.ImageLightbox),
  { ssr: false },
);

const BookingModal = dynamic(() => import("@/components/BookingModal"), {
  ssr: false,
});

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55 } },
};

export function SectionHeading({ eyebrow, title, description }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mb-10"
    >
      {eyebrow && (
        <p className="mb-3 text-xs font-bold tracking-normal text-accent">
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-5xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 max-w-2xl text-sm font-medium leading-relaxed text-muted-foreground md:text-base">
          {description}
        </p>
      )}
    </motion.div>
  );
}

export function GlassCard({ children, className = "" }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className={`glass rounded-[2rem] border border-white/10 p-6 transition-all hover:border-accent/30 md:p-8 ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function ProjectHeroMotion({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -28 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.75 }}
    >
      {children}
    </motion.div>
  );
}

export function ProjectLightboxButton({
  children,
  images,
  alts = [],
  imageAlt,
  initialIndex = 0,
  variant = "gallery",
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const motionProps =
    variant === "hero"
      ? {
          initial: { opacity: 0, scale: 0.95 },
          animate: { opacity: 1, scale: 1 },
          transition: { duration: 0.75, delay: 0.1 },
        }
      : {
          initial: { opacity: 0, y: 24 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true },
        };

  return (
    <>
      <motion.button
        type="button"
        {...motionProps}
        onClick={() => setIsOpen(true)}
        className={className}
      >
        {children}
      </motion.button>
      {isOpen && (
        <ImageLightbox
          isOpen
          onClose={() => setIsOpen(false)}
          images={images}
          alts={alts}
          alt={imageAlt}
          initialIndex={initialIndex}
        />
      )}
    </>
  );
}

export function ProjectBookingButton({
  children,
  projectTitle,
  variant = "primary",
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        onClick={() => setIsOpen(true)}
        variant={variant}
        className={className}
      >
        {children}
      </Button>
      {isOpen && (
        <BookingModal
          isOpen
          onClose={() => setIsOpen(false)}
          sourcePage="project-detail"
          contextTitle={projectTitle}
        />
      )}
    </>
  );
}

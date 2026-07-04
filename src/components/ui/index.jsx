"use client";

import { motion } from "framer-motion";

export const SectionWrapper = ({
  children,
  id,
  className = "",
  title,
  subtitle,
}) => {
  return (
    <section
      id={id}
      className={`py-12 px-4 md:px-8 lg:px-12 mx-auto max-w-7xl overflow-hidden ${className}`}
    >
      {title && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-8"
        >
          <h4 className="text-accent text-xs font-bold tracking-normal mb-4">
            {subtitle || "Overview"}
          </h4>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            {title}
          </h2>
          <div className="h-1 w-24 bg-accent mx-auto rounded-full opacity-30"></div>
        </motion.div>
      )}
      {children}
    </section>
  );
};

export const Card = ({ children, className = "" }) => (
  <div
    className={`glass p-8 rounded-2xl hover-glow transition-all ${className}`}
  >
    {children}
  </div>
);

export const Button = ({
  children,
  variant = "primary",
  className = "",
  ...props
}) => {
  const baseClass =
    "group relative inline-flex items-center justify-center gap-3 px-8 py-4 overflow-hidden rounded-full font-bold text-sm tracking-normal transition-all duration-500 transform active:scale-95 z-10 w-fit cursor-pointer";

  const variants = {
    primary:
      "bg-accent text-accent-foreground shadow-xl shadow-accent/20 border border-accent/40 hover:-translate-y-1 hover:shadow-2xl hover:shadow-accent/40",
    secondary:
      "bg-card/40 backdrop-blur-md text-foreground border border-border/50 hover:border-accent/30 hover:bg-card/80 hover:-translate-y-1 hover:shadow-xl hover:shadow-accent/10",
    outline:
      "bg-transparent text-accent border border-accent/50 hover:bg-accent hover:text-accent-foreground hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/30",
    danger:
      "bg-destructive text-destructive-foreground shadow-lg shadow-destructive/20 border border-destructive/40 hover:-translate-y-1 hover:bg-destructive/90 hover:shadow-xl hover:shadow-destructive/40",
  };

  return (
    <button
      className={`${baseClass} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {/* SHIMMER EFFECT FOR PRIMARY */}
      {variant === "primary" && (
        <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:left-[100%] transition-all duration-700 ease-in-out pointer-events-none -z-10" />
      )}
      {/* SHIMMER FOR OUTLINE */}
      {variant === "outline" && (
        <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:left-[100%] transition-all duration-700 ease-in-out pointer-events-none -z-10" />
      )}

      <span className="relative z-10 flex items-center justify-center gap-2 whitespace-nowrap">
        {children}
      </span>
    </button>
  );
};

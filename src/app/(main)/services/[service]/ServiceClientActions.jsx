"use client";

import { motion } from "framer-motion";
import { HelpCircle, Plus, Minus } from "lucide-react";
import { useState } from "react";

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-border/50 py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left group"
      >
        <span className="text-lg font-bold text-foreground/80 group-hover:text-accent transition-colors">
          {question}
        </span>
        {isOpen ? (
          <Minus className="w-5 h-5 text-accent" />
        ) : (
          <Plus className="w-5 h-5 text-muted-foreground/40 group-hover:text-accent transition-colors" />
        )}
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        className="overflow-hidden"
      >
        <p className="py-4 text-muted-foreground leading-relaxed italic">
          {answer}
        </p>
      </motion.div>
    </div>
  );
};

export default function ServiceClientActions({ service }) {
  return (
    <section className="pt-12 border-t border-border/30">
      <div className="flex items-center gap-4 mb-12">
        <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
          <HelpCircle className="w-6 h-6" />
        </div>
        <h2 className="text-3xl font-bold tracking-tighter italic">
          Common questions
        </h2>
      </div>
      <div className="space-y-4">
        {service.faq?.map((item, i) => (
          <FAQItem
            key={i}
            question={item.question}
            answer={item.answer}
          />
        ))}
      </div>
    </section>
  );
}

"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { portfolioData } from "@/lib/data";
import { SectionWrapper, Card, Button } from "@/components/ui";
import {
  ArrowLeft,
  CheckCircle2,
  Zap,
  Shield,
  MessageSquare,
  PlayCircle,
  Star,
  HelpCircle,
  Layers,
  Cpu,
  Workflow,
  Plus,
  Minus,
} from "lucide-react";
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

export default function ServiceDetailPage() {
  const { service: serviceId } = useParams();

  // Find service by ID or Slug
  const service = portfolioData.services.find(
    (s) => s.id.toString() === serviceId || s.slug === serviceId,
  );

  if (!service) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Service Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The service you're looking for doesn't exist.
          </p>
          <Link href="/services">
            <Button>Back to Services</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen text-foreground selection:bg-accent selection:text-white">
      {/* Immersive Hero Section */}
      <section className="relative h-[70vh] min-h-[500px] w-full overflow-hidden">
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        >
          <img
            src={service.banner}
            alt={service.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/60 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
        </motion.div>

        <div className="relative z-10 h-full max-w-7xl mx-auto px-6 flex flex-col justify-end pb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Link
              href="/services"
              className="group inline-flex items-center gap-2 text-xs font-semibold tracking-normal text-accent mb-6 bg-accent/10 px-4 py-2 rounded-full border border-accent/20 backdrop-blur-md hover:bg-accent hover:text-white transition-all"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Core services
            </Link>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tighter leading-[0.9] italic text-shadow-xl">
              {service.title}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl font-medium leading-tight">
              {service.description}
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-24">
            {/* Challenge & Solution */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative p-10 rounded-[3rem] bg-card/30 border border-border/50 backdrop-blur-xl overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[80px] -mr-32 -mt-32" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-2xl bg-accent flex items-center justify-center text-white shadow-lg shadow-accent/20">
                    <Zap className="w-5 h-5 fill-white" />
                  </div>
                  <h3 className="text-xs font-bold tracking-normal text-accent">
                    Our goal
                  </h3>
                </div>
                <h4 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight leading-tight italic">
                  Making hard things <br />
                  <span className="text-accent underline decoration-accent/30 underline-offset-8">
                    simple and easy to use.
                  </span>
                </h4>
                <p className="text-xl text-foreground/80 leading-relaxed font-light italic">
                  "{service.problemSolved}"
                </p>
              </div>
            </motion.div>

            {/* Execution Roadmap */}
            <section>
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                <div>
                  <h3 className="text-xs font-bold tracking-normal text-accent mb-4">
                    The plan
                  </h3>
                  <h2 className="text-4xl md:text-5xl font-bold tracking-tighter italic">
                    How we work
                  </h2>
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-accent/30 to-transparent hidden md:block mb-4 ml-8" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {service.process.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    viewport={{ once: true }}
                    className="p-8 rounded-[2.5rem] bg-secondary/5 border border-border/40 hover:border-accent/40 transition-all duration-500 group relative overflow-hidden"
                  >
                    <div className="absolute -right-4 -top-4 text-8xl font-bold text-foreground/[0.03] group-hover:text-accent/[0.05] transition-colors">
                      0{i + 1}
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-foreground/[0.03] flex items-center justify-center text-foreground/40 font-black mb-6 group-hover:bg-accent group-hover:text-white transition-all">
                      {i + 1}
                    </div>
                    <h4 className="text-xl font-bold text-foreground mb-4 tracking-tighter italic">
                      {step.title}
                    </h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Capabilities Grid */}
            <section className="bg-foreground/[0.02] -mx-6 px-6 py-24 rounded-[4rem] border-y border-border/30">
              <div className="max-w-4xl">
                <h3 className="text-xs font-bold tracking-normal text-accent mb-6">
                  Main features
                </h3>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tighter italic mb-16">
                  What we offer
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {service.features.map((feature, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      viewport={{ once: true }}
                      className="flex items-center gap-6 p-6 rounded-2xl bg-card border border-border/50 hover:shadow-xl hover:shadow-accent/5 transition-all group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent group-hover:rotate-12 transition-all duration-300">
                        <CheckCircle2 className="w-6 h-6 text-accent group-hover:text-white" />
                      </div>
                      <span className="text-lg font-bold text-foreground/90 tracking-tight">
                        {feature}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* Tech Stack Horizontal Scroll/Flex */}
            <section>
              <h3 className="text-xs font-bold tracking-normal text-accent mb-8">
                Tools we use
              </h3>
              <div className="flex flex-wrap gap-4">
                {service.techStack.map((tech, i) => (
                  <motion.span
                    key={i}
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="px-8 py-4 rounded-2xl bg-secondary/5 border border-border/50 text-foreground text-sm font-bold tracking-normal hover:border-accent hover:bg-accent/5 transition-all cursor-default flex items-center gap-3"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    {tech}
                  </motion.span>
                ))}
              </div>
            </section>

            {/* FAQs */}
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
                {service.faq.map((item, i) => (
                  <FAQItem
                    key={i}
                    question={item.question}
                    answer={item.answer}
                  />
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-32 space-y-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="relative group"
              >
                <div className="absolute -inset-1 bg-gradient-to-tr from-accent via-blue-500 to-indigo-600 rounded-[3rem] opacity-20 blur-2xl group-hover:opacity-40 transition-opacity" />
                <Card className="p-10 border border-border/50 bg-card/80 backdrop-blur-xl rounded-[3rem] shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-accent/20 rounded-full blur-[60px] -mr-20 -mt-20" />

                  <h3 className="text-3xl font-bold text-foreground mb-6 tracking-tighter leading-none italic">
                    Ready to <br /> <span className="text-accent">start?</span>
                  </h3>
                  <p className="text-muted-foreground text-base mb-10 leading-relaxed font-medium">
                    Let's work together to build a great project that helps your
                    business grow.
                  </p>

                  <div className="space-y-4">
                    <Link href="/contact" className="block">
                      <Button className="w-full">
                        Get started now{" "}
                        <Zap className="w-4 h-4 fill-white animate-pulse" />
                      </Button>
                    </Link>
                    <Link
                      href={`https://wa.me/923224458481?text=${encodeURIComponent(`Hello! I'm interested in your ${service.title} services. Let's discuss this.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button variant="outline" className="w-full">
                        Quick WhatsApp
                      </Button>
                    </Link>
                  </div>

                  <div className="mt-12 pt-10 border-t border-border/50">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="flex -space-x-3">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className="w-10 h-10 rounded-full border-2 border-card bg-secondary/20 overflow-hidden"
                          >
                            <img
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`}
                              alt="Client"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                      <div>
                        <p className="text-xs font-bold tracking-normal text-foreground">
                          Happy clients
                        </p>
                        <div className="flex gap-0.5 mt-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className="w-3 h-3 fill-accent text-accent"
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-accent/5 border border-accent/10">
                      <Shield className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-bold text-foreground tracking-normal mb-1 leading-none">
                          Quality promise
                        </p>
                        <p className="text-[10px] text-muted-foreground leading-normal font-medium">
                          We keep your project safe and follow all rules.
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="p-8 rounded-[2rem] bg-foreground/[0.02] border border-border/50 text-center"
              >
                <HelpCircle className="w-8 h-8 text-secondary/40 mx-auto mb-4" />
                <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                  Looking for a custom enterprise bundle? <br />
                  <Link
                    href="/contact"
                    className="text-accent underline font-bold hover:text-foreground transition-all"
                  >
                    Contact our strategy team.
                  </Link>
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

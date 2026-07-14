"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  Briefcase,
  Building2,
  CheckCircle2,
  Clock,
  Code2,
  Cpu,
  Database,
  Gauge,
  Github,
  Globe,
  GraduationCap,
  LayoutDashboard,
  Layers,
  LifeBuoy,
  Linkedin,
  Mail,
  MapPin,
  MessageSquare,
  MessagesSquare,
  MonitorSmartphone,
  Phone,
  RefreshCw,
  Rocket,
  Search,
  Shield,
  Sparkles,
  Target,
  Twitter,
  User,
  Users,
  Zap,
} from "lucide-react";
import Image from "next/image";
import { getAboutMediaAlt } from "@/lib/mediaAlt";
import Link from "next/link";
import dynamic from "next/dynamic";
import { portfolioData } from "@/lib/data";
import { getAboutPageData } from "@/lib/content/getAboutPageData";
import { Button, SectionWrapper } from "./ui";
import EditorialBackground from "./ui/EditorialBackground";
import SocialLinks from "./SocialLinks";
import { getSafeImageSrc } from "@/lib/images/getSafeImageSrc";

const particleClasses = [
  "top-[12%] left-[8%]",
  "top-[18%] left-[72%]",
  "top-[26%] left-[38%]",
  "top-[34%] left-[88%]",
  "top-[42%] left-[16%]",
  "top-[48%] left-[58%]",
  "top-[55%] left-[80%]",
  "top-[62%] left-[28%]",
  "top-[70%] left-[48%]",
  "top-[76%] left-[92%]",
  "top-[84%] left-[12%]",
  "top-[88%] left-[68%]",
  "top-[14%] left-[52%]",
  "top-[66%] left-[6%]",
  "top-[92%] left-[36%]",
];

const HeroTypewriter = dynamic(() => import("./HeroTypewriter"), {
  ssr: false,
  loading: () => <>modern web experiences</>,
});

const iconMap = {
  ArrowRight,
  Award,
  Briefcase,
  Building: Building2,
  Building2,
  CheckCircle2,
  Clock,
  Code2,
  Cpu,
  Database,
  Gauge,
  Globe,
  GraduationCap,
  LayoutDashboard,
  Layers,
  LifeBuoy,
  Mail,
  MapPin,
  MessageSquare,
  MessagesSquare,
  MonitorSmartphone,
  Phone,
  RefreshCw,
  Rocket,
  Search,
  Shield,
  Sparkles,
  Target,
  User,
  Users,
  Zap,
};

const socialIconMap = {
  GitHub: Github,
  Github,
  LinkedIn: Linkedin,
  Linkedin,
  X: Twitter,
  Twitter,
};

const resolveIcon = (icon, fallback = Sparkles) => iconMap[icon] || fallback;

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  hidden: { opacity: 1 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const SectionHeading = ({ eyebrow, title, description }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
    className="text-center mb-12"
  >
    {eyebrow && (
      <h4 className="text-accent text-xs font-semibold tracking-normal mb-4">
        {eyebrow}
      </h4>
    )}
    <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
      {title}
    </h2>
    {description && (
      <p className="text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
        {description}
      </p>
    )}
  </motion.div>
);

const IconCard = ({ item, index, compact = false }) => {
  const Icon = resolveIcon(item.icon);

  return (
    <motion.div
      variants={fadeUp}
      transition={{ delay: index * 0.04 }}
      whileHover={{ y: -6 }}
      className={`group relative h-full glass border border-white/10 hover:border-accent/30 transition-all duration-500 overflow-hidden ${
        compact ? "p-6 rounded-[2rem]" : "p-7 md:p-8 rounded-[2.5rem]"
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      <div className="relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent border border-accent/20 flex items-center justify-center mb-6 group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-300">
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-foreground mb-3 group-hover:text-accent transition-colors">
          {item.title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed font-medium">
          {item.description || item.desc}
        </p>
        {item.link && (
          <Link
            href={item.link}
            className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-accent hover:underline"
          >
            Explore <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </motion.div>
  );
};

const CtaButton = ({ cta, fallbackVariant = "primary" }) => {
  if (!cta?.href || !cta?.label) return null;

  return (
    <Link href={cta.href} className="w-full sm:w-auto">
      <Button
        variant={cta.variant || fallbackVariant}
        className="w-full sm:w-auto rounded-2xl"
      >
        {cta.label}
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Button>
    </Link>
  );
};

const ProfileCard = ({ data }) => (
  <motion.div
    initial={{ opacity: 0, x: -45 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8 }}
    className="relative"
  >
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-accent/10 blur-[100px] rounded-full -z-10 animate-pulse" />
    <div className="relative z-10 p-2 glass rounded-[1.5rem] overflow-hidden group border border-white/10 hover:border-accent/30 transition-all duration-700">
      <div className="theme-media-frame relative w-full aspect-[4/5] rounded-[1rem] overflow-hidden">
        <Image
          src={getSafeImageSrc(data.hero?.image, "/about-portrait-new.jpg")}
          alt={getAboutMediaAlt(data)}
          fill
          sizes="(min-width: 1024px) 44vw, 100vw"
          className="object-cover transition-transform duration-1000 group-hover:scale-110"
          priority
        />
        <div className="theme-image-wash absolute inset-0 transition-opacity duration-700 dark:opacity-80 dark:group-hover:opacity-45" />
        <div className="theme-surface-depth absolute bottom-6 left-6 right-6 sm:bottom-10 sm:left-10 sm:right-auto p-4 glass rounded-2xl border border-border backdrop-blur-xl translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
          <div className="text-xs font-bold text-accent mb-1 underline decoration-accent/30 decoration-2 underline-offset-4 italic">
            Founder
          </div>
          <h3 className="text-xl font-bold text-foreground italic">
            {data.name}
          </h3>
        </div>
      </div>
    </div>
    <div className="absolute -bottom-8 right-0 md:-right-6 z-20 hidden sm:flex flex-col gap-4">
      {(data.hero.highlights || []).slice(0, 2).map((highlight, index) => (
        <motion.div
          key={highlight}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.45 + index * 0.12 }}
          className="flex items-center gap-3 p-4 rounded-2xl glass border border-white/10 hover:border-accent/30 transition-all group"
        >
          <div className="p-2.5 rounded-xl bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-300">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <span className="text-sm font-bold text-foreground">{highlight}</span>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

const HeroSection = ({ data, isHomePage }) => {
  const TitleHeading = isHomePage ? motion.h2 : motion.h1;
  const HeadlineHeading = isHomePage ? motion.h3 : motion.h2;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-24 items-center relative z-10">
      <ProfileCard data={data} />

      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="flex flex-col"
      >
        <motion.div
          variants={fadeUp}
          className="inline-flex w-fit items-center gap-2 px-4 py-2 rounded-full bg-accent/5 border border-accent/20 mb-6"
        >
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="text-accent text-xs font-bold tracking-normal">
            {data.hero.badge}
          </span>
        </motion.div>

        <TitleHeading
          variants={fadeUp}
          className="text-4xl md:text-6xl font-black text-foreground leading-tight tracking-tight mb-5"
        >
          {data.hero.title}
        </TitleHeading>

        <HeadlineHeading
          variants={fadeUp}
          className="text-xl md:text-2xl font-bold text-foreground/90 leading-snug mb-6"
        >
          {data.hero.headline}
        </HeadlineHeading>

        <motion.div
          variants={fadeUp}
          className="text-lg font-semibold text-accent mb-6 min-h-8"
        >
          Building{" "}
          <span className="inline-block min-w-[20ch] text-foreground">
            <HeroTypewriter
              words={Array.isArray(data.typewriterWords) ? data.typewriterWords : []}
              cursorColor="var(--color-accent)"
              cursorStyle="|"
            />
          </span>
        </motion.div>

        <motion.p
          variants={fadeUp}
          className="text-muted-foreground text-base md:text-lg leading-relaxed font-medium mb-8 max-w-2xl"
        >
          {data.hero.description}
        </motion.p>

        <motion.div variants={fadeUp} className="flex flex-wrap gap-3 mb-8">
          {(data.hero.highlights || []).map((highlight) => (
            <span
              key={highlight}
              className="px-4 py-2 rounded-full bg-card/60 border border-border/60 text-sm font-bold text-foreground/80"
            >
              {highlight}
            </span>
          ))}
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="flex flex-col sm:flex-row gap-4 mb-8"
        >
          {(data.hero.ctas || []).slice(0, isHomePage ? 1 : 3).map((cta, i) => (
            <CtaButton
              key={`${cta.label}-${cta.href}`}
              cta={cta}
              fallbackVariant={i === 0 ? "primary" : i === 1 ? "secondary" : "outline"}
            />
          ))}
          {isHomePage && (
            <Link href="/about" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto rounded-2xl">
                Full About Page
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          )}
        </motion.div>

        <motion.div variants={fadeUp}>
          <SocialLinks />
        </motion.div>
      </motion.div>
    </div>
  );
};

const StorySection = ({ data }) => (
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="lg:col-span-7 glass rounded-[2.5rem] border border-white/10 p-8 md:p-10"
    >
      <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-6 tracking-tight">
        {data.story.title}
      </h2>
      <div className="space-y-5 text-muted-foreground leading-relaxed font-medium">
        {(data.story.paragraphs || []).map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </motion.div>

    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.1 }}
      className="lg:col-span-5 glass rounded-[2.5rem] border border-white/10 p-8 md:p-10 flex flex-col justify-between overflow-hidden relative"
    >
      <Globe className="absolute -right-10 -top-10 w-44 h-44 text-accent opacity-5" />
      <div className="relative z-10">
        <div className="w-14 h-14 rounded-2xl bg-accent/10 text-accent border border-accent/20 flex items-center justify-center mb-8">
          <Target className="w-7 h-7" />
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-4">Professional focus</h3>
        <p className="text-muted-foreground leading-relaxed font-medium">
          {data.mission}
        </p>
      </div>
      <div className="relative z-10 mt-8 pt-8 border-t border-border/40 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-muted-foreground mb-1">Location</div>
          <div className="font-bold text-foreground">{data.location}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Availability</div>
          <div className="font-bold text-accent">{data.availability.status}</div>
        </div>
      </div>
    </motion.div>
  </div>
);

const SkillsSection = ({ skills }) => {
  const groups = [
    ["Frontend", skills.frontend],
    ["Backend", skills.backend],
    ["Database", skills.database],
    ["Tools", skills.tools],
    ["Integrations", skills.integrations],
  ].filter(([, items]) => Array.isArray(items) && items.length > 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5">
      {groups.map(([title, items], index) => (
        <motion.div
          key={title}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.06 }}
          className="glass rounded-[2rem] border border-white/10 p-6"
        >
          <h3 className="text-lg font-bold text-foreground mb-5">{title}</h3>
          <div className="flex flex-wrap gap-2">
            {items.map((skill) => (
              <span
                key={skill}
                className="px-3 py-2 rounded-xl bg-accent/10 border border-accent/15 text-accent text-xs font-bold"
              >
                {skill}
              </span>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const ExperienceSection = ({ items }) => (
  <div className="relative">
    <div className="absolute left-4 top-0 bottom-0 w-px bg-border hidden md:block" />
    <div className="space-y-6">
      {(items || []).map((item, index) => (
        <motion.div
          key={`${item.role}-${item.company}-${index}`}
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.08 }}
          className="relative md:pl-12"
        >
          <div className="absolute left-0 top-8 w-8 h-8 rounded-full bg-accent/10 border border-accent/30 text-accent hidden md:flex items-center justify-center">
            <Briefcase className="w-4 h-4" />
          </div>
          <div className="glass rounded-[2rem] border border-white/10 p-7 md:p-8 hover:border-accent/30 transition-all">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-4">
              <div>
                <h3 className="text-xl font-bold text-foreground">{item.role}</h3>
                <p className="text-sm font-bold text-muted-foreground mt-1">
                  {item.company}
                </p>
              </div>
              <span className="w-fit text-xs font-bold text-accent bg-accent/10 border border-accent/20 px-3 py-1.5 rounded-full">
                {item.period || item.year || item.duration}
              </span>
            </div>
            <p className="text-muted-foreground leading-relaxed font-medium mb-5">
              {item.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {(item.highlights || item.milestones || []).map((highlight) => (
                <span
                  key={highlight}
                  className="px-3 py-1.5 rounded-full bg-card/70 border border-border text-xs font-bold text-foreground/80"
                >
                  {highlight}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

const EducationSection = ({ items }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {(items || []).map((item, index) => (
      <motion.div
        key={`${item.degree}-${item.institute}-${index}`}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.08 }}
        className="glass rounded-[2rem] border border-white/10 p-7 hover:border-accent/30 transition-all"
      >
        <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent border border-accent/20 flex items-center justify-center mb-6">
          <GraduationCap className="w-6 h-6" />
        </div>
        <div className="text-xs font-bold text-accent mb-3">{item.status}</div>
        <h3 className="text-xl font-bold text-foreground mb-2">{item.degree}</h3>
        <p className="text-sm font-bold text-muted-foreground mb-4">
          {item.institute || item.institution}
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed font-medium">
          {item.description || item.period || item.duration}
        </p>
      </motion.div>
    ))}
  </div>
);

const AvailabilitySection = ({ data }) => {
  const emailHref = data.availability.email?.includes("@")
    ? `mailto:${data.availability.email}`
    : "/contact#contact-form";
  const contactItems = [
    { icon: "Mail", label: "Email", value: data.availability.email, href: emailHref },
    { icon: "Phone", label: "Phone", value: data.availability.phone, href: `tel:${data.availability.phone}` },
    { icon: "MapPin", label: "Location", value: data.availability.location },
    { icon: "Clock", label: "Working hours", value: data.availability.workingHours },
  ].filter((item) => item.value);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
      <motion.div
        initial={{ opacity: 0, x: -24 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="glass rounded-[2.5rem] border border-white/10 p-8 md:p-10"
      >
        <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-5 tracking-tight">
          {data.availability.title}
        </h2>
        <p className="text-muted-foreground leading-relaxed font-medium mb-8">
          {data.availability.description}
        </p>
        <Link href="/book-a-call">
          <Button className="rounded-2xl">
            Book a Call <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 24 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="glass rounded-[2.5rem] border border-white/10 p-8 md:p-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
          </span>
          {data.availability.status}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {contactItems.map((item) => {
            const Icon = resolveIcon(item.icon);
            const content = (
              <>
                <div className="p-3 rounded-xl bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-all">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-muted-foreground mb-1">
                    {item.label}
                  </div>
                  <div className="text-sm font-bold text-foreground break-words">
                    {item.value}
                  </div>
                </div>
              </>
            );

            return item.href ? (
              <a
                key={item.label}
                href={item.href}
                className="flex gap-4 items-start group hover:text-accent transition-colors"
              >
                {content}
              </a>
            ) : (
              <div key={item.label} className="flex gap-4 items-start group">
                {content}
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

const FinalCTA = ({ data }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8 }}
    className="relative group overflow-hidden rounded-[3rem] border border-white/10"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-background to-accent/5 -z-10">
      <div className="absolute top-0 right-0 w-[520px] h-[520px] bg-accent/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute -bottom-[20%] -left-[10%] w-[380px] h-[380px] bg-blue-500/10 blur-[100px] rounded-full" />
    </div>

    <div className="p-10 md:p-20 text-center">
      <div className="mb-8 inline-flex items-center gap-3 px-5 py-2 glass rounded-full border border-accent/30">
        <Sparkles className="w-4 h-4 text-accent" />
        <span className="text-xs font-black uppercase tracking-normal text-accent">
          {data.finalCTA.badge}
        </span>
      </div>
      <h2 className="text-4xl md:text-6xl font-black text-foreground mb-6 leading-tight tracking-tight">
        {data.finalCTA.title}
      </h2>
      <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium leading-relaxed mb-10">
        {data.finalCTA.description}
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <CtaButton cta={data.finalCTA.primaryButton} />
        <CtaButton cta={data.finalCTA.secondaryButton} fallbackVariant="secondary" />
        <CtaButton cta={data.finalCTA.tertiaryButton} fallbackVariant="outline" />
      </div>
    </div>
  </motion.div>
);

export default function About({ data: initialData = null, isHomePage = false }) {
  const data = getAboutPageData(initialData || portfolioData.about);

  if (!data) return null;

  return (
    <div className="relative overflow-hidden">
      {!isHomePage && <EditorialBackground text="About" />}
      <div
        className={`absolute top-0 left-0 w-full ${
          isHomePage ? "h-full" : "h-[1800px]"
        } pointer-events-none -z-10`}
      >
        <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute top-[35%] right-[10%] w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full" />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
      </div>

      <SectionWrapper
        id="about"
        subtitle={data.hero.badge}
        title={data.hero.title}
        className={isHomePage ? "" : "pb-12"}
      >
        <HeroSection data={data} isHomePage={isHomePage} />

        {!isHomePage && (
          <div className="space-y-24 mt-24">
            <StorySection data={data} />

            <section>
              <SectionHeading
                eyebrow="What I build"
                title="Web solutions with a clear purpose"
                description="Muhyo Tech builds practical digital products that help visitors understand, trust, contact, book, buy, and manage."
              />
              <motion.div
                variants={stagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {(data.whatIBuild || []).map((item, index) => (
                  <IconCard key={item.title} item={item} index={index} compact />
                ))}
              </motion.div>
            </section>

            <section>
              <SectionHeading
                eyebrow="Skills & technologies"
                title="Modern stack, practical execution"
                description="No fake percentages, just the technologies used to build clean interfaces, APIs, dashboards, and production-ready web systems."
              />
              <SkillsSection skills={data.skills || {}} />
            </section>

            <section>
              <SectionHeading
                eyebrow="Professional journey"
                title="Experience & journey"
                description="A mix of hands-on development, operations, project handling, and client-facing business experience."
              />
              <ExperienceSection items={data.experiences} />
            </section>

            <section>
              <SectionHeading
                eyebrow="Education"
                title="Academic foundation & continuous learning"
                description="Formal study and continuous technical growth support the practical work behind Muhyo Tech."
              />
              <EducationSection items={data.education} />
            </section>

            <section>
              <SectionHeading
                eyebrow="Development approach"
                title="How your project is handled"
                description="A clear process helps turn ideas into clean UI, secure structure, and a launch-ready product."
              />
              <motion.div
                variants={stagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {(data.approach || []).map((item, index) => (
                  <IconCard key={item.title} item={item} index={index} />
                ))}
              </motion.div>
            </section>

            <section>
              <SectionHeading
                eyebrow="Why choose Muhyo Tech"
                title="Built for trust, clarity, and growth"
                description="Muhyo Tech focuses on practical, modern, and scalable web solutions for businesses, startups, professionals, and personal brands."
              />
              <motion.div
                variants={stagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {(data.whyChoose || []).map((item, index) => (
                  <IconCard key={item.title} item={item} index={index} compact />
                ))}
              </motion.div>
            </section>

            <section>
              <SectionHeading
                eyebrow="Work principles"
                title="Values that guide the work"
                description="Short, practical principles that keep the project focused on quality and long-term usefulness."
              />
              <motion.div
                variants={stagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {(data.values || []).map((item, index) => (
                  <IconCard key={item.title || item} item={typeof item === "string" ? { title: item, description: data.mission, icon: "CheckCircle2" } : item} index={index} />
                ))}
              </motion.div>
            </section>

            <AvailabilitySection data={data} />
            <FinalCTA data={data} />
          </div>
        )}
      </SectionWrapper>

      <div className="absolute inset-0 pointer-events-none -z-20">
        {particleClasses.map((particleClass, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -40, 0],
              x: [0, 20, 0],
              opacity: [0.03, 0.1, 0.03],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 5 + (i % 5),
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.8,
            }}
            className={`absolute w-1.5 h-1.5 rounded-full bg-accent ${particleClass}`}
          />
        ))}
      </div>
    </div>
  );
}

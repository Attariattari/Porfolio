"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  ArrowRight,
  Search,
  Clock,
  Zap,
  TrendingUp,
  Award,
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import Image from "next/image";
import { SectionWrapper, Button } from "./ui";
import EditorialBackground from "./ui/EditorialBackground";
import { rankBlogsByMode, resolveFeaturedBlogs } from "@/lib/blogUtils";
import { portfolioData } from "@/lib/data";
import React from "react";
import dynamic from "next/dynamic";
import { getSafeImageSrc } from "@/lib/images/getSafeImageSrc";
import { getBlogImageAlt } from "@/lib/blogImageAlt";

const ImageLightbox = dynamic(
  () => import("./ImageLightbox").then((mod) => mod.ImageLightbox),
  { ssr: false },
);

// Lazy-load FeaturedBlogSlider to avoid bundling Swiper upfront
const FeaturedBlogSlider = dynamic(
  () => import("./FeaturedBlogSlider"),
  { 
    ssr: false,
    loading: () => (
      <div className="relative min-h-[560px] rounded-[2.5rem] bg-card/60 border border-border/40 overflow-hidden">
        <div className="aspect-[4/3] bg-muted/50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
        </div>
        <div className="p-8 space-y-4" aria-hidden="true">
          <div className="h-7 w-4/5 rounded-full bg-muted/70" />
          <div className="h-4 w-full rounded-full bg-muted/60" />
          <div className="h-4 w-3/4 rounded-full bg-muted/60" />
          <div className="flex items-center justify-between pt-4">
            <div className="h-4 w-28 rounded-full bg-muted/50" />
            <div className="h-4 w-20 rounded-full bg-muted/50" />
          </div>
        </div>
      </div>
    ),
  }
);

// --- SUB-COMPONENTS ---

const EditorialHeader = ({
  totalArticles,
  totalCategories,
  latestUpdate,
  featuredBlogs,
  trendingTags,
  onImageClick,
}) => {
  return (
    <header className="relative py-10 px-6 overflow-hidden">
      {/* --- Premium Background Elements --- */}
      <EditorialBackground text="Blog" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
          {/* --- Left Side: Editorial Content --- */}
          <div className="lg:col-span-7 space-y-12">
            {/* Label & Heading */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-accent/10 border border-accent/20"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  <span className="text-xs font-semibold tracking-normal text-accent">
                    Blog & insights
                  </span>
                </motion.div>

                {/* Debug Indicator - Will show the source of data */}
                <span className="text-[10px] font-mono text-muted-foreground/30 uppercase tracking-widest">
                  {totalArticles > 0
                    ? "Live Database Connected"
                    : "Static Fallback Active"}
                </span>
              </div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-tight text-foreground leading-none italic"
              >
                Stories, Guides <br />
                <span className="relative">
                  & <span className="text-accent">Insights.</span>
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-muted-foreground text-base md:text-xl leading-relaxed font-medium italic max-w-xl border-l-2 border-accent/20 pl-8 py-2"
              >
                &quot;Exploring the intersection of high-performance
                engineering, premium design, and future-forward digital
                strategy.&quot;
              </motion.p>
            </div>

            {/* Redesigned Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-12 pt-4"
            >
              <div className="space-y-1">
                <p className="text-3xl font-bold text-foreground tracking-tight">
                  {totalArticles}+
                </p>
                <p className="text-xs font-semibold text-muted-foreground/40 tracking-normal">
                  Articles published
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-foreground tracking-tight">
                  {totalCategories}+
                </p>
                <p className="text-xs font-semibold text-muted-foreground/40 tracking-normal">
                  Categories
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-accent tracking-tight italic">
                  {latestUpdate?.includes("202") ? "Recent" : "Weekly"}
                </p>
                <p className="text-xs font-semibold text-muted-foreground/40 tracking-normal">
                  {latestUpdate || "Updated"}
                </p>
              </div>
            </motion.div>

            {/* Trending Tags Row
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-4"
          >
            <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">
              Trending Topics
            </span>
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide no-scrollbar -mx-2 px-2">
              {trendingTags.map((tag) => (
                <Link
                  key={tag}
                  href={`/blog?tag=${tag}`}
                  className="px-6 py-2.5 rounded-full bg-card/40 border border-border/50 hover:border-accent/40 text-[9px] font-black text-muted-foreground hover:text-accent uppercase tracking-widest whitespace-nowrap transition-all duration-300 backdrop-blur-sm"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </motion.div> */}
          </div>

          {/* --- Right Side: Featured Preview Card --- */}
          <div className="lg:col-span-5 relative group">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* --- Featured Slider --- */}
              <FeaturedBlogSlider 
                featuredBlogs={featuredBlogs}
                onImageClick={onImageClick}
              />
            </motion.div>

            {/* Decorative Elements around card */}
            <div className="absolute -z-10 -bottom-6 -right-6 w-full h-full border border-accent/10 rounded-[2.5rem]" />
            <div className="absolute -z-10 -top-6 -left-6 w-1/2 h-1/2 bg-accent/5 blur-3xl rounded-full" />
          </div>
        </div>
      </div>
    </header>
  );
};
const ControlHub = ({
  searchQuery,
  setSearchQuery,
  categories,
  activeCategory,
  setActiveCategory,
}) => {
  const handleCategoryClick = (category) => {
    setActiveCategory(category);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 mb-16">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-10 bg-card/30 border border-border/50 p-3 rounded-[2.5rem]">
        {/* Category Navigation */}
        <div className="relative w-full lg:flex-1 min-w-0 rounded-[1.8rem] overflow-x-auto scrollbar-hide">
          <div className="flex w-max min-w-full gap-1 py-1">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={`relative px-8 py-4 rounded-[1.8rem] text-xs font-semibold tracking-normal transition-all whitespace-nowrap ${
                  activeCategory === category
                    ? "text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="relative z-10">{category}</span>
                {activeCategory === category && (
                  <motion.div
                    layoutId="pill-selector"
                    className="absolute inset-0 bg-accent rounded-[1.8rem] shadow-xl shadow-accent/20"
                    transition={{
                      type: "spring",
                      bounce: 0.2,
                      duration: 0.6,
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="relative w-full lg:w-[400px] group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background/50 border border-border/30 rounded-[1.8rem] py-4.5 pl-14 pr-8 focus:outline-none focus:border-accent/40 transition-all text-sm font-medium tracking-normal text-foreground placeholder:text-muted-foreground/30"
          />
        </div>
      </div>
    </div>
  );
};

const TrendingTabs = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "latest", label: "Recent Articles", icon: Clock },
    { id: "trending", label: "Trending Now", icon: TrendingUp },
    { id: "picks", label: "Editor's Picks", icon: Award },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 mb-12">
      <div className="flex items-center gap-12 border-b border-border/50 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`group pb-6 text-xs font-semibold tracking-normal transition-all flex items-center gap-4 relative whitespace-nowrap ${
              activeTab === tab.id
                ? "text-accent"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon
              className={`w-4 h-4 ${activeTab === tab.id ? "text-accent" : "text-muted-foreground/40"}`}
            />
            {tab.label}
            {tab.id === "trending" && (
              <span className="rounded-full border border-accent/20 bg-accent/10 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-accent/80">
                AI ranked
              </span>
            )}
            {activeTab === tab.id && (
              <motion.div
                layoutId="underline-selector"
                className="absolute bottom-0 left-0 w-full h-[2px] bg-accent"
                transition={{ type: "spring", bounce: 0, duration: 0.5 }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

const ArticleCard = ({ blog, index, onImageClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 28 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ delay: index * 0.05, duration: 0.55 }}
    className="h-full group"
  >
    <article className="theme-surface-depth relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-border/60 bg-background/70 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-accent/40">
      <button
        type="button"
        onClick={() => onImageClick(index)}
        className="relative aspect-[16/10] overflow-hidden text-left"
        aria-label={`Preview image for ${blog.title}`}
      >
        <Image
          src={getSafeImageSrc(blog.image || blog.featuredImage?.url, "/portfolio-hero.png")}
          alt={getBlogImageAlt(blog)}
          fill
          loading="lazy"
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="theme-image-wash absolute inset-0" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {blog.featured && (
            <span className="rounded-full bg-accent px-3 py-1.5 text-[10px] font-bold text-accent-foreground shadow-lg shadow-accent/20">
              Featured
            </span>
          )}
          <span className="rounded-full border border-white/20 bg-background/75 px-3 py-1.5 text-[10px] font-bold text-foreground backdrop-blur-md">
            {blog.category || "Insight"}
          </span>
        </div>
      </button>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-4 flex flex-wrap items-center gap-3 text-[11px] font-semibold text-muted-foreground">
          <span>{blog.date || "Recently published"}</span>
          <span className="h-1 w-1 rounded-full bg-accent/40" />
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {blog.readTime || "5 min read"}
          </span>
        </div>

        <Link href={`/blog/${blog.slug}`} className="block">
          <h3 className="mb-3 text-xl font-bold leading-tight tracking-tight text-foreground transition-colors group-hover:text-accent">
            {blog.title}
          </h3>
          <p className="mb-0 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {blog.summary}
          </p>
        </Link>

        <div className="mt-auto flex items-center justify-between border-t border-border/50 pt-5">
          <div className="min-w-0">
            <p className="mb-0 text-[10px] font-semibold text-muted-foreground">
              By {blog.author || "Muhyo Tech"}
            </p>
          </div>
          <Link
            href={`/blog/${blog.slug}`}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 text-foreground transition-all group-hover:border-accent group-hover:bg-accent group-hover:text-accent-foreground"
            aria-label={`Read ${blog.title}`}
          >
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  </motion.div>
);

const HomeArticleCard = ({ blog, index, onImageClick }) => {
  const image = getSafeImageSrc(blog.image || blog.featuredImage?.url, "/portfolio-hero.png");
  const isFeatured = !!blog.featured;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ delay: index * 0.08, duration: 0.55 }}
      className="group h-full"
    >
      <div className="theme-surface-depth relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-border/60 bg-background/70 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-accent/40">
        <button
          type="button"
          onClick={() => onImageClick(index)}
          className="relative aspect-[16/10] w-full overflow-hidden text-left"
          aria-label={`Preview image for ${blog.title}`}
        >
          <Image
            src={image}
            alt={getBlogImageAlt(blog)}
            fill
            loading="lazy"
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="theme-image-wash absolute inset-0" />
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            {isFeatured && (
              <span className="rounded-full bg-accent px-3 py-1.5 text-[10px] font-bold text-accent-foreground shadow-lg shadow-accent/20">
                Featured
              </span>
            )}
            <span className="rounded-full border border-white/20 bg-background/70 px-3 py-1.5 text-[10px] font-bold text-foreground backdrop-blur-md">
              {blog.category || "Insight"}
            </span>
          </div>
        </button>

        <div className="flex flex-1 flex-col p-6">
          <div className="mb-4 flex flex-wrap items-center gap-3 text-[11px] font-semibold text-muted-foreground">
            <span>{blog.date || "Recently published"}</span>
            <span className="h-1 w-1 rounded-full bg-accent/40" />
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {blog.readTime || "5 min read"}
            </span>
          </div>

          <Link href={`/blog/${blog.slug}`} className="block">
            <h3 className="mb-3 text-xl font-bold leading-tight tracking-tight text-foreground transition-colors group-hover:text-accent">
              {blog.title}
            </h3>
            <p className="mb-0 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
              {blog.summary}
            </p>
          </Link>

          <div className="mt-auto flex items-center justify-between border-t border-border/50 pt-5">
            <div className="min-w-0">
              <p className="mb-0 text-[10px] font-semibold text-muted-foreground">
                By {blog.author || "Muhyo Tech"}
              </p>
            </div>
            <Link
              href={`/blog/${blog.slug}`}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 text-foreground transition-all group-hover:border-accent group-hover:bg-accent group-hover:text-accent-foreground"
              aria-label={`Read ${blog.title}`}
            >
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

const NewsletterCTA = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.success) {
        setSubscribed(true);
        toast.success(data.message);
        setEmail("");
      } else {
        toast.error(data.error || "Subscription failed.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="relative p-12 lg:p-24 rounded-[4rem] bg-gradient-to-br from-card/80 to-background border border-border/50 overflow-hidden shadow-2xl group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 blur-[120px] rounded-full" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-16">
          <div className="space-y-8 flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold tracking-normal mx-auto lg:mx-0">
              <Zap className="w-4 h-4" /> Editorial subscription
            </div>
            <h2 className="text-4xl md:text-7xl font-bold tracking-tight leading-none text-foreground">
              Insights <br />{" "}
              <span className="text-accent italic underline decoration-accent/10 underline-offset-8">
                for you.
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground/60 max-w-sm italic font-medium leading-relaxed mx-auto lg:mx-0">
              &quot;Get professional engineering articles delivered straight to
              your inbox.&quot;
            </p>
          </div>

          <div className="w-full lg:w-[450px] space-y-6">
            <AnimatePresence mode="wait">
              {subscribed ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-accent/10 backdrop-blur-3xl border border-accent/20 rounded-[2.5rem] p-12 flex flex-col items-center gap-4 text-center shadow-2xl shadow-accent/5"
                >
                  <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center text-background shadow-lg shadow-accent/20">
                    <CheckCircle2 size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white italic tracking-tight">
                      Transmission successful
                    </h3>
                    <p className="text-sm text-accent/60 font-medium italic mt-2">
                      You are now part of the Muhyo Tech network.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="bg-background/40 backdrop-blur-3xl border border-border/50 rounded-[2.5rem] p-3 flex flex-col md:flex-row items-center gap-3 shadow-inner"
                >
                  <input
                    type="email"
                    required
                    placeholder="YOUR@EMAIL.COM"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none py-6 px-10 text-[10px] font-black tracking-widest uppercase text-foreground placeholder:text-muted-foreground/30 w-full"
                  />
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full md:w-auto h-[60px] md:h-auto"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Subscribe"
                    )}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>
            <p className="text-[11px] text-muted-foreground/30 text-center tracking-normal font-semibold italic">
              Encryption active &bull; Secure Protocol
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN PAGE ---

export default function Blog({ data, isHomePage = false }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeTab, setActiveTab] = useState("latest");
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxAlts, setLightboxAlts] = useState([]);

  const categories = useMemo(
    () => ["All", ...new Set(data?.map((b) => b.category) || [])],
    [data],
  );

  if (!data) return null;
  if (isHomePage) {
    const homeBlogs = resolveFeaturedBlogs(data, portfolioData.blogs).slice(0, 3);
    return (
      <>
        <SectionWrapper id="blog" title="Latest Articles" subtitle="My Blog">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="mb-2 text-sm font-semibold text-accent">
                  Featured writing
                </p>
                <h3 className="mb-0 max-w-2xl text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                  Selected articles from the portfolio journal.
                </h3>
              </div>
              <p className="mb-0 max-w-md text-sm leading-relaxed text-muted-foreground">
                Practical notes on development, product thinking, performance,
                and the systems behind polished digital work.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7">
              {homeBlogs.map((blog, i) => (
                <HomeArticleCard
                  key={blog.id || blog.slug || i}
                  blog={blog}
                  index={i}
                  onImageClick={(idx) => {
                    setLightboxImages(
                      homeBlogs.map(
                        (b) =>
                          b.image || b.featuredImage?.url || "/portfolio-hero.png",
                      ),
                    );
                    setLightboxAlts(homeBlogs.map(getBlogImageAlt));
                    setLightboxIndex(idx);
                  }}
                />
              ))}
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-16 flex justify-center"
            >
              <Link
                href="/blog"
                className="group relative px-8 py-4 bg-accent text-accent-foreground font-bold text-sm rounded-2xl overflow-hidden transition-all hover:pr-12 shadow-lg shadow-accent/20"
              >
                <span className="relative z-10 flex items-center gap-2">
                  View All Articles <ArrowRight className="w-4 h-4 ml-1" />
                </span>
                <div className="absolute top-0 -right-full w-full h-full bg-foreground/10 group-hover:right-0 transition-all duration-300" />
                <ArrowRight className="absolute right-5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </SectionWrapper>
        {lightboxIndex !== null && (
          <ImageLightbox
            isOpen
            onClose={() => setLightboxIndex(null)}
            images={lightboxImages}
            alts={lightboxAlts}
            alt="Muhyo Tech blog cover"
            initialIndex={lightboxIndex || 0}
          />
        )}
      </>
    );
  }

  const filteredBlogs = data.filter((blog) => {
    // Only published blogs
    if (blog.publishStatus && blog.publishStatus !== "published") return false;

    const matchesSearch =
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === "All" || blog.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const displayPosts = rankBlogsByMode(filteredBlogs, activeTab);

  // Diagnostic Log
  if (typeof window !== "undefined") {
    console.log(
      `[Blog Component] Rendering with ${data?.length || 0} items. Data Source: ${data?.[0]?._isFromDataJs ? "Static" : "Database"}`,
    );
  }

  return (
    <div className="min-h-screen selection:bg-accent selection:text-accent-foreground">
      {/* 1. Blog Hero Introduction */}
      <EditorialHeader
        totalArticles={data.length}
        totalCategories={categories.length - 1}
        latestUpdate={data[0]?.date || "Updated recently"}
        featuredBlogs={resolveFeaturedBlogs(data, portfolioData.blogs)}
        trendingTags={[...new Set(data.flatMap((b) => b.tags))].slice(0, 6)}
        onImageClick={(idx) => {
          const featured = resolveFeaturedBlogs(data, portfolioData.blogs);
          setLightboxImages(featured.map((b) => b.image));
          setLightboxAlts(featured.map(getBlogImageAlt));
          setLightboxIndex(idx);
        }}
      />

      {/* 3. Category + Search Controls */}
      <ControlHub
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        categories={categories}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />

      {/* 4. Trending / Recent Tabs */}
      <TrendingTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* 5. Blog Articles Grid */}
      <section className="pb-24 px-6 min-h-[600px]">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="popLayout">
            {displayPosts.length > 0 ? (
              <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
              >
                {displayPosts.map((blog, i) => (
                  <ArticleCard
                    key={blog.id || blog.slug || i}
                    blog={blog}
                    index={i}
                    onImageClick={(idx) => {
                      setLightboxImages(displayPosts.map((b) => b.image));
                      setLightboxAlts(displayPosts.map(getBlogImageAlt));
                      setLightboxIndex(idx);
                    }}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-40 text-center"
              >
                <div className="w-24 h-24 rounded-[3rem] bg-card/40 border border-border/50 flex items-center justify-center mb-8">
                  <Search className="w-10 h-10 text-muted-foreground/30" />
                </div>
                <h3 className="text-3xl font-bold mb-4 tracking-tight italic">
                  No results found
                </h3>
                <p className="text-muted-foreground text-lg italic max-w-sm opacity-60">
                  Try adjusting your search or category filters.
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("All");
                  }}
                  className="mt-12"
                >
                  Reset Discovery
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* 6. Newsletter CTA */}
      <NewsletterCTA />

      {lightboxIndex !== null && (
        <ImageLightbox
          isOpen
          onClose={() => setLightboxIndex(null)}
          images={lightboxImages}
          alts={lightboxAlts}
          alt="Muhyo Tech blog cover"
          initialIndex={lightboxIndex || 0}
        />
      )}
    </div>
  );
}

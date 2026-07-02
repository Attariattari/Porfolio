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
import { ImageLightbox } from "./ImageLightbox";
import { resolveFeaturedBlogs } from "@/lib/blogUtils";
import { portfolioData } from "@/lib/data";
import React from "react";
import dynamic from "next/dynamic";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";

// Lazy-load FeaturedBlogSlider to avoid bundling Swiper upfront
const FeaturedBlogSlider = dynamic(
  () => import("./FeaturedBlogSlider"),
  { 
    ssr: false,
    loading: () => (
      <div className="relative aspect-[4/3] rounded-[2.5rem] bg-card/60 border border-border/40 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
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
  const [swiperInstance, setSwiperInstance] = useState(null);

  const handleCategoryClick = (category, index) => {
    setActiveCategory(category);
    if (swiperInstance && !swiperInstance.destroyed) {
      const slide = swiperInstance.slides[index];
      if (slide && swiperInstance.el) {
        const slideRect = slide.getBoundingClientRect();
        const swiperRect = swiperInstance.el.getBoundingClientRect();

        const isFullyVisible =
          slideRect.left >= swiperRect.left &&
          slideRect.right <= swiperRect.right;

        if (!isFullyVisible) {
          if (slideRect.right > swiperRect.right) {
            // Cut off on the right -> shift left
            const diff = slideRect.right - swiperRect.right;
            swiperInstance.translateTo(
              swiperInstance.translate - diff - 10,
              500,
            );
          } else if (slideRect.left < swiperRect.left) {
            // Cut off on the left -> shift right
            const diff = swiperRect.left - slideRect.left;
            swiperInstance.translateTo(
              swiperInstance.translate + diff + 10,
              500,
            );
          }
        }
      }
    }
  };

  useEffect(() => {
    if (swiperInstance && !swiperInstance.destroyed) {
      // More pronounced back-and-forth nudge to show interactivity
      const nudgeTimer = setTimeout(() => {
        // Slide out (leftward move to reveal right items)
        swiperInstance.translateTo(-180, 1800);

        setTimeout(() => {
          // Slide back home
          swiperInstance.translateTo(0, 1200);
        }, 2000);
      }, 1500);

      return () => clearTimeout(nudgeTimer);
    }
  }, [swiperInstance]);

  return (
    <div className="max-w-7xl mx-auto px-6 mb-16">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-10 bg-card/30 border border-border/50 p-3 rounded-[2.5rem]">
        {/* Category Navigation */}
        <div className="relative w-full lg:flex-1 min-w-0 rounded-[1.8rem] overflow-hidden">
          <Swiper
            onSwiper={setSwiperInstance}
            slidesPerView="auto"
            spaceBetween={4}
            freeMode={true}
            modules={[FreeMode]}
            grabCursor={true}
            className="w-full py-1"
          >
            {categories.map((category, index) => (
              <SwiperSlide key={category} style={{ width: "auto" }}>
                <button
                  onClick={() => handleCategoryClick(category, index)}
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
              </SwiperSlide>
            ))}
          </Swiper>
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
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1, duration: 0.8 }}
    className="h-full group"
  >
    <div className="relative h-full bg-card backdrop-blur-3xl border border-border/50 rounded-[2rem] overflow-hidden flex flex-col transition-all duration-500 hover:shadow-2xl hover:border-accent/30">
      {/* Editorial Thumbnail */}
      <div className="relative aspect-[16/11] overflow-hidden">
        <Image
          src={blog.image}
          alt={blog.title}
          fill
          className="object-cover transition-transform duration-1000 group-hover:scale-110 cursor-zoom-in"
          onClick={() => onImageClick(index)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60" />

        <div className="absolute top-6 left-6">
          <span className="px-4 py-2 rounded-lg bg-accent text-accent-foreground text-[10px] font-bold tracking-normal shadow-xl">
            {blog.category}
          </span>
        </div>
      </div>

      {/* Content Architecture */}
      <div className="p-10 flex flex-col flex-grow">
        <div className="flex items-center gap-4 text-[10px] font-semibold tracking-normal text-muted-foreground/60 mb-8">
          <span>{blog.date}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-accent/20" />
          <span className="text-muted-foreground/80">{blog.readTime}</span>
        </div>

        <Link href={`/blog/${blog.slug}`} className="block group/title mb-auto">
          <h3 className="text-2xl font-bold text-foreground group-hover/title:text-accent transition-colors leading-tight tracking-tight mb-6 italic">
            {blog.title}
          </h3>
          <p className="text-muted-foreground/80 text-sm leading-relaxed line-clamp-3 font-medium italic opacity-80 border-l-2 border-accent/10 pl-6">
            &quot;{blog.summary}&quot;
          </p>
        </Link>

        {/* Footer Architecture */}
        <div className="mt-12 pt-8 border-t border-border/50 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-semibold text-muted-foreground/60 tracking-normal">
              Author
            </span>
            <span className="text-xs font-bold text-foreground tracking-normal">
              {blog.author}
            </span>
          </div>

          <Link
            href={`/blog/${blog.slug}`}
            className="flex items-center gap-4 text-[10px] font-bold tracking-normal text-foreground group/explore"
          >
            <div className="w-12 h-12 rounded-xl border border-border/50 flex items-center justify-center transition-all group-hover/explore:bg-accent group-hover/explore:border-accent group-hover/explore:text-accent-foreground shadow-xl">
              <ArrowUpRight className="w-5 h-5 transition-transform group-hover/explore:translate-x-0.5 group-hover/explore:-translate-y-0.5" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  </motion.div>
);

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

  const categories = useMemo(
    () => ["All", ...new Set(data?.map((b) => b.category) || [])],
    [data],
  );

  if (!data) return null;
  if (isHomePage) {
    const recentBlogs = data.slice(0, 3);
    return (
      <SectionWrapper id="blog" title="Latest Articles" subtitle="My Blog">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {recentBlogs.map((blog, i) => (
              <ArticleCard
                key={blog.id || blog.slug || i}
                blog={blog}
                index={i}
                onImageClick={(idx) => {
                  setLightboxImages(recentBlogs.map((b) => b.image));
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
              className="group relative px-10 py-5 bg-accent text-accent-foreground font-bold text-sm rounded-full overflow-hidden transition-all hover:pr-14"
            >
              <span className="relative z-10 flex items-center gap-2">
                View All Articles <ArrowRight className="w-4 h-4 ml-1" />
              </span>
              <div className="absolute top-0 -right-full w-full h-full bg-foreground/10 group-hover:right-0 transition-all duration-300" />
              <ArrowRight className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </SectionWrapper>
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

  const displayPosts = useMemo(() => {
    let posts = [...filteredBlogs];

    // SORTING RULE:
    // 1. Featured blogs first
    // 2. Then normal blogs
    // 3. Then order/date
    posts.sort((a, b) => {
      const aFeatured = !!a.featured;
      const bFeatured = !!b.featured;

      if (bFeatured !== aFeatured) {
        return Number(bFeatured) - Number(aFeatured);
      }
      return (a.order ?? 999) - (b.order ?? 999);
    });

    if (activeTab === "trending") posts = [...posts].reverse();
    return posts;
  }, [filteredBlogs, activeTab]);

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

      <ImageLightbox
        isOpen={lightboxIndex !== null}
        onClose={() => setLightboxIndex(null)}
        images={lightboxImages}
        initialIndex={lightboxIndex || 0}
      />
    </div>
  );
}

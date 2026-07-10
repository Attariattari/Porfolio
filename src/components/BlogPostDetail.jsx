"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Tag,
  Share2,
  Linkedin,
  Facebook,
  ArrowLeft,
  ArrowUpRight,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { SectionWrapper, Button } from "@/components/ui";
import { getSafeImageSrc } from "@/lib/images/getSafeImageSrc";

export default function BlogPostDetail({ blog, shareUrl }) {
  if (!blog) return null;

  const coverImage = getSafeImageSrc(blog.image || blog.featuredImage?.url, "/portfolio-hero.png");
  const blogPath = `/blog/${blog.slug}`;
  const fullShareUrl =
    shareUrl ||
    (typeof window !== "undefined"
      ? `${window.location.origin}${blogPath}`
      : blogPath);
  const encodedShareUrl = encodeURIComponent(fullShareUrl);
  const encodedShareTitle = encodeURIComponent(blog.title || "Muhyo Tech Blog");
  const shareOptions = [
    {
      name: "Share on X",
      label: "X",
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      href: `https://twitter.com/intent/tweet?text=${encodedShareTitle}&url=${encodedShareUrl}`,
      hoverClass: "hover:border-white hover:bg-white hover:text-black",
    },
    {
      name: "Share on LinkedIn",
      label: "LinkedIn",
      icon: <Linkedin className="w-4 h-4" />,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedShareUrl}`,
      hoverClass: "hover:border-[#0077b5] hover:bg-[#0077b5] hover:text-white",
    },
    {
      name: "Share on Facebook",
      label: "Facebook",
      icon: <Facebook className="w-4 h-4" />,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedShareUrl}`,
      hoverClass: "hover:border-[#1877f2] hover:bg-[#1877f2] hover:text-white",
    },
  ];

  const copyShareUrl = async () => {
    const { toast } = await import("sonner");

    try {
      await navigator.clipboard.writeText(fullShareUrl);
      toast.success("Blog link copied.");
    } catch {
      toast.error("Link copy nahi hua. Please manually copy karein.");
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Article Header */}
      <header className="relative overflow-hidden border-b border-white/10 ">
        <div className="absolute inset-0 " />
        <div className="relative mx-auto max-w-7xl px-4 pt-12 pb-10 md:px-8 md:pt-12 md:pb-14 lg:px-12">
          <div className="mb-8 flex items-center justify-between">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/85 backdrop-blur-md transition-transform hover:translate-x-[-4px] hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" /> Back to insights
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75 }}
            className="relative z-10"
          >
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3.5 py-2 text-[10px] font-bold text-accent-foreground shadow-lg shadow-accent/20">
                <Tag className="h-3 w-3" /> {blog.category}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-medium text-white/70">
                <Clock className="h-3 w-3" /> {blog.readTime}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-medium text-white/70">
                <Calendar className="h-3 w-3" /> {blog.date}
              </span>
            </div>

            <p className="mb-4 text-[10px] font-black uppercase tracking-[0.28em] text-accent">
              Muhyo Tech Insight
            </p>
            <h1 className="max-w-6xl text-4xl font-bold leading-[1.04] tracking-tight text-white md:text-6xl lg:text-7xl">
              {blog.title}
            </h1>

            <div className="mt-7 grid gap-6 border-t border-white/10 pt-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
              {blog.summary ? (
                <p className="max-w-3xl text-base leading-relaxed text-white/68 md:text-lg">
                  {blog.summary}
                </p>
              ) : <span />}

              <div className="flex items-center gap-4 lg:justify-end">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-accent/30">
                  <Image
                    src={getSafeImageSrc("https://res.cloudinary.com/dg5gwixf1/image/upload/v1772736622/ChatGPT_Image_Mar_5_2026_11_36_42_AM_auw4uw.png", "/logo.png")}
                    alt={blog.author}
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold tracking-normal text-white">
                    {blog.author}
                  </p>
                  <p className="text-[10px] tracking-normal text-white/45">
                    {blog.authorRole}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.figure
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.08 }}
            className="relative mt-10"
          >
            <div className="absolute -inset-3 rounded-[2rem] bg-accent/10 blur-2xl" />
            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/12 bg-white/5 shadow-2xl shadow-black/45">
              <div className="relative aspect-[16/8.4] min-h-[260px] md:min-h-[430px]">
                <Image
                  src={coverImage}
                  alt={blog.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(min-width: 1280px) 1184px, calc(100vw - 32px)"
                />
              </div>
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 border-t border-white/10 bg-black/34 px-5 py-4 backdrop-blur-xl">
                <span className="text-[10px] font-black uppercase tracking-[0.22em] text-white/58">
                  Featured Cover
                </span>
                <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_18px_rgba(20,184,166,0.9)]" />
              </div>
            </div>
          </motion.figure>
        </div>
      </header>

      {/* Content Area */}
      <SectionWrapper className="pt-12 md:pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 max-w-7xl mx-auto">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-8"
          >
            <div
              className="blog-content 
                [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:mt-12 [&_h2]:mb-6 [&_h2]:tracking-tight
                [&_p]:text-muted-foreground [&_p]:leading-relaxed [&_p]:text-lg [&_p]:mb-6
                [&_blockquote]:border-l-4 [&_blockquote]:border-accent [&_blockquote]:pl-8 [&_blockquote]:py-4 [&_blockquote]:my-10 [&_blockquote]:bg-accent/5 [&_blockquote]:rounded-r-2xl [&_blockquote]:italic [&_blockquote]:text-xl [&_blockquote]:text-foreground
                [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-8 [&_ul]:space-y-2
                [&_li]:text-muted-foreground [&_li]:pl-2"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />

            {/* Tags */}
            <div className="mt-16 pt-8 border-t border-border/10">
              <div className="flex flex-wrap gap-3">
                {blog.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-4 py-2 rounded-xl bg-muted/20 text-muted-foreground text-xs font-bold hover:bg-accent/10 hover:text-accent transition-colors cursor-pointer"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* CTA Section */}
            <div className="mt-20 p-8 md:p-12 rounded-3xl bg-gradient-to-br from-accent/10 to-blue-600/5 border border-accent/20 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-left">
                <h3 className="text-2xl font-bold mb-4">Enjoyed this post?</h3>
                <p className="text-muted-foreground italic">
                  Let&apos;s discuss how we can implement these technologies for your
                  next project.
                </p>
              </div>
              <Link href="/contact">
                <Button className="whitespace-nowrap">
                  Start your project
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-6 lg:col-span-4 lg:h-fit lg:self-start">
            <div className="space-y-5">
            {/* Share Box - Premium Card */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="relative overflow-hidden rounded-[2rem] border border-white/5 bg-[#0A0A0B]/60 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl group lg:p-5"
            >
              {/* Decorative Gradient Orb */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent/10 blur-[80px] rounded-full group-hover:bg-accent/20 transition-colors duration-700" />
              
              <h4 className="relative mb-5 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.25em] text-accent">
                <div className="w-8 h-[1px] bg-accent/30" />
                Share Insights
              </h4>

              <div className="relative space-y-2.5">
                {shareOptions.map((option) => (
                  <a
                    key={option.name}
                    href={option.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${option.name}: ${blog.title}`}
                    className={`group/item flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-white/82 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/25 lg:px-4 lg:py-3 ${option.hoverClass}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/7 transition-colors group-hover/item:bg-white/15 lg:h-9 lg:w-9">
                        {option.icon}
                      </div>
                      <div>
                        <span className="block text-xs font-bold tracking-tight">
                          {option.label}
                        </span>
                        <span className="mt-1 block text-[10px] font-medium text-current/55">
                          Post blog link
                        </span>
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 opacity-60 transition-all group-hover/item:translate-x-0.5 group-hover/item:-translate-y-0.5 group-hover/item:opacity-100" />
                  </a>
                ))}

                <button
                  type="button"
                  onClick={copyShareUrl}
                  className="group/copy flex w-full cursor-pointer items-center justify-between rounded-2xl border border-accent/25 bg-accent/10 p-4 text-accent transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent hover:text-white hover:shadow-xl hover:shadow-accent/10 lg:px-4 lg:py-3"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 transition-colors group-hover/copy:bg-white/20 lg:h-9 lg:w-9">
                      <Share2 className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="block text-xs font-bold tracking-tight">
                        Copy Link
                      </span>
                      <span className="mt-1 block text-[10px] font-medium text-current/65">
                        Direct blog URL
                      </span>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 opacity-70 transition-all group-hover/copy:translate-x-0.5 group-hover/copy:-translate-y-0.5 group-hover/copy:opacity-100" />
                </button>
              </div>
            </motion.div>

            {/* Trending Box - High-End List */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="relative overflow-hidden rounded-[2rem] border border-white/5 bg-[#0A0A0B]/40 p-6 backdrop-blur-xl lg:p-5"
            >
              <h4 className="mb-5 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/60">
                <div className="w-8 h-[1px] bg-white/10" />
                Trending Now
              </h4>
              <div className="space-y-5">
                {[1, 2].map((i) => (
                  <div key={i} className="group relative cursor-pointer flex gap-4">
                    <span className="text-2xl font-black text-white/5 group-hover:text-accent/20 transition-colors duration-500 tabular-nums">
                      0{i}
                    </span>
                    <div className="space-y-2">
                      <p className="text-[9px] font-black uppercase tracking-widest text-accent/60 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                        Technology
                      </p>
                      <h5 className="text-sm font-bold leading-snug group-hover:text-accent transition-all duration-300 line-clamp-2">
                        The Impact of AI on Modern Web Scalability
                      </h5>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 border-t border-white/5 pt-5">
                <Link href="/blog" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 hover:text-accent transition-colors flex items-center justify-between group">
                  Discover more insights
                  <ArrowRight className="w-4 h-4 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
                </Link>
              </div>
            </motion.div>
            </div>
          </aside>
        </div>
      </SectionWrapper>
    </div>
  );
}

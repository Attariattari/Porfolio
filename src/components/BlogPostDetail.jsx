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
import { getBlogImageAlt } from "@/lib/blogImageAlt";
import { ensureMuhyoTechAlt } from "@/lib/mediaAlt";
import { SITE_URL } from "@/lib/config";

export default function BlogPostDetail({
  blog,
  shareUrl,
  relatedBlogs = [],
  relatedServices = [],
}) {
  if (!blog) return null;

  const coverImage = getSafeImageSrc(blog.image || blog.featuredImage?.url, "/blog-preview.png");
  const blogPath = `/blog/${blog.slug}`;
  const fullShareUrl = shareUrl || `${SITE_URL}${blogPath}`;
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
      hoverClass: "hover:border-foreground hover:bg-foreground hover:text-background",
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
    <div className="min-h-screen bg-background pb-20 text-foreground transition-colors">
      {/* Article Header */}
      <header className="relative overflow-hidden border-b border-border/70">
        <div className="absolute inset-0 " />
        <div className="relative mx-auto max-w-7xl px-4 pt-12 pb-10 md:px-8 md:pt-12 md:pb-14 lg:px-12">
          <div className="mb-8 flex items-center justify-between">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-2 text-xs font-semibold text-foreground backdrop-blur-md transition-all hover:-translate-x-1 hover:border-accent/40 hover:text-accent"
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
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3.5 py-2 text-xs font-medium text-muted-foreground">
                <Clock className="h-3 w-3" /> {blog.readTime}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3.5 py-2 text-xs font-medium text-muted-foreground">
                <Calendar className="h-3 w-3" /> {blog.date}
              </span>
            </div>

            <p className="mb-4 text-[10px] font-black uppercase tracking-[0.28em] text-accent">
              Muhyo Tech Insight
            </p>
            <h1 className="max-w-6xl text-4xl font-bold leading-[1.04] tracking-tight text-foreground md:text-6xl lg:text-7xl">
              {blog.title}
            </h1>

            <div className="mt-7 grid gap-6 border-t border-border/70 pt-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
              {blog.summary ? (
                <p className="max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
                  {blog.summary}
                </p>
              ) : <span />}

              <Link
                href="/about"
                className="flex items-center gap-4 lg:justify-end"
              >
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-accent/30">
                  <Image
                    src={getSafeImageSrc("https://res.cloudinary.com/dg5gwixf1/image/upload/v1772736622/ChatGPT_Image_Mar_5_2026_11_36_42_AM_auw4uw.png", "/logo.png")}
                    alt={ensureMuhyoTechAlt("", `portrait of ${blog.author || "the author"}`)}
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold tracking-normal text-foreground">
                    {blog.author}
                  </p>
                  <p className="text-[10px] tracking-normal text-muted-foreground">
                    {blog.authorRole}
                  </p>
                </div>
              </Link>
            </div>
          </motion.div>

          <motion.figure
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.08 }}
            className="relative mt-10"
          >
            <div className="absolute -inset-3 rounded-[2rem] bg-accent/10 blur-2xl" />
            <div className="theme-media-frame relative overflow-hidden rounded-[1.75rem] border border-border/70 bg-muted/50">
              <div className="relative aspect-[16/8.4] min-h-[260px] md:min-h-[430px]">
                <Image
                  src={coverImage}
                  alt={getBlogImageAlt(blog)}
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
              className="blog-content text-foreground
                [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:mt-12 [&_h2]:mb-6 [&_h2]:tracking-tight [&_h2]:text-foreground
                [&_h3]:mt-9 [&_h3]:mb-4 [&_h3]:text-2xl [&_h3]:font-bold [&_h3]:text-foreground
                [&_h4]:mt-7 [&_h4]:mb-3 [&_h4]:text-xl [&_h4]:font-bold [&_h4]:text-foreground
                [&_p]:text-muted-foreground [&_p]:leading-relaxed [&_p]:text-lg [&_p]:mb-6
                [&_blockquote]:border-l-4 [&_blockquote]:border-accent [&_blockquote]:pl-8 [&_blockquote]:py-4 [&_blockquote]:my-10 [&_blockquote]:bg-accent/5 [&_blockquote]:rounded-r-2xl [&_blockquote]:italic [&_blockquote]:text-xl [&_blockquote]:text-foreground
                [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-8 [&_ul]:space-y-2
                [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-8 [&_ol]:space-y-2
                [&_li]:text-muted-foreground [&_li]:pl-2
                [&_strong]:font-bold [&_strong]:text-foreground
                [&_a]:font-semibold [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-4
                [&_code]:rounded-md [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-foreground
                [&_pre]:overflow-x-auto [&_pre]:rounded-2xl [&_pre]:border [&_pre]:border-border [&_pre]:bg-muted [&_pre]:p-5 [&_pre]:text-foreground"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />

            {/* Tags */}
            <div className="mt-16 border-t border-border/70 pt-8">
              <div className="flex flex-wrap gap-3">
                {(blog.tags || []).map((tag) => (
                  <Link
                    key={tag}
                    href={`/blog?tag=${encodeURIComponent(tag)}`}
                    className="cursor-pointer rounded-xl border border-border/70 bg-muted/60 px-4 py-2 text-xs font-bold text-muted-foreground transition-colors hover:border-accent/30 hover:bg-accent/10 hover:text-accent"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>

            {relatedServices.length > 0 && (
              <section className="mt-16 border-t border-border/70 pt-10">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">
                  Put the insight into practice
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground">
                  Related Muhyo Tech services
                </h2>
                <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">
                  These services connect the article&apos;s engineering topic to a
                  practical website, application, performance, or business outcome.
                </p>
                <div className="mt-7 grid gap-4 md:grid-cols-3">
                  {relatedServices.map((service) => (
                    <Link
                      key={service.slug}
                      href={service.href}
                      className="group rounded-2xl border border-border/60 bg-card/45 p-5 transition-colors hover:border-accent/40"
                    >
                      <h3 className="text-base font-bold leading-snug text-foreground group-hover:text-accent">
                        {service.title}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {service.description}
                      </p>
                      <span className="mt-5 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-accent">
                        Explore service <ArrowRight className="h-4 w-4" />
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* CTA Section */}
            <div className="mt-20 p-8 md:p-12 rounded-3xl bg-gradient-to-br from-accent/10 to-blue-600/5 border border-accent/20 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-left">
                <h3 className="mb-4 text-2xl font-bold text-foreground">Enjoyed this post?</h3>
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
              className="group relative overflow-hidden rounded-[2rem] border border-border/70 bg-card/70 p-6 shadow-xl shadow-overlay/10 backdrop-blur-2xl lg:p-5"
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
                    className={`group/item flex items-center justify-between rounded-2xl border border-border bg-muted/45 p-4 text-foreground transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-overlay/10 lg:px-4 lg:py-3 ${option.hoverClass}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted transition-colors group-hover/item:bg-current/10 lg:h-9 lg:w-9">
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
                  className="group/copy flex w-full cursor-pointer items-center justify-between rounded-2xl border border-accent/25 bg-accent/10 p-4 text-accent transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent hover:text-accent-foreground hover:shadow-xl hover:shadow-accent/10 lg:px-4 lg:py-3"
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

            {relatedBlogs.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-card/45 p-6 backdrop-blur-xl lg:p-5"
              >
                <div className="mb-5 flex items-center justify-between gap-3">
                  <h4 className="mb-0 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">
                    <span className="h-px w-8 bg-border" />
                    Related Reading
                  </h4>
                  <span className="rounded-full border border-accent/20 bg-accent/10 px-2 py-1 text-[8px] font-bold uppercase tracking-wider text-accent">
                    Topic match
                  </span>
                </div>
                <div className="space-y-5">
                  {relatedBlogs.map((relatedBlog, index) => (
                    <Link
                      key={relatedBlog.slug || relatedBlog._id || index}
                      href={`/blog/${relatedBlog.slug}`}
                      className="group relative flex gap-4"
                    >
                      <span className="text-2xl font-black text-foreground/10 transition-colors duration-500 group-hover:text-accent/30 tabular-nums">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="min-w-0 space-y-2">
                        <span className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-accent/70">
                          <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_10px_rgba(var(--accent-rgb),0.6)]" />
                          {relatedBlog.category || "Insights"}
                        </span>
                        <span className="block text-sm font-bold leading-snug text-foreground transition-colors duration-300 line-clamp-2 group-hover:text-accent">
                          {relatedBlog.title}
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>

                <div className="mt-6 border-t border-border/60 pt-5">
                  <Link href="/blog" className="group flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 transition-colors hover:text-accent">
                    Discover more insights
                    <ArrowRight className="w-4 h-4 -translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                  </Link>
                </div>
              </motion.div>
            )}
            </div>
          </aside>
        </div>
      </SectionWrapper>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  User,
  Clock,
  Tag,
  Share2,
  Twitter,
  Linkedin,
  Facebook,
  ArrowLeft,
  MessageCircle,
  TrendingUp,
  ArrowUpRight,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { SectionWrapper, Button } from "@/components/ui";

export default function BlogPostDetail({ blog }) {
  if (!blog) return null;

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Header */}
      <div className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden">
        <Image
          src={blog.image}
          alt={blog.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>

        <div className="absolute inset-0 flex flex-col justify-end px-4 md:px-8 lg:px-12 pb-16 max-w-7xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-accent text-xs font-semibold tracking-normal mb-8 hover:translate-x-[-4px] transition-transform"
            >
              <ArrowLeft className="w-4 h-4" /> Back to insights
            </Link>

            <div className="flex flex-wrap items-center gap-4 mb-6">
              <span className="px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-[10px] font-bold tracking-normal flex items-center gap-2">
                <Tag className="w-3 h-3" /> {blog.category}
              </span>
              <span className="text-white/60 text-xs font-medium flex items-center gap-2">
                <Clock className="w-3 h-3" /> {blog.readTime}
              </span>
              <span className="text-white/60 text-xs font-medium flex items-center gap-2">
                <Calendar className="w-3 h-3" /> {blog.date}
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-[1.1] tracking-tight max-w-5xl">
              {blog.title}
            </h1>

            <div className="flex items-center gap-4 py-6 border-t border-white/10 max-w-fit">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-accent/20">
                <Image
                  src="https://res.cloudinary.com/dg5gwixf1/image/upload/v1772736622/ChatGPT_Image_Mar_5_2026_11_36_42_AM_auw4uw.png"
                  alt={blog.author}
                  width={48}
                  height={48}
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-white font-bold tracking-normal text-xs">
                  {blog.author}
                </p>
                <p className="text-white/40 text-[10px] tracking-normal">
                  {blog.authorRole}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content Area */}
      <SectionWrapper className="pt-16">
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
                  Let's discuss how we can implement these technologies for your
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
          <aside className="lg:col-span-4 space-y-8">
            {/* Share Box - Premium Card */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="relative p-8 rounded-[2.5rem] border border-white/5 bg-[#0A0A0B]/60 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden group"
            >
              {/* Decorative Gradient Orb */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent/10 blur-[80px] rounded-full group-hover:bg-accent/20 transition-colors duration-700" />
              
              <h4 className="relative flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.25em] text-accent mb-8">
                <div className="w-8 h-[1px] bg-accent/30" />
                Share Insights
              </h4>

              <div className="relative space-y-3">
                {(() => {
                  const currentPath = `/blog/${blog.slug}`;
                  const fullShareUrl =
                    typeof window !== "undefined"
                      ? `${window.location.origin}${currentPath}`
                      : currentPath;

                  const shareOptions = [
                    {
                      name: "Share on X",
                      icon: (
                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                      ),
                      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}&url=${encodeURIComponent(fullShareUrl)}`,
                      hoverClass: "hover:bg-foreground hover:text-background",
                    },
                    {
                      name: "LinkedIn Insight",
                      icon: <Linkedin className="w-4 h-4" />,
                      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullShareUrl)}`,
                      hoverClass: "hover:bg-[#0077b5] hover:text-white",
                    },
                    {
                      name: "Facebook Post",
                      icon: <Facebook className="w-4 h-4" />,
                      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullShareUrl)}`,
                      hoverClass: "hover:bg-[#1877f2] hover:text-white",
                    }
                  ];

                  return (
                    <>
                      {shareOptions.map((option) => (
                        <a
                          key={option.name}
                          href={option.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 transition-all duration-500 group/item ${option.hoverClass}`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover/item:bg-white/10 transition-colors">
                              {option.icon}
                            </div>
                            <span className="text-xs font-bold tracking-tight">{option.name}</span>
                          </div>
                          <ArrowUpRight className="w-4 h-4 opacity-0 group-hover/item:opacity-100 transition-all -translate-x-2 group-hover/item:translate-x-0" />
                        </a>
                      ))}

                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(fullShareUrl);
                          import('sonner').then(({ toast }) => toast.success("Link copied to clipboard!"));
                        }}
                        className="w-full flex items-center justify-between p-4 rounded-2xl bg-accent/10 border border-accent/20 text-accent hover:bg-accent hover:text-white transition-all duration-500 group/copy cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center group-hover/copy:bg-white/20 transition-colors">
                            <Share2 className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold tracking-tight">Copy Direct Link</span>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center group-hover/copy:bg-white/20 transition-colors">
                          <ArrowUpRight className="w-4 h-4" />
                        </div>
                      </button>
                    </>
                  );
                })()}
              </div>
            </motion.div>

            {/* Trending Box - High-End List */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="p-8 rounded-[2.5rem] border border-white/5 bg-[#0A0A0B]/40 backdrop-blur-xl relative overflow-hidden"
            >
              <h4 className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/60 mb-8">
                <div className="w-8 h-[1px] bg-white/10" />
                Trending Now
              </h4>
              <div className="space-y-8">
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
              
              <div className="mt-10 pt-6 border-t border-white/5">
                <Link href="/blog" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 hover:text-accent transition-colors flex items-center justify-between group">
                  Discover more insights
                  <ArrowRight className="w-4 h-4 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
                </Link>
              </div>
            </motion.div>
          </aside>
        </div>
      </SectionWrapper>
    </div>
  );
}

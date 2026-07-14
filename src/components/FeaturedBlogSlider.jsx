"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, ArrowRight, Eye } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  Autoplay,
  Pagination,
  EffectFade,
  EffectCreative,
} from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import "swiper/css/effect-creative";
import { getSafeImageSrc } from "@/lib/images/getSafeImageSrc";
import { getBlogImageAlt } from "@/lib/blogImageAlt";

/**
 * FeaturedBlogSlider - Lazy-loaded component for featured blogs
 * This component is dynamically imported to avoid bundling Swiper upfront
 */
export default function FeaturedBlogSlider({ featuredBlogs, onImageClick }) {
  const [activeFeaturedIndex, setActiveFeaturedIndex] = useState(0);

  if (!featuredBlogs?.length) return null;

  return (
    <div className="relative">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade, EffectCreative]}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
          bulletClass:
            "swiper-pagination-bullet !bg-accent !opacity-20 !w-2 !h-2",
          bulletActiveClass: "!opacity-100 !w-6 !rounded-full transition-all",
        }}
        grabCursor={true}
        effect="creative"
        creativeEffect={{
          prev: {
            shadow: true,
            translate: ["-20%", 0, -1],
          },
          next: {
            translate: ["100%", 0, 0],
          },
        }}
        onSlideChange={(swiper) => setActiveFeaturedIndex(swiper.realIndex)}
        className="featured-slider rounded-[2.5rem] overflow-hidden"
      >
        {featuredBlogs?.map((blog, idx) => (
          <SwiperSlide key={blog.id}>
            {/* Main Featured Card */}
            <div className="theme-surface-depth relative bg-background border border-border/40 rounded-[2.5rem] overflow-hidden transition-all duration-700 group-hover:border-accent/30">
              {/* Thumbnail Area */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={getSafeImageSrc(blog.image || blog.featuredImage?.url, "/portfolio-hero.png")}
                  alt={getBlogImageAlt(blog)}
                  fill
                  priority={idx === 0}
                  loading={idx === 0 ? undefined : "lazy"}
                  sizes="(max-width: 1024px) 100vw, 420px"
                  className="object-cover transition-transform duration-1000 group-hover:scale-110 cursor-zoom-in"
                  onClick={() => onImageClick(idx)}
                />
                <div className="theme-image-wash absolute inset-0" />

                {/* Badge */}
                <div className="absolute top-8 left-8">
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/90 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-[0.3em] shadow-xl"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    Featured
                  </motion.span>
                </div>
              </div>

              {/* Content Area */}
              <div className="relative p-8 space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h3 className="text-2xl font-black text-foreground line-clamp-2 leading-tight tracking-tight">
                    {blog.title}
                  </h3>
                </motion.div>

                <p className="text-sm text-muted-foreground line-clamp-2 italic leading-relaxed">
                  {blog.summary}
                </p>

                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {blog.readTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {blog.views || 0} views
                    </span>
                  </div>

                  <Link
                    href={`/blog/${blog.slug}`}
                    className="flex items-center gap-2 text-accent hover:text-accent/80 transition-colors text-xs font-black uppercase tracking-widest"
                  >
                    Read <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

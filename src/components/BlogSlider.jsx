"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Clock,
  Tag,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui";

export default function BlogSlider({ posts }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const featuredPosts = posts.filter((post) => post.featured);

  useEffect(() => {
    if (!isHovered) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % featuredPosts.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [isHovered, featuredPosts.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredPosts.length);
  };

  const prevSlide = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + featuredPosts.length) % featuredPosts.length,
    );
  };

  if (featuredPosts.length === 0) return null;

  const currentPost = featuredPosts[currentIndex];

  return (
    <div
      className="relative w-full h-[500px] md:h-[600px] overflow-hidden rounded-3xl mb-12 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPost.id}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.7 }}
          className="relative w-full h-full"
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src={currentPost.image}
              alt={currentPost.title}
              fill
              className="object-cover transition-transform duration-[2000ms] group-hover:scale-105"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
          </div>

          {/* Content */}
          <div className="relative h-full flex flex-col justify-center px-8 md:px-16 lg:px-24 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <span className="px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <Tag className="w-3 h-3" /> {currentPost.category}
                </span>
                <span className="text-muted-foreground text-xs font-medium flex items-center gap-2">
                  <Clock className="w-3 h-3" /> {currentPost.readTime}
                </span>
              </div>

              <h2 className="text-4xl md:text-6xl font-black mb-6 leading-[1.1] text-foreground tracking-tight">
                {currentPost.title}
              </h2>

              <p className="text-lg text-muted-foreground mb-8 line-clamp-2 md:line-clamp-3 italic leading-relaxed max-w-2xl">
                {currentPost.summary}
              </p>

              <Link href={`/blog/${currentPost.id}`}>
                <Button>
                  Read Full Story
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 duration-300" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <div className="absolute bottom-12 right-12 flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={prevSlide}
          className="p-4 rounded-full border border-white/10 bg-white/5 backdrop-blur-md hover:bg-accent hover:border-accent transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="p-4 rounded-full border border-white/10 bg-white/5 backdrop-blur-md hover:bg-accent hover:border-accent transition-all"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Progress Dots */}
      <div className="absolute bottom-12 left-12 flex gap-3">
        {featuredPosts.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              index === currentIndex
                ? "w-12 bg-accent"
                : "w-3 bg-white/20 hover:bg-white/40"
            }`}
          />
        ))}
      </div>

      {/* Animated Shapes for Premium Feel */}
      <div className="absolute top-0 right-0 -z-10 w-64 h-64 bg-accent/20 blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-0 left-0 -z-10 w-96 h-96 bg-blue-600/10 blur-[120px] animate-pulse"></div>
    </div>
  );
}

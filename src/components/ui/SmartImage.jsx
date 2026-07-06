"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ImageIcon, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SmartImage({
  src,
  alt,
  className,
  fallbackSrc = "/logo.png",
  priority = false,
  ...props
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    setCurrentSrc(src);
    setError(false);
    setIsLoading(true);
  }, [src]);

  const handleError = () => {
    if (!error) {
      setError(true);
      setCurrentSrc(fallbackSrc);
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("relative overflow-hidden bg-muted/50", className)}>
      {/* Loading Skeleton */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted animate-pulse">
          <div className="w-full h-full bg-gradient-to-r from-transparent via-foreground/5 to-transparent skew-x-[-20deg] animate-[shimmer_2s_infinite]" />
        </div>
      )}

      {/* Error State Icon (Subtle) */}
      {error && (
        <div className="absolute inset-0 z-0 flex items-center justify-center bg-muted/80">
          <ImageIcon className="w-8 h-8 text-muted-foreground opacity-20" />
        </div>
      )}

      <Image
        src={currentSrc || fallbackSrc}
        alt={alt || "Image"}
        className={cn(
          "object-cover transition-all duration-700 ease-in-out",
          isLoading ? "scale-110 blur-xl grayscale" : "scale-100 blur-0 grayscale-0",
          error ? "opacity-40" : "opacity-100"
        )}
        onLoad={() => setIsLoading(false)}
        onError={handleError}
        priority={priority}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        {...props}
      />
      
      <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(-150%) skewX(-20deg); }
          100% { transform: translateX(150%) skewX(-20deg); }
        }
      `}</style>
    </div>
  );
}

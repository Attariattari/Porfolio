const DEFAULT_FALLBACK_IMAGE = "/portfolio-hero.webp";

const optimizedLocalImages = {
  "/logo.png": "/logo.webp",
  "/hero-visual.png": "/hero-visual.webp",
  "/portfolio-hero.png": "/portfolio-hero.webp",
  "/contact_hero_abstract.png": "/contact_hero_abstract.webp",
  "/images/contact-hero.png": "/images/contact-hero.webp",
  "/images/contact-elite.png": "/images/contact-elite.webp",
  "/images/contact-professional.png": "/images/contact-professional.webp",
  "/images/contact/hero-1.png": "/images/contact/hero-1.webp",
  "/images/contact/hero-2.png": "/images/contact/hero-2.webp",
  "/images/contact/hero-3.png": "/images/contact/hero-3.webp",
  "/images/contact/hero-premium.png": "/images/contact/hero-premium.webp",
};

function getOptimizedLocalSrc(src) {
  return optimizedLocalImages[src] || src;
}

function getOptimizedCloudinarySrc(src) {
  try {
    const url = new URL(src);
    if (!url.hostname.endsWith("cloudinary.com")) return src;
    if (!url.pathname.includes("/image/upload/")) return src;
    if (url.pathname.includes("/f_auto") || url.pathname.includes("/q_auto")) {
      return url.toString();
    }

    url.pathname = url.pathname.replace(
      "/image/upload/",
      "/image/upload/f_auto,q_auto/",
    );
    return url.toString();
  } catch {
    return src;
  }
}

export function getSafeImageSrc(src, fallbackSrc = DEFAULT_FALLBACK_IMAGE) {
  const fallback =
    typeof fallbackSrc === "string" && fallbackSrc.trim()
      ? fallbackSrc.trim()
      : DEFAULT_FALLBACK_IMAGE;

  if (typeof src !== "string") return fallback;

  const value = src.trim();
  if (!value || value === "undefined" || value === "null") return fallback;

  if (value.startsWith("/")) return getOptimizedLocalSrc(value);

  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) return fallback;
    if (!url.hostname) return fallback;
    return getOptimizedCloudinarySrc(url.toString());
  } catch {
    return fallback;
  }
}

export default getSafeImageSrc;

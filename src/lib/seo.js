import { SITE_URL } from "@/lib/config";

export const defaultSeoData = {
  title: "Muhyo Tech - Full Stack Web Development & Software Engineering",
  description:
    "Muhyo Tech builds modern websites, full-stack web apps, admin dashboards, and scalable Next.js & MERN solutions for businesses in Lahore and beyond.",
  keywords:
    "Muhyo Tech, Full Stack Developer, Next.js Developer, React Developer, Node.js Developer, Web Development Pakistan, SaaS Dashboard, SEO Web Design",
  author: "Pir Ghulam Muhyo Din",
  ogImage: "/home-preview.png",
  twitterHandle: "@muhyotech",
};

export function absoluteUrl(path = "") {
  if (!path) return SITE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function cleanSeoText(value = "", maxLength = 155) {
  const text = String(value)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (text.length <= maxLength) return text;

  const shortened = text.slice(0, Math.max(1, maxLength - 1));
  const boundary = shortened.lastIndexOf(" ");
  const end = boundary > maxLength * 0.7 ? boundary : shortened.length;
  return `${shortened.slice(0, end).trim()}…`;
}

export function buildCanonical(path = "") {
  return absoluteUrl(path).replace(/\/$/, "");
}

export function getSeoImage(image) {
  return absoluteUrl(image || defaultSeoData.ogImage);
}

export const generateMetadata = (pageTitle, pageDescription) => {
  return {
    title: pageTitle ? `${pageTitle} | Muhyo Tech` : defaultSeoData.title,
    description: pageDescription || defaultSeoData.description,
    keywords: defaultSeoData.keywords,
    author: defaultSeoData.author,
    openGraph: {
      title: pageTitle || defaultSeoData.title,
      description: pageDescription || defaultSeoData.description,
      images: [
        {
          url: getSeoImage(defaultSeoData.ogImage),
          width: 1200,
          height: 630,
          alt: "Muhyo Tech",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      creator: defaultSeoData.twitterHandle,
    },
  };
};

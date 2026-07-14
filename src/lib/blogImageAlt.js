import { ensureMuhyoTechAlt } from "@/lib/mediaAlt";

export function ensureBlogImageAlt(altText, title) {
  const cleanTitle = String(title || "").replace(/\s+/g, " ").trim();
  const fallback = cleanTitle
    ? `editorial blog cover illustrating ${cleanTitle}`
    : "professional software engineering blog cover";
  const description = String(altText || fallback)
    .replace(/\s+/g, " ")
    .trim();

  return ensureMuhyoTechAlt(description, fallback);
}

export function getBlogImageAlt(blog = {}) {
  return ensureBlogImageAlt(blog.featuredImage?.alt, blog.title);
}

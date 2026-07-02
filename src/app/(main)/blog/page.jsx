import Blog from "@/components/Blog";
import { portfolioData } from "@/lib/data";
import { BlogController } from "@/controllers/BlogController";
import { serializeDoc } from "@/lib/mongooseHelper";
import { buildCanonical, getSeoImage } from "@/lib/seo";

// P1 OPTIMIZATION: Enable ISR (Incremental Static Regeneration)
// Revalidate every 5 minutes = Cache hits for 95%+ of users
// Removes force-dynamic that causes every page view to hit database
export const revalidate = 300;

export const metadata = {
  title: "Tech Blog | Engineering Insights by Muhyo Tech",
  description:
    "Read practical engineering guides on Next.js, Node.js, web performance, SEO, backend architecture, deployment, and modern product development.",
  alternates: { canonical: buildCanonical("/blog") },
  openGraph: {
    title: "Muhyo Tech Blog - Engineering, SEO & Web Development",
    description:
      "Practical guides on Next.js, Node.js, performance, SEO, backend architecture, and modern web development.",
    url: buildCanonical("/blog"),
    images: [{ url: getSeoImage("/portfolio-hero.png"), width: 1200, height: 630, alt: "Muhyo Tech blog" }],
    type: "website",
  },
};

export default async function BlogPage() {
  // Get merged blogs: MongoDB + data.js fallback items
  // Note: BlogController.getAll(true) already handles serialization and merging
  const blogs = await BlogController.getAll(true).catch(
    () => portfolioData.blogs,
  );

  return (
    <div className="pt-0">
      <Blog data={blogs} />
    </div>
  );
}

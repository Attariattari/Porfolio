import Blog from "@/components/Blog";
import { portfolioData } from "@/lib/data";
import { BlogController } from "@/controllers/BlogController";
import { serializeDoc } from "@/lib/mongooseHelper";

// P1 OPTIMIZATION: Enable ISR (Incremental Static Regeneration)
// Revalidate every 5 minutes = Cache hits for 95%+ of users
// Removes force-dynamic that causes every page view to hit database
export const revalidate = 300;

export const metadata = {
  title: "Tech Blog | Engineering Insights by Muhyo Tech",
  description:
    "In-depth tutorials, technical guides, and architectural insights on Next.js, Node.js, and modern web development.",
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

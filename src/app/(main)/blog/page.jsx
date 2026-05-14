import Blog from "@/components/Blog";
import { portfolioData } from "@/lib/data";
import { BlogController } from "@/controllers/BlogController";
import { serializeDoc } from "@/lib/mongooseHelper";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: "Tech Blog | Engineering Insights by Muhyo Tech",
  description: "In-depth tutorials, technical guides, and architectural insights on Next.js, Node.js, and modern web development.",
};

export default async function BlogPage() {
  // Get merged blogs: MongoDB + unused data.js items - IMPORTANT: Serialize Mongoose documents
  const dbBlogs = await BlogController.getAll(true).catch(() => []);
  const blogs =
    (dbBlogs?.length > 0 ? serializeDoc(dbBlogs) : null) || portfolioData.blogs;

  return (
    <div className="pt-0">
      <Blog data={blogs} />
    </div>
  );
}

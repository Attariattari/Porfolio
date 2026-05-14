import BlogPostDetail from "@/components/BlogPostDetail";
import { BlogController } from "@/controllers/BlogController";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateStaticParams() {
  const blogs = await BlogController.getAll(true);
  return blogs.map((blog) => ({
    slug: blog.slug,
  }));
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug || resolvedParams.id;
  const decodedSlug = slug ? decodeURIComponent(slug) : "";

  const blog = await BlogController.getOne(decodedSlug);

  if (!blog) return { title: "Blog Post Not Found" };

  return {
    title: `${blog.title} | Muhyo Tech Blog`,
    description: blog.summary,
    openGraph: {
      title: blog.title,
      description: blog.summary,
      images: [blog.image],
      type: "article",
    },
  };
}

export default async function BlogPostPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug || resolvedParams.id;
  const decodedSlug = slug ? decodeURIComponent(slug) : "";

  const blog = await BlogController.getOne(decodedSlug);

  if (!blog || (blog.publishStatus !== "published" && !blog._isFromDataJs)) {
    notFound();
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": blog.title,
    "description": blog.summary,
    "image": blog.image,
    "author": {
      "@type": "Person",
      "name": blog.author || "Muhyo Tech"
    },
    "datePublished": blog.createdAt || blog.date
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <BlogPostDetail blog={blog} />
    </>
  );
}

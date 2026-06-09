import BlogPostDetail from "@/components/BlogPostDetail";
import { BlogController } from "@/controllers/BlogController";
import { notFound } from "next/navigation";

// P7 OPTIMIZATION: ISR with static generation
// Revalidate every hour to keep detail pages fresh
export const revalidate = 3600;

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

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://muhyo-tech.vercel.app";
  const canonicalUrl = `${baseUrl}/blog/${blog.slug}`;

  return {
    title: `${blog.title} | Muhyo Tech Blog`,
    description: blog.summary,
    keywords: blog.tags?.join(", ") || "Next.js, Web Development, Software Engineering",
    canonical: canonicalUrl,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: blog.title,
      description: blog.summary,
      images: [blog.image],
      type: "article",
      publishedTime: blog.createdAt || blog.date,
      authors: [blog.author || "Muhyo Tech"],
      url: canonicalUrl,
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description: blog.summary,
      images: [blog.image],
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

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://muhyo-tech.vercel.app";
  const canonicalUrl = `${baseUrl}/blog/${blog.slug}`;
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    description: blog.summary,
    image: {
      "@type": "ImageObject",
      url: blog.image,
    },
    author: {
      "@type": "Person",
      name: blog.author || "Muhyo Tech",
      url: baseUrl,
    },
    datePublished: blog.createdAt || blog.date,
    dateModified: blog.updatedAt || blog.createdAt || blog.date,
    keywords: blog.tags?.join(", ") || "",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "Muhyo Tech",
      url: baseUrl,
    },
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

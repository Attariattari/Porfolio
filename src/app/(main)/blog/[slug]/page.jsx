import BlogPostDetail from "@/components/BlogPostDetail";
import { BlogController } from "@/controllers/BlogController";
import { notFound } from "next/navigation";
import { SITE_URL } from "@/lib/config";
import { buildCanonical, cleanSeoText, getSeoImage } from "@/lib/seo";

// P7 OPTIMIZATION: ISR with static generation
// Revalidate every hour to keep detail pages fresh
export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const blogs = await BlogController.getAll(true);
    return (blogs || []).map((blog) => ({
      slug: blog.slug,
    }));
  } catch (error) {
    console.error("[BlogPage] generateStaticParams failed:", error.message);
    return [];
  }
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug || resolvedParams.id;
  const decodedSlug = slug ? decodeURIComponent(slug) : "";

  const blog = await BlogController.getOne(decodedSlug);

  if (!blog) return { title: "Blog Post Not Found" };

  const canonicalUrl = buildCanonical(`/blog/${blog.slug}`);
  const description = cleanSeoText(blog.summary || blog.content, 155);
  const image = getSeoImage(blog.image || blog.featuredImage?.url);

  return {
    title: `${blog.title} | Muhyo Tech Blog`,
    description,
    keywords:
      blog.tags?.join(", ") || "Next.js, Web Development, Software Engineering",
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: blog.title,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: blog.title }],
      type: "article",
      publishedTime: blog.createdAt || blog.date,
      modifiedTime: blog.updatedAt || blog.createdAt || blog.date,
      authors: [blog.author || "Muhyo Tech"],
      url: canonicalUrl,
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description,
      images: [image],
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

  const baseUrl = SITE_URL;
  const canonicalUrl = buildCanonical(`/blog/${blog.slug}`);
  const image = getSeoImage(blog.image || blog.featuredImage?.url);
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    description: cleanSeoText(blog.summary || blog.content, 155),
    image: {
      "@type": "ImageObject",
      url: image,
      width: 1200,
      height: 630,
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
      logo: {
        "@type": "ImageObject",
        url: getSeoImage("/logo.png"),
      },
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

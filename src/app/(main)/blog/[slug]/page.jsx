import BlogPostDetail from "@/components/BlogPostDetail";
import { BlogController } from "@/controllers/BlogController";
import { notFound } from "next/navigation";
import { SITE_URL } from "@/lib/config";
import { buildCanonical, getSeoImage } from "@/lib/seo";
import {
  getBlogModifiedDate,
  getBlogPublishedDate,
  getBlogSeoDescription,
  getBlogSeoTitle,
  getBlogServiceLinks,
  getBlogWordCount,
  getRelatedBlogs,
  isBlogIndexable,
} from "@/lib/blogSeo";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";

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

  const canonicalUrl = buildCanonical(`/blog/${blog.slug}`);
  const description = getBlogSeoDescription(blog);
  const image = getSeoImage(blog.image || blog.featuredImage?.url);
  const shouldIndex = isBlogIndexable(blog);
  const seoTitle = getBlogSeoTitle(blog);

  return {
    title: { absolute: `${seoTitle} | Muhyo Tech` },
    description,
    keywords: [
      blog.focusKeyword,
      ...(blog.tags || []),
      blog.category,
      "Muhyo Tech",
    ].filter(Boolean),
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: shouldIndex,
      follow: true,
      googleBot: {
        index: shouldIndex,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      title: blog.title,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: blog.title }],
      type: "article",
      publishedTime: getBlogPublishedDate(blog),
      modifiedTime: getBlogModifiedDate(blog),
      authors: [blog.author || "Pir Ghulam Muhyo Din"],
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

  const [blog, publishedBlogs] = await Promise.all([
    BlogController.getOne(decodedSlug),
    BlogController.getAll(true).catch(() => []),
  ]);

  if (!blog || (blog.publishStatus !== "published" && !blog._isFromDataJs)) {
    notFound();
  }

  const baseUrl = SITE_URL;
  const canonicalUrl = buildCanonical(`/blog/${blog.slug}`);
  const relatedBlogs = getRelatedBlogs(blog, publishedBlogs, 3);
  const relatedServices = getBlogServiceLinks(blog, 3);
  const image = getSeoImage(blog.image || blog.featuredImage?.url);
  const publishedDate = getBlogPublishedDate(blog);
  const modifiedDate = getBlogModifiedDate(blog);
  const description = getBlogSeoDescription(blog);
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    description,
    image: {
      "@type": "ImageObject",
      url: image,
      width: 1200,
      height: 630,
    },
    author: {
      "@type": "Person",
      name: blog.author || "Pir Ghulam Muhyo Din",
      url: buildCanonical("/about"),
    },
    datePublished: publishedDate,
    dateModified: modifiedDate,
    articleSection: blog.category || "Web Engineering",
    wordCount: getBlogWordCount(blog),
    inLanguage: "en",
    isAccessibleForFree: true,
    keywords: blog.tags?.join(", ") || "",
    about: (blog.tags || []).slice(0, 8).map((tag) => ({
      "@type": "Thing",
      name: tag,
    })),
    isPartOf: {
      "@type": "Blog",
      name: "Muhyo Tech Engineering Blog",
      url: buildCanonical("/blog"),
    },
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
      <BreadcrumbSchema
        items={[
          { name: "Home", url: SITE_URL },
          { name: "Blog", url: buildCanonical("/blog") },
          { name: blog.title, url: canonicalUrl },
        ]}
      />
      <BlogPostDetail
        blog={blog}
        shareUrl={canonicalUrl}
        relatedBlogs={relatedBlogs}
        relatedServices={relatedServices}
      />
    </>
  );
}

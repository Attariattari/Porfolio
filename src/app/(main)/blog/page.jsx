import Blog from "@/components/Blog";
import { portfolioData } from "@/lib/data";
import { BlogController } from "@/controllers/BlogController";
import { serializeDoc } from "@/lib/mongooseHelper";
import { buildCanonical, getSeoImage } from "@/lib/seo";
import { SITE_URL } from "@/lib/config";
import { getBlogPublishedDate, getBlogSeoDescription } from "@/lib/blogSeo";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";

// P1 OPTIMIZATION: Enable ISR (Incremental Static Regeneration)
// Revalidate every 5 minutes = Cache hits for 95%+ of users
// Removes force-dynamic that causes every page view to hit database
export const revalidate = 300;

const toPublicBlogCard = (blog = {}) => ({
  id: blog.id || blog._id,
  slug: blog.slug,
  title: blog.title,
  summary: blog.summary,
  image: blog.image,
  featuredImage: blog.featuredImage
    ? { url: blog.featuredImage.url, alt: blog.featuredImage.alt }
    : undefined,
  category: blog.category,
  tags: blog.tags || [],
  date: blog.date,
  author: blog.author,
  readTime: blog.readTime,
  publishStatus: blog.publishStatus,
  featured: blog.featured,
  featuredOrder: blog.featuredOrder,
  featuredScore: blog.featuredScore,
  qualityScore: blog.qualityScore,
  order: blog.order,
  createdAt: blog.createdAt,
  generatedAt: blog.generatedAt,
  updatedAt: blog.updatedAt,
  views: blog.views,
  _isFromDataJs: blog._isFromDataJs,
});

export const metadata = {
  title: { absolute: "Web Development & Engineering Blog | Muhyo Tech" },
  description:
    "Read practical engineering guides on Next.js, Node.js, web performance, SEO, backend architecture, deployment, and modern product development.",
  alternates: { canonical: buildCanonical("/blog") },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Muhyo Tech Blog - Engineering, SEO & Web Development",
    description:
      "Practical guides on Next.js, Node.js, performance, SEO, backend architecture, and modern web development.",
    url: buildCanonical("/blog"),
    images: [{ url: getSeoImage("/blog-preview.png"), width: 1200, height: 630, alt: "Muhyo Tech Blog - Stories, Guides & Insights" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tech Blog | Engineering Insights by Muhyo Tech",
    description: "Practical guides on Next.js, Node.js, performance, SEO, backend architecture, and modern web development.",
    images: [getSeoImage("/blog-preview.png")],
  },
};

export default async function BlogPage() {
  // Get merged blogs: MongoDB + data.js fallback items
  // Note: BlogController.getAll(true) already handles serialization and merging
  const initialPage = await BlogController.getPublicPage({ limit: 12 });
  const blogs = initialPage.items;
  // Keep the complete records on the server for schema generation, but send
  // only card fields across the React server/client boundary. This preserves
  // every visible article and interaction while removing unused AI/editorial
  // metadata from the browser payload.
  const publicBlogCards = blogs.map(toPublicBlogCard);
  const blogCollectionSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Muhyo Tech Engineering Blog",
    description: metadata.description,
    url: buildCanonical("/blog"),
    publisher: {
      "@type": "Organization",
      name: "Muhyo Tech",
      url: SITE_URL,
    },
    blogPost: blogs
      .filter((blog) => blog.slug)
      .slice(0, 30)
      .map((blog) => ({
        "@type": "BlogPosting",
        headline: blog.title,
        description: getBlogSeoDescription(blog),
        url: buildCanonical(`/blog/${blog.slug}`),
        datePublished: getBlogPublishedDate(blog),
        author: {
          "@type": "Person",
          name: blog.author || "Pir Ghulam Muhyo Din",
          url: buildCanonical("/about"),
        },
      })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogCollectionSchema) }}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: SITE_URL },
          { name: "Blog", url: buildCanonical("/blog") },
        ]}
      />
      <div className="pt-0">
        <Blog data={publicBlogCards} initialHasMore={initialPage.hasMore} initialTotal={initialPage.total} initialCategories={initialPage.categories} />
      </div>
    </>
  );
}

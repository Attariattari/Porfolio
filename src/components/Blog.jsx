import { resolveFeaturedBlogs } from "@/lib/blogUtils";
import BlogContent from "./BlogContent";

const parseCategories = (cat) => {
  if (!cat) return [];
  if (typeof cat !== "string") return [];
  return cat.split(/[|,/]/).map((c) => c.trim()).filter(Boolean);
};

export default function Blog({
  data,
  isHomePage = false,
  initialHasMore = false,
  initialTotal = 0,
  initialCategories = [],
  latestPublishedDate = null,
}) {
  if (!data) return null;

  const rawCategories = [
    ...(initialCategories || []).flatMap(parseCategories),
    ...(data || []).flatMap((b) => parseCategories(b.category)),
  ];

  // Server-safe precomputation — moved off the browser main thread
  const computedCategories = [
    "All",
    ...new Set(rawCategories.filter(Boolean)),
  ];

  const featuredBlogs = resolveFeaturedBlogs(data, data);

  const trendingTags = [
    ...new Set(data.flatMap((b) => b.tags || [])),
  ].slice(0, 6);

  // Homepage branch precomputation
  let homeBlogs = null;
  let showingFeatured = false;
  if (isHomePage) {
    showingFeatured = featuredBlogs.length > 0;
    homeBlogs = (
      showingFeatured
        ? featuredBlogs
        : data.filter(
            (blog) => !blog.publishStatus || blog.publishStatus === "published",
          )
    ).slice(0, 3);
  }

  return (
    <BlogContent
      data={data}
      isHomePage={isHomePage}
      initialHasMore={initialHasMore}
      initialTotal={initialTotal}
      initialCategories={computedCategories}
      featuredBlogs={featuredBlogs}
      trendingTags={trendingTags}
      homeBlogs={homeBlogs}
      showingFeatured={showingFeatured}
      latestPublishedDate={latestPublishedDate}
    />
  );
}

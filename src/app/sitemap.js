import { SITE_URL } from "@/lib/config";
import { BlogController } from "@/controllers/BlogController";
import { ProjectController } from "@/controllers/ProjectController";
import { ServiceController } from "@/controllers/ServiceController";
import { isBlogIndexable } from "@/lib/blogSeo";
import { getCanonicalServices } from "@/lib/servicesSeo";
import {
    discoverPublicPageRoutes,
    getPageSitemapMetadata,
    getSafeSitemapSlug,
    getValidLastModified,
    isPublishedSitemapItem,
    uniqueSitemapEntries,
} from "@/lib/sitemapRoutes";

// Keep discovery responsive to newly published content while avoiding a
// database read for every crawler request.
export const revalidate = 300;

export default async function sitemap() {
    const baseUrl = SITE_URL;

    // Fetch dynamic content
    const [blogs, projects, services] = await Promise.all([
        BlogController.getAll(true).catch(() => []),
        ProjectController.getAll(true).catch(() => []),
        ServiceController.getAll(true).catch(() => []),
    ]);

    const withLastModified = (entry, item) => {
        const lastModified = getValidLastModified(item);
        return lastModified ? { ...entry, lastModified } : entry;
    };

    const publicPageUrls = discoverPublicPageRoutes().map((route) => ({
        url: `${baseUrl}${route === "/" ? "" : route}`,
        ...getPageSitemapMetadata(route),
    }));

    const blogUrls = blogs
        .filter((blog) => isPublishedSitemapItem(blog) && isBlogIndexable(blog))
        .map((blog) => ({ item: blog, slug: getSafeSitemapSlug(blog) }))
        .filter(({ slug }) => slug)
        .map(({ item, slug }) => withLastModified({
            url: `${baseUrl}/blog/${slug}`,
            changeFrequency: "weekly",
            priority: 0.7,
        }, item));

    const projectUrls = projects
        .filter(isPublishedSitemapItem)
        .map((project) => ({ item: project, slug: getSafeSitemapSlug(project) }))
        .filter(({ slug }) => slug)
        .map(({ item, slug }) => withLastModified({
            url: `${baseUrl}/projects/${slug}`,
            changeFrequency: "monthly",
            priority: 0.75,
        }, item));

    const serviceUrls = getCanonicalServices(services)
        .filter(isPublishedSitemapItem)
        .map((service) => ({ item: service, slug: getSafeSitemapSlug(service) }))
        .filter(({ slug }) => slug)
        .map(({ item, slug }) => withLastModified({
            url: `${baseUrl}/services/${slug}`,
            changeFrequency: "monthly",
            priority: 0.85,
        }, item));

    return uniqueSitemapEntries([
        ...publicPageUrls,
        ...blogUrls,
        ...projectUrls,
        ...serviceUrls,
    ]);
}

import { SITE_URL } from "@/lib/config";
import { BlogController } from "@/controllers/BlogController";
import { ProjectController } from "@/controllers/ProjectController";
import { ServiceController } from "@/controllers/ServiceController";
import { isBlogIndexable } from "@/lib/blogSeo";

export default async function sitemap() {
    const baseUrl = SITE_URL;

    // Fetch dynamic content
    const [blogs, projects, services] = await Promise.all([
        BlogController.getAll(true, { includeContent: true }).catch(() => []),
        ProjectController.getAll(true).catch(() => []),
        ServiceController.getAll(true).catch(() => []),
    ]);

    const withLastModified = (entry, item) => {
        const lastModified = item?.updatedAt || item?.createdAt;
        return lastModified ? { ...entry, lastModified } : entry;
    };

    const uniqueByUrl = (entries) => [
        ...new Map(entries.map((entry) => [entry.url, entry])).values(),
    ];

    const blogUrls = blogs
        .filter((b) => isBlogIndexable(b))
        .map((b) => withLastModified({
            url: `${baseUrl}/blog/${b.slug}`,
            changeFrequency: "weekly",
            priority: 0.7,
        }, b));

    const projectUrls = projects
        .filter((p) => p.slug)
        .map((p) => withLastModified({
            url: `${baseUrl}/projects/${p.slug}`,
            changeFrequency: "monthly",
            priority: 0.75,
        }, p));

    const serviceUrls = services
        .filter((s) => s.slug)
        .map((s) => withLastModified({
            url: `${baseUrl}/services/${s.slug}`,
            changeFrequency: "monthly",
            priority: 0.85,
        }, s));

    const staticUrls = [
        { url: baseUrl, changeFrequency: "weekly", priority: 1 },
        { url: `${baseUrl}/services`, changeFrequency: "weekly", priority: 0.95 },
        { url: `${baseUrl}/projects`, changeFrequency: "weekly", priority: 0.9 },
        { url: `${baseUrl}/blog`, changeFrequency: "daily", priority: 0.9 },
        { url: `${baseUrl}/contact`, changeFrequency: "monthly", priority: 0.85 },
        { url: `${baseUrl}/book-a-call`, changeFrequency: "monthly", priority: 0.85 },
        { url: `${baseUrl}/about`, changeFrequency: "monthly", priority: 0.8 },
        { url: `${baseUrl}/resume`, changeFrequency: "monthly", priority: 0.6 },
    ];

    return uniqueByUrl([...staticUrls, ...blogUrls, ...projectUrls, ...serviceUrls]);
}

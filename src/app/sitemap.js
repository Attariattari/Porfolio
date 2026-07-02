import { SITE_URL } from "@/lib/config";
import { BlogController } from "@/controllers/BlogController";
import { ProjectController } from "@/controllers/ProjectController";
import { ServiceController } from "@/controllers/ServiceController";

export default async function sitemap() {
    const baseUrl = SITE_URL;

    // Fetch dynamic content
    const [blogs, projects, services] = await Promise.all([
        BlogController.getAll(true).catch(() => []),
        ProjectController.getAll(true).catch(() => []),
        ServiceController.getAll(true).catch(() => []),
    ]);

    const blogUrls = blogs.map((b) => ({
        url: `${baseUrl}/blog/${b.slug}`,
        lastModified: b.updatedAt || new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
    }));

    const projectUrls = projects.map((p) => ({
        url: `${baseUrl}/projects/${p.slug}`,
        lastModified: p.updatedAt || new Date(),
        changeFrequency: "monthly",
        priority: 0.75,
    }));

    const serviceUrls = services.map((s) => ({
        url: `${baseUrl}/services/${s.slug || s.id}`,
        lastModified: s.updatedAt || new Date(),
        changeFrequency: "monthly",
        priority: 0.85,
    }));

    const staticUrls = [
        { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
        { url: `${baseUrl}/services`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.95 },
        { url: `${baseUrl}/projects`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
        { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
        { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.85 },
        { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
        { url: `${baseUrl}/resume`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    ];

    return [...staticUrls, ...blogUrls, ...projectUrls, ...serviceUrls];
}

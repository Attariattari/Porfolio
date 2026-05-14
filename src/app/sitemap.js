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
    }));

    const projectUrls = projects.map((p) => ({
        url: `${baseUrl}/projects/${p.slug}`,
        lastModified: p.updatedAt || new Date(),
    }));

    const serviceUrls = services.map((s) => ({
        url: `${baseUrl}/services/${s.slug || s.id}`,
        lastModified: s.updatedAt || new Date(),
    }));

    const staticUrls = [
        { url: baseUrl, lastModified: new Date() },
        { url: `${baseUrl}/about`, lastModified: new Date() },
        { url: `${baseUrl}/projects`, lastModified: new Date() },
        { url: `${baseUrl}/blog`, lastModified: new Date() },
        { url: `${baseUrl}/services`, lastModified: new Date() },
        { url: `${baseUrl}/contact`, lastModified: new Date() },
        { url: `${baseUrl}/resume`, lastModified: new Date() },
    ];

    return [...staticUrls, ...blogUrls, ...projectUrls, ...serviceUrls];
}
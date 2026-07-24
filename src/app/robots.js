import { SITE_URL } from "@/lib/config";

const PRIVATE_ROUTES = [
    "/admin",
    "/admin/",
    "/api",
    "/api/",
    "/blog-image-upload",
    "/blog-image-upload/",
];

function isPublicProductionDeployment() {
    if (process.env.NODE_ENV !== "production") return false;

    // Vercel sets VERCEL_ENV for production, preview, and development builds.
    // Other hosting providers normally leave it undefined, in which case the
    // standard production environment remains indexable.
    return !process.env.VERCEL_ENV || process.env.VERCEL_ENV === "production";
}

export default function robots() {
    if (!isPublicProductionDeployment()) {
        return {
            rules: {
                userAgent: "*",
                disallow: "/",
            },
        };
    }

    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: PRIVATE_ROUTES,
        },
        sitemap: `${SITE_URL}/sitemap.xml`,
        host: SITE_URL,
    };
}

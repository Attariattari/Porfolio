import { SITE_URL } from "@/lib/config";

const PRIVATE_ROUTES = [
  "/admin",
  "/admin/*",
  "/api/*",
  "/dashboard",
  "/dashboard/*",
  "/messages",
  "/messages/*",
  "/blogs-management",
  "/blogs-management/*",
  "/projects-management",
  "/projects-management/*",
  "/blog-image-upload",
  "/blog-image-upload/*",
];

function isPublicProductionDeployment() {
  if (process.env.NODE_ENV !== "production") return false;
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

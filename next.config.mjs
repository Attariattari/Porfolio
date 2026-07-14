/** @type {import('next').NextConfig} */
const nextConfig = {
    reactCompiler: true,
    images: {
        minimumCacheTTL: 3600,
        deviceSizes: [640, 750, 828, 1080, 1200, 1920],
        imageSizes: [32, 48, 64, 96, 128, 256, 384],
        formats: ["image/avif", "image/webp"],
        remotePatterns: [
            { protocol: "https", hostname: "res.cloudinary.com" },
            { protocol: "https", hostname: "images.unsplash.com" },
            { protocol: "https", hostname: "**.googleusercontent.com" },
        ],
    },
    experimental: {
        optimizePackageImports: ["lucide-react", "framer-motion"],
        globalNotFound: true,
    },
    async redirects() {
        return [
            {
                source: "/blog/why-we-retired-custom-auth-systems",
                destination: "/blog/why-we-stopped-building-our-own-authentication-systems",
                permanent: true,
            },
            {
                source: "/blog/why-we-finally-sharded-our-database",
                destination: "/blog/database-sharding-when-and-why-we-finally-pulled-the-trigger",
                permanent: true,
            },
            {
                source: "/blog/mongodb-aggregation-real-world-performance",
                destination: "/blog/mongodb-aggregation-complex-data-production",
                permanent: true,
            },
            {
                source: "/blog/how-we-cured-post-merge-panic-devops-automation",
                destination: "/blog/deployment-anxiety-devops-automation",
                permanent: true,
            },
            {
                source: "/services/web-development",
                destination: "/services/custom-website-development",
                permanent: true,
            },
            {
                source: "/services/mobile-app-development",
                destination: "/services/full-stack-web-app-development",
                permanent: true,
            },
            {
                source: "/services/ui-ux-design",
                destination: "/services/landing-page-design",
                permanent: true,
            },
            {
                source: "/services/api-development",
                destination: "/services/api-integration",
                permanent: true,
            },
            {
                source: "/services/seo-digital-growth",
                destination: "/services/seo-friendly-website-setup",
                permanent: true,
            },
            {
                source: "/services/cloud-devops",
                destination: "/services/maintenance-support",
                permanent: true,
            },
            {
                source: "/contact",
                has: [
                    {
                        type: "query",
                        key: "intent",
                        value: "book-call",
                    },
                ],
                destination: "/book-a-call",
                permanent: true,
            },
            {
                source: "/book-call",
                destination: "/book-a-call",
                permanent: true,
            },
            {
                source: "/:path*",
                has: [
                    {
                        type: "host",
                        value: "portfolio-three-bice.vercel.app",
                    },
                ],
                destination: "https://www.muhyotech.com/:path*",
                permanent: true,
            },
        ];
    },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactCompiler: true,
    images: {
        // Cache optimized image variants at the edge for 30 days. Source URL
        // changes still create a new cache key, so admin media updates remain safe.
        minimumCacheTTL: 2592000,
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
    async headers() {
        const securityHeaders = [
            { key: "X-Content-Type-Options", value: "nosniff" },
            { key: "X-Frame-Options", value: "DENY" },
            { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
            {
                key: "Permissions-Policy",
                value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
            },
            {
                key: "Strict-Transport-Security",
                value: "max-age=63072000; includeSubDomains; preload",
            },
            {
                key: "Content-Security-Policy",
                value: [
                    "default-src 'self'",
                    `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""} https://cdn.jsdelivr.net https://vercel.live https://www.googletagmanager.com`,
                    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                    "font-src 'self' https://fonts.gstatic.com data:",
                    "img-src 'self' data: blob: https:",
                    "media-src 'self' https:",
                    "connect-src 'self' https: wss:",
                    "frame-src 'self' https://www.youtube.com",
                    "base-uri 'self'",
                    "form-action 'self'",
                    "frame-ancestors 'none'",
                    "object-src 'none'",
                ].join("; "),
            },
        ];

        return [
            {
                source: "/:path*",
                headers: securityHeaders,
            },
        ];
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

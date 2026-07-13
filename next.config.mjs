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

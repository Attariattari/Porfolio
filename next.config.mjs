/** @type {import('next').NextConfig} */
const nextConfig = {
    reactCompiler: true,
    images: {
        minimumCacheTTL: 60,
        deviceSizes: [640, 750, 828, 1080, 1200, 1920],
        remotePatterns: [
            { protocol: "https", hostname: "res.cloudinary.com" },
            { protocol: "https", hostname: "images.unsplash.com" },
        ],
    },
    experimental: {
        optimizePackageImports: ["lucide-react", "framer-motion"],
    },
    async redirects() {
        return [
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
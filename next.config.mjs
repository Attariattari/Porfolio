/** @type {import('next').NextConfig} */
const nextConfig = {
    reactCompiler: true,
    // Ensure Vercel can generate middleware.js.nft.json correctly
    outputFileTracing: true,
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
};

export default nextConfig;
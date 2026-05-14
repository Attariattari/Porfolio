export default function robots() {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: ["/admin/", "/api/"],
        },
        sitemap: "https://muhyo-tech.vercel.app/sitemap.xml",
    };
}
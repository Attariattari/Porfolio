import { Inter } from "next/font/google";
import "@/app/globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import ScrollToTop from "@/components/ScrollToTop";
import { Toaster } from "sonner";
import VisitorTracker from "@/components/VisitorTracker";
import NetworkListener from "@/components/NetworkListener";
import { OrganizationSchema } from "@/components/schema/OrganizationSchema";
import { SITE_URL } from "@/lib/config";
import { getSeoImage } from "@/lib/seo";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Muhyo Tech - Premium Software Engineering & Digital Solutions",
    template: "%s | Muhyo Tech",
  },
  description:
    "Muhyo Tech builds high-performance websites, SaaS dashboards, backend systems, SEO-ready web apps, and premium digital products.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Muhyo Tech - Premium Software Engineering & Digital Solutions",
    description:
      "High-performance websites, SaaS dashboards, backend systems, SEO-ready web apps, and premium digital products.",
    url: SITE_URL,
    siteName: "Muhyo Tech",
    images: [
      {
        url: getSeoImage("/portfolio-hero.png"),
        width: 1200,
        height: 630,
        alt: "Muhyo Tech",
      },
    ],
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <OrganizationSchema />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const savedTheme = localStorage.getItem('theme');
                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  let theme = savedTheme || 'system';
                  if (theme === 'system') {
                    theme = prefersDark ? 'dark' : 'light';
                  }
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider>
          <NetworkListener />
          <VisitorTracker />
          <ScrollToTop />
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "rgba(15, 23, 42, 0.95)",
                color: "#fff",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              },
              className: "rounded-xl shadow-2xl",
            }}
          />
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}


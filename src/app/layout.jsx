import { Inter } from "next/font/google";
import "@/app/globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import ScrollToTop from "@/components/ScrollToTop";
import { Toaster } from "sonner";
import DeferredRuntimeWidgets from "@/components/DeferredRuntimeWidgets";
import { OrganizationSchema } from "@/components/schema/OrganizationSchema";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { SITE_URL } from "@/lib/config";
import { getSeoImage } from "@/lib/seo";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: true,
});

const enableVercelAnalytics =
  process.env.NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS === "true";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Muhyo Tech - Premium Software Engineering & Digital Solutions",
    template: "%s | Muhyo Tech",
  },
  description:
    "Muhyo Tech builds modern websites, full-stack web apps, admin dashboards, and scalable Next.js & MERN solutions for businesses in Lahore and beyond.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Muhyo Tech - Premium Software Engineering & Digital Solutions",
    description:
      "Muhyo Tech builds modern websites, full-stack web apps, admin dashboards, and scalable Next.js & MERN solutions for businesses in Lahore and beyond.",
    url: SITE_URL,
    siteName: "Muhyo Tech",
    images: [
      {
        url: getSeoImage("/home-preview.png"),
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
        <GoogleAnalytics />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const preferredTheme = localStorage.getItem('muhyo_theme_preference');
                  const savedTheme = localStorage.getItem('muhyo_global_theme');
                  const initialTheme = ['light', 'dark', 'black'].includes(preferredTheme)
                    ? preferredTheme
                    : savedTheme;
                  const theme = ['light', 'dark', 'black'].includes(initialTheme)
                    ? initialTheme
                    : 'black';
                  const root = document.documentElement;
                  root.classList.remove('light', 'dark', 'black');
                  if (theme === 'black') {
                    root.classList.add('dark', 'black');
                  } else {
                    root.classList.add(theme);
                  }
                  root.dataset.theme = theme;
                  root.style.colorScheme = theme === 'light' ? 'light' : 'dark';
                  localStorage.setItem('muhyo_global_theme', theme);
                  localStorage.removeItem('theme');

                  const isSidebarCollapsed = localStorage.getItem('muhyo:sidebar-collapsed') === 'true';
                  document.documentElement.classList.toggle('sidebar-collapsed', isSidebarCollapsed);
                  document.documentElement.classList.toggle('sidebar-expanded', !isSidebarCollapsed);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider>
          <DeferredRuntimeWidgets />
          <ScrollToTop />
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "color-mix(in srgb, var(--popover) 95%, transparent)",
                color: "var(--popover-foreground)",
                backdropFilter: "blur(10px)",
                border: "1px solid var(--border)",
              },
              className: "rounded-xl shadow-2xl",
            }}
          />
          {enableVercelAnalytics && (
            <>
              <Analytics />
              <SpeedInsights />
            </>
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}


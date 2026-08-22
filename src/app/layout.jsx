import { Inter } from "next/font/google";
import "@/app/globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import ScrollToTop from "@/components/ScrollToTop";
import DeferredToaster from "@/components/DeferredToaster";
import { OrganizationSchema } from "@/components/schema/OrganizationSchema";
import { SITE_URL } from "@/lib/config";
import { getSeoImage } from "@/lib/seo";
import PublicAnalytics from "@/components/PublicAnalytics";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: true,
});

const enableVercelAnalytics =
  process.env.NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS !== "false";
const configuredGoogleAnalyticsId = process.env.NEXT_PUBLIC_GA_ID || "";
const googleAnalyticsId = /^G-[A-Z0-9]+$/.test(configuredGoogleAnalyticsId)
  ? configuredGoogleAnalyticsId
  : "";

export const viewport = {
  themeColor: "#000000",
  colorScheme: "light dark",
};

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Muhyo Tech - Premium Software Engineering & Digital Solutions",
    template: "%s | Muhyo Tech",
  },
  description:
    "Muhyo Tech builds modern websites, full-stack web apps, admin dashboards, and scalable Next.js & MERN solutions for businesses in Lahore and beyond.",
  icons: {
    icon: [{ url: "/logo.png", type: "image/png", sizes: "640x640" }],
    shortcut: [{ url: "/logo.png", type: "image/png" }],
    apple: [{ url: "/logo.png", type: "image/png", sizes: "640x640" }],
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
    <html lang="en" className="dark scroll-smooth" data-theme="dark" style={{ colorScheme: "dark" }} suppressHydrationWarning>
      <head>
        <OrganizationSchema />
        <link rel="dns-prefetch" href="//res.cloudinary.com" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var root = document.documentElement;
                  root.classList.add('preload-no-transition');

                  // 1. Instant Theme Synchronization (Default: dark)
                  var preferredTheme = localStorage.getItem('muhyo_theme_preference');
                  var savedTheme = localStorage.getItem('muhyo_global_theme');
                  var theme = ['light', 'dark', 'black'].includes(preferredTheme)
                    ? preferredTheme
                    : ['light', 'dark', 'black'].includes(savedTheme)
                      ? savedTheme
                      : 'dark';
                  
                  root.classList.remove('light', 'dark', 'black');
                  if (theme === 'black') {
                    root.classList.add('dark', 'black');
                  } else {
                    root.classList.add(theme);
                  }
                  root.dataset.theme = theme;
                  root.style.colorScheme = theme === 'light' ? 'light' : 'dark';

                  // 2. Instant Public Website Sidebar Layout Synchronization
                  var isWebCollapsed = localStorage.getItem('muhyo:sidebar-collapsed') === 'true';
                  if (window.innerWidth >= 768) {
                    if (isWebCollapsed) {
                      root.classList.add('sidebar-collapsed');
                      root.classList.remove('sidebar-expanded');
                    } else {
                      root.classList.add('sidebar-expanded');
                      root.classList.remove('sidebar-collapsed');
                    }
                  }

                  // 3. Instant Admin Desktop Sidebar Layout Synchronization
                  var adminUi = localStorage.getItem('muhyo-admin-ui');
                  var isAdminCollapsed = false;
                  if (adminUi) {
                    try {
                      var parsed = JSON.parse(adminUi);
                      isAdminCollapsed = Boolean(parsed && parsed.state && parsed.state.sidebarCollapsed);
                    } catch (err) {}
                  }
                  if (window.innerWidth >= 1024) {
                    if (isAdminCollapsed) {
                      root.classList.add('admin-sidebar-collapsed');
                      root.classList.remove('admin-sidebar-expanded');
                    } else {
                      root.classList.add('admin-sidebar-expanded');
                      root.classList.remove('admin-sidebar-collapsed');
                    }
                  }

                  // Lift preload transition suppression after initial paint
                  window.requestAnimationFrame(function() {
                    window.requestAnimationFrame(function() {
                      root.classList.remove('preload-no-transition');
                    });
                  });
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <PublicAnalytics
          enableVercelAnalytics={enableVercelAnalytics}
          googleAnalyticsId={googleAnalyticsId}
        />
        <ThemeProvider>
          <ScrollToTop />
          {children}
          <DeferredToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}


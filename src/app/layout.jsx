import { Inter } from "next/font/google";
import "@/app/globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Analytics } from "@vercel/analytics/react";
import ScrollToTop from "@/components/ScrollToTop";
import { Toaster } from "sonner";
import VisitorTracker from "@/components/VisitorTracker";
import NetworkListener from "@/components/NetworkListener";
import SocketRefresh from "@/components/SocketRefresh";
import { OrganizationSchema } from "@/components/schema/OrganizationSchema";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: {
    default: "Muhyo Tech — Premium Software Engineering & Digital Solutions",
    template: "%s | Muhyo Tech",
  },
  description:
    "Architecting high-performance digital solutions with a focus on scalability, aesthetics, and user experience.",
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
          <SocketRefresh />
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
        </ThemeProvider>
      </body>
    </html>
  );
}

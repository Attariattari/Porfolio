import { Inter } from "next/font/google";
import Sidebar from "@/components/Sidebar";
import { BottomNav } from "@/components/BottomNav";
import Footer from "@/components/Footer";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import InitialLoader from "@/components/InitialLoader";
import WhatsAppButton from "@/components/WhatsAppButton";
import ScrollProgress from "@/components/ScrollProgress";
import NavigationWatcher from "@/components/NavigationWatcher";
import MainProviders from "./MainProviders";
import { AboutController } from "@/controllers/AboutController";
import { portfolioData } from "@/lib/data";
import { serializeDoc } from "@/lib/mongooseHelper";
import { OrganizationSchema } from "@/components/schema/OrganizationSchema";
import { SITE_URL } from "@/lib/config";
import { getSeoImage } from "@/lib/seo";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Muhyo Tech - Full Stack Web Development & Software Engineering",
    template: "%s | Muhyo Tech",
  },
  description:
    "Muhyo Tech builds fast, scalable Next.js websites, SaaS dashboards, backend systems, SEO-ready web apps, and premium digital products.",
  keywords: [
    "Muhyo Tech",
    "Full Stack Developer",
    "Next.js Developer",
    "React Developer",
    "Node.js Developer",
    "Web Development Pakistan",
    "SaaS Dashboard Development",
    "SEO Web Design",
  ],
  authors: [{ name: "Pir Ghulam Muhyo Din", url: SITE_URL }],
  creator: "Pir Ghulam Muhyo Din",
  publisher: "Muhyo Tech",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "Muhyo Tech - Full Stack Web Development & Software Engineering",
    description:
      "High-performance websites, SaaS dashboards, backend systems, and SEO-ready digital products by Muhyo Tech.",
    url: SITE_URL,
    siteName: "Muhyo Tech",
    images: [
      {
        url: getSeoImage("/portfolio-hero.png"),
        width: 1200,
        height: 630,
        alt: "Muhyo Tech full stack web development portfolio",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Muhyo Tech - Full Stack Web Development",
    description: "Next.js, React, Node.js, SaaS dashboards, backend systems, and SEO-ready websites.",
    images: [getSeoImage("/portfolio-hero.png")],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function MainLayout({ children }) {
  // Global Hybrid Sync - IMPORTANT: Serialize Mongoose docs to plain objects
  const dbAbout = await AboutController.get().catch(() => null);
  const serializedAbout = dbAbout ? serializeDoc(dbAbout) : null;
  const globalAbout = serializedAbout || portfolioData.about;

  return (
    <div
      className={`${inter.className} transition-colors duration-300 relative pb-32 md:pb-0`}
    >
      <InitialLoader />
      <NavigationWatcher />
      <ScrollProgress />
      <Sidebar data={globalAbout} />
      <BottomNav />
      <AnimatedBackground />
      <WhatsAppButton />
      <div
        className="site-main-shell flex flex-col min-h-screen relative z-10 transition-[padding] duration-500 ease-in-out pt-16 md:pt-0"
        style={{ paddingLeft: "var(--sidebar-width, 0px)" }}
      >
        <MainProviders>
          <main className="grow">{children}</main>
        </MainProviders>
        <Footer data={globalAbout} />
      </div>
    </div>
  );
}

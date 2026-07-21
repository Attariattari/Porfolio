import ProfessionalSidebar from "@/components/ProfessionalSidebar";
import { BottomNav } from "@/components/BottomNav";
import Footer from "@/components/Footer";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import InitialLoader from "@/components/InitialLoader";
import DeferredWhatsAppButton from "@/components/DeferredWhatsAppButton";
import ScrollProgress from "@/components/ScrollProgress";
import DeferredNavigationWatcher from "@/components/DeferredNavigationWatcher";
import { AboutController } from "@/controllers/AboutController";
import { portfolioData } from "@/lib/data";
import { serializeDoc } from "@/lib/mongooseHelper";
import { SITE_URL } from "@/lib/config";
import { getSeoImage } from "@/lib/seo";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Full-Stack Web Development | Muhyo Tech",
    template: "%s | Muhyo Tech",
  },
  description:
    "Muhyo Tech builds modern websites, full-stack web apps, admin dashboards, and scalable Next.js & MERN solutions for businesses in Lahore and beyond.",
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
      "Muhyo Tech builds modern websites, full-stack web apps, admin dashboards, and scalable Next.js & MERN solutions for businesses in Lahore and beyond.",
    url: SITE_URL,
    siteName: "Muhyo Tech",
    images: [
      {
        url: getSeoImage("/home-preview.png"),
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
    description: "Modern websites, web apps, admin dashboards, and scalable Next.js & MERN solutions.",
    images: [getSeoImage("/home-preview.png")],
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
      className="relative pb-32 transition-colors duration-300 md:pb-0"
    >
      <InitialLoader />
      <DeferredNavigationWatcher />
      <ScrollProgress />
      <ProfessionalSidebar data={globalAbout} />
      <BottomNav />
      <AnimatedBackground />
      <DeferredWhatsAppButton />
      <div
        className="site-main-shell flex flex-col min-h-screen relative z-10 transition-[padding] duration-500 ease-in-out pt-16 md:pt-0 pl-[var(--sidebar-width,0px)]"
      >
        <a className="skip-to-content" href="#main-content">
          Skip to content
        </a>
        <main id="main-content" className="grow">{children}</main>
        <Footer data={globalAbout} />
      </div>
    </div>
  );
}

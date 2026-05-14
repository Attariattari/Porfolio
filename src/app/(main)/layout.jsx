import { Inter } from "next/font/google";
import Sidebar from "@/components/Sidebar";
import { BottomNav } from "@/components/BottomNav";
import Footer from "@/components/Footer";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import InitialLoader from "@/components/InitialLoader";
import WhatsAppButton from "@/components/WhatsAppButton";
import ScrollProgress from "@/components/ScrollProgress";
import MainDataProvider from "./MainDataProvider";
import { AboutController } from "@/controllers/AboutController";
import { portfolioData } from "@/lib/data";
import { serializeDoc } from "@/lib/mongooseHelper";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  metadataBase: new URL("https://muhyo-tech.vercel.app"),
  title: {
    default: "Muhyo Tech - Full Stack Web Developer & UI Designer",
    template: "%s | Muhyo Tech",
  },
  description:
    "Senior Full-Stack Developer specializing in high-performance Next.js applications, modern UI/UX design, and scalable backend solutions.",
  keywords: [
    "Full Stack Developer",
    "Next.js Expert",
    "React Developer",
    "Muhyo Tech",
    "Portfolio",
  ],
  openGraph: {
    title: "Muhyo Tech - Professional Portfolio",
    description:
      "Explore the technical expertise and creative works of a senior full-stack developer.",
    url: "https://muhyo-tech.vercel.app",
    siteName: "Muhyo Tech",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Muhyo Tech",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Muhyo Tech",
    description: "Full Stack Developer & UI Designer Portfolio",
    images: ["/logo.png"],
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
      <ScrollProgress />
      <Sidebar data={globalAbout} />
      <BottomNav />
      <AnimatedBackground />
      <WhatsAppButton />
      <div
        className="flex flex-col min-h-screen relative z-10 transition-[padding] duration-500 ease-in-out pt-16 md:pt-0"
        style={{ paddingLeft: "var(--sidebar-width, 0px)" }}
      >
        <MainDataProvider>
          <main className="grow">{children}</main>
        </MainDataProvider>
        <Footer data={globalAbout} />
      </div>
    </div>
  );
}

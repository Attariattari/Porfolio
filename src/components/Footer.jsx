import Link from "next/link";
import Image from "next/image";
import {
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import SocialLinks from "./SocialLinks";
import {
  FooterAnchorLink,
  FooterBackToTop,
  FooterLegalLinks,
  FooterNewsletterForm,
} from "./FooterInteractions";

// Keep the small, static footer navigation local to this client component.
// Importing the full data catalogue here would ship every project, service,
// and blog record to every public page.
const footerData = {
  navigation: [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Services", href: "/services" },
    { name: "Projects", href: "/projects" },
  ],
  resources: [
    { name: "Blog", href: "/blog" },
    { name: "Resume", href: "/resume" },
    { name: "Skills", href: "/#skills" },
    { name: "Contact", href: "/contact" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
  ],
};

export default function Footer({ data, socials = [] }) {
  const about = data || {};
  const brandAccent = about.lastName || "Tech";
  const configuredTitle = about.firstName || "Muhyo";
  const brandTitle = configuredTitle.toLowerCase().endsWith(brandAccent.toLowerCase())
    ? configuredTitle.slice(0, -brandAccent.length).trim()
    : configuredTitle;
  const displayName = `${brandTitle || "Muhyo"} ${brandAccent}`;
  const publicEmail = "MuhyoTech@gmail.com";
  const publicLocation = "Chota, Mohlanwal Road, Badu Pura Chung, Lahore 53720, Pakistan";

  const footerLinks = {
    navigation: footerData.navigation,
    resources: footerData.resources,
    legal: footerData.legal,
  };

  const portfolioLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Services", href: "/services" },
    { name: "Projects", href: "/projects" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <footer className="relative border-t border-border/35 px-6 pt-12 pb-8 overflow-hidden">
      <div className="absolute top-0 left-10 h-24 w-24 rounded-full border border-accent/10 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[460px] h-[460px] bg-accent/5 blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="container mx-auto relative z-10">
        <div className="overflow-hidden rounded-[28px] border border-border/60 bg-background/55 backdrop-blur-sm">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.65fr]">
            <div className="border-b border-border/60 p-6 sm:p-7 lg:border-b-0 lg:border-r">
              <Link href="/" className="mb-5 flex w-fit items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent p-2.5 shadow-lg shadow-accent/20">
                  <Image
                    src="/logo.webp"
                    alt="Muhyo Tech logo"
                    width={24}
                    height={24}
                    className="h-full w-full object-contain"
                    sizes="24px"
                    loading="lazy"
                  />
                </div>
                <span className="text-xl font-bold tracking-tight text-foreground">
                  {brandTitle || "Muhyo"}{" "}
                  <span className="text-accent">{brandAccent}</span>
                </span>
              </Link>

              <h3 className="mb-3 max-w-md text-2xl font-bold tracking-tight text-foreground">
                Building polished digital products with clean engineering.
              </h3>
              <p className="mb-6 max-w-md text-sm leading-relaxed text-muted-foreground">
                Portfolio work, web apps, dashboards, and launch-ready
                experiences crafted with performance and detail in mind.
              </p>

              <FooterNewsletterForm />

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 rounded-full border border-border/60 bg-muted/20 px-3 py-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-[11px] font-semibold text-foreground/80">
                    Available for selected projects
                  </span>
                </div>
                <SocialLinks
                  socials={socials}
                  className="flex items-center gap-2"
                  buttonClassName="w-9 h-9 rounded-full border border-border/60 bg-muted/15 flex items-center justify-center transition-all duration-300"
                  iconSize="w-4 h-4"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-x-6 gap-y-8 p-6 sm:grid-cols-2 sm:p-7 lg:grid-cols-4">
              <div>
                <h4 className="mb-4 text-[10px] font-bold tracking-[0.18em] text-accent">
                  PORTFOLIO
                </h4>
                <ul className="space-y-3">
                  {portfolioLinks.map((link) => (
                    <li key={link.name}>
                      <FooterAnchorLink
                        href={link.href}
                        className="group flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-accent"
                      >
                        {link.name}
                        <ChevronRight
                          size={12}
                          className="opacity-0 -translate-x-2 transition-all group-hover:translate-x-1 group-hover:opacity-100"
                        />
                      </FooterAnchorLink>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="mb-4 text-[10px] font-bold tracking-[0.18em] text-accent">
                  RESOURCES
                </h4>
                <ul className="space-y-3">
                  {footerLinks.resources.map((link) => (
                    <li key={link.name}>
                      <FooterAnchorLink
                        href={link.href}
                        className="group flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-accent"
                      >
                        {link.name}
                        <ChevronRight
                          size={12}
                          className="opacity-0 -translate-x-2 transition-all group-hover:translate-x-1 group-hover:opacity-100"
                        />
                      </FooterAnchorLink>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="mb-4 text-[10px] font-bold tracking-[0.18em] text-accent">
                  CONNECT
                </h4>
                <ul className="space-y-3">
                  <li>
                    <a
                      href={`mailto:${publicEmail}`}
                      className="group flex min-w-0 items-start gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-accent"
                      aria-label="Email Muhyo Tech"
                    >
                      <span className="min-w-0 break-all">{publicEmail}</span>
                      <ExternalLink
                        size={12}
                        className="mt-1 shrink-0 opacity-50 transition-opacity group-hover:opacity-100"
                      />
                    </a>
                  </li>
                  <li>
                    <Link
                      href="/contact"
                      className="group flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-accent"
                    >
                      Start a project
                      <ChevronRight
                        size={12}
                        className="opacity-0 -translate-x-2 transition-all group-hover:translate-x-1 group-hover:opacity-100"
                      />
                    </Link>
                  </li>
                  <li>
                    <a
                      href="tel:+923224458481"
                      className="block text-sm font-medium text-muted-foreground transition-colors hover:text-accent"
                    >
                      Phone: +92 322 4458481
                    </a>
                  </li>
                  <li>
                    <address className="mb-0 text-sm font-medium not-italic leading-relaxed text-muted-foreground">
                      {publicLocation}
                    </address>
                  </li>
                  <li>
                    <Link
                      href="/resume"
                      className="group flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-accent"
                    >
                      View resume
                      <ChevronRight
                        size={12}
                        className="opacity-0 -translate-x-2 transition-all group-hover:translate-x-1 group-hover:opacity-100"
                      />
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="mb-4 text-[10px] font-bold tracking-[0.18em] text-accent">
                  LEGAL
                </h4>
                <ul className="space-y-3">
                  <FooterLegalLinks links={footerLinks.legal} />
                </ul>
              </div>

            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-5 flex flex-col md:flex-row justify-between items-center gap-5">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <p className="mb-0 text-[11px] font-medium text-muted-foreground">
              &copy; {new Date().getFullYear()} {displayName}. All rights reserved.
            </p>
            <div className="hidden md:block w-[1px] h-4 bg-border/60" />
            <address className="mb-0 text-[11px] font-medium not-italic text-muted-foreground">
              {publicLocation}
            </address>
          </div>

          <FooterBackToTop />
        </div>
      </div>
    </footer>
  );
}

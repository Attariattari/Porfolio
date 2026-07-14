import LegalDocumentPage from "@/components/legal/LegalDocumentPage";

export const metadata = {
  title: "Terms of Service | Muhyo Tech",
  description:
    "Terms governing use of the Muhyo Tech website, project inquiries, software services, content, and professional engagements.",
  alternates: { canonical: "/terms" },
  keywords: [
    "Muhyo Tech terms of service",
    "website development terms",
    "software services terms",
    "Muhyo Tech Lahore",
  ],
  openGraph: {
    title: "Terms of Service | Muhyo Tech",
    description:
      "Clear terms for using the Muhyo Tech website and discussing professional software and web-development services.",
    url: "https://www.muhyotech.com/terms",
    siteName: "Muhyo Tech",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Terms of Service | Muhyo Tech",
    description: "Website-use and professional-engagement terms for Muhyo Tech.",
  },
  robots: { index: true, follow: true },
};

const termsDocument = {
  type: "Terms of Service",
  slug: "terms",
  title: "Terms built for clear collaboration.",
  description:
    "These Terms explain how you may use the Muhyo Tech website and how general inquiries, bookings, content, and software-service discussions are handled. A signed proposal or project agreement may add project-specific terms.",
  effectiveDate: "July 14, 2026",
  updatedDate: "July 14, 2026",
  version: "2.0",
  readTime: "9 minutes",
  highlights: [
    { icon: "scroll", title: "Website use", text: "Clear rules for browsing, inquiries, bookings, and permitted use of our content." },
    { icon: "scale", title: "Project clarity", text: "Proposals, scopes, milestones, payments, and ownership are confirmed separately for each engagement." },
    { icon: "shield", title: "Practical protection", text: "Reasonable limits protect visitors, clients, Muhyo Tech, and the integrity of the platform." },
  ],
  sections: [
    {
      id: "acceptance",
      icon: "check",
      title: "Acceptance of these Terms",
      paragraphs: [
        "By accessing muhyotech.com, submitting a form, booking a call, subscribing to updates, or otherwise using this website, you agree to these Terms of Service and our Privacy Policy.",
        "If you do not agree, please do not use the website. If you use the website for a company or other organisation, you confirm that you are authorised to act for it.",
      ],
    },
    {
      id: "services",
      icon: "sparkle",
      title: "Muhyo Tech services",
      paragraphs: [
        "Muhyo Tech provides professional website development, web applications, UI/UX implementation, backend and API work, performance and technical SEO improvements, deployment support, automation, AI-assisted workflows, and related digital services.",
        "Website descriptions, case studies, timelines, technology references, and service pages are general information—not a binding offer or guaranteed result. The final scope is defined in a written proposal, statement of work, invoice, or contract accepted by both parties.",
      ],
    },
    {
      id: "inquiries",
      icon: "fingerprint",
      title: "Inquiries, bookings, and communication",
      paragraphs: [
        "You agree to provide accurate, current information when sending a message, requesting a quote, booking a call, or subscribing to communications. A booking request is not confirmed until Muhyo Tech accepts it or sends confirmation.",
      ],
      items: [
        "Do not impersonate another person or submit misleading project information.",
        "Do not use forms for spam, unlawful solicitation, malware, or abusive content.",
        "Electronic communication may be used to respond to your request, coordinate a project, and send service-related notices.",
      ],
    },
    {
      id: "project-agreements",
      icon: "scroll",
      title: "Project scope, fees, and changes",
      paragraphs: [
        "Each paid engagement may have its own deliverables, dependencies, timeline, revision limits, payment schedule, cancellation terms, and support period. Those written project terms control if they conflict with these website Terms.",
      ],
      items: [
        "Estimates may change when requirements, integrations, content, access, or technical constraints change.",
        "Work outside an approved scope may require a revised estimate or change request.",
        "Clients are responsible for timely feedback, approvals, content, credentials, licences, and other agreed dependencies.",
        "Payment, refund, suspension, and cancellation rules will be stated in the applicable proposal or invoice.",
      ],
      note: "Submitting a contact or booking form alone does not create a client relationship or require either party to proceed.",
    },
    {
      id: "intellectual-property",
      icon: "gavel",
      title: "Intellectual property",
      paragraphs: [
        "The Muhyo Tech name, website design, original copy, code, graphics, service descriptions, articles, and other website materials are owned by Muhyo Tech or used under permission and are protected by applicable intellectual-property laws.",
      ],
      items: [
        "You may view and share links to public pages for lawful, personal, or internal business evaluation.",
        "You may not copy, resell, scrape, republish, remove attribution from, or create misleading derivatives of protected website material without written permission.",
        "You retain ownership of materials you provide for a project and confirm that you have permission to use them.",
        "Ownership and licence rights for project deliverables are defined in the project agreement and commonly transfer only after full payment, subject to third-party and pre-existing components.",
      ],
    },
    {
      id: "acceptable-use",
      icon: "shield",
      title: "Acceptable use",
      paragraphs: ["You must use the website lawfully and must not interfere with its operation, security, availability, or other users."],
      items: [
        "Do not attempt unauthorised access to accounts, admin areas, servers, APIs, databases, or security controls.",
        "Do not introduce malicious code, run disruptive automated requests, bypass rate limits, or probe for vulnerabilities without written authorisation.",
        "Do not use website content or communication features to violate privacy, intellectual-property, fraud, harassment, or other applicable laws.",
        "We may restrict access, preserve evidence, or report activity when reasonably necessary to protect the website or comply with law.",
      ],
    },
    {
      id: "ai-content",
      icon: "sparkle",
      title: "AI-assisted features and content",
      paragraphs: [
        "Muhyo Tech may use AI-assisted tools in research, drafting, image creation, workflow automation, quality review, or software delivery. Human review and engineering judgement remain important, but AI-assisted output can contain errors or require refinement.",
        "Blog posts, technical resources, examples, and AI-generated material are educational and general in nature. They are not legal, financial, medical, cybersecurity, or other regulated professional advice and should not replace advice tailored to your circumstances.",
      ],
    },
    {
      id: "third-parties",
      icon: "globe",
      title: "Third-party services and links",
      paragraphs: [
        "The website may link to or rely on third-party platforms such as hosting, analytics, cloud media, email, social networks, repositories, or client websites. Third parties operate under their own terms and privacy practices.",
        "Muhyo Tech is not responsible for third-party availability, content, policies, security, or changes. A link or technology reference does not automatically mean endorsement or partnership.",
      ],
    },
    {
      id: "availability",
      icon: "globe",
      title: "Availability and changes",
      paragraphs: [
        "We work to keep the website accurate, secure, and available, but uninterrupted or error-free operation is not guaranteed. Features, content, service descriptions, and availability may be changed, suspended, or removed when reasonably necessary.",
        "We may update these Terms as the website, services, or legal requirements evolve. The updated date and version appear on this page. Continued use after an update means you accept the revised Terms.",
      ],
    },
    {
      id: "disclaimers",
      icon: "scale",
      title: "Disclaimers and liability",
      paragraphs: [
        "The website and public content are provided on an “as available” basis. To the maximum extent permitted by applicable law, Muhyo Tech disclaims warranties that are not expressly stated in a signed project agreement.",
        "To the maximum extent permitted by law, Muhyo Tech will not be liable for indirect, incidental, special, consequential, or lost-profit damages arising from public website use, reliance on general content, third-party services, or events outside reasonable control. Nothing in these Terms excludes liability that cannot legally be excluded.",
      ],
    },
    {
      id: "governing-law",
      icon: "gavel",
      title: "Governing law and disputes",
      paragraphs: [
        "These website Terms are governed by the applicable laws of Pakistan. Before starting formal proceedings, both sides should first attempt in good faith to resolve a dispute through written communication. Project contracts may specify a different or more detailed dispute process.",
      ],
    },
    {
      id: "contact",
      icon: "fingerprint",
      title: "Contact",
      paragraphs: [
        "Questions about these Terms, permissions, or a project agreement can be submitted through the Muhyo Tech contact page. Please include enough detail for us to identify and respond to your request.",
      ],
    },
  ],
};

export default function TermsPage() {
  return <LegalDocumentPage document={termsDocument} />;
}

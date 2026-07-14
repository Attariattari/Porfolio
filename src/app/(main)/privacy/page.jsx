import LegalDocumentPage from "@/components/legal/LegalDocumentPage";

export const metadata = {
  title: "Privacy Policy",
  description:
    "How Muhyo Tech collects, uses, protects, retains, and shares information across its website, forms, bookings, newsletter, and analytics.",
  alternates: { canonical: "/privacy" },
  keywords: [
    "Muhyo Tech privacy policy",
    "website privacy policy",
    "data protection Muhyo Tech",
    "Muhyo Tech Lahore",
  ],
  openGraph: {
    title: "Privacy Policy | Muhyo Tech",
    description:
      "Learn how Muhyo Tech handles website, inquiry, booking, newsletter, analytics, and uploaded-media information.",
    url: "https://www.muhyotech.com/privacy",
    siteName: "Muhyo Tech",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Privacy Policy | Muhyo Tech",
    description: "Clear information about privacy, data use, security, retention, and your choices at Muhyo Tech.",
  },
  robots: { index: true, follow: true },
};

const privacyDocument = {
  type: "Privacy Policy",
  slug: "privacy",
  title: "Privacy explained without the fine-print fog.",
  description:
    "This Policy explains what information Muhyo Tech collects through its website, why it is used, which service providers may process it, and the choices available to you.",
  effectiveDate: "July 14, 2026",
  updatedDate: "July 14, 2026",
  version: "2.0",
  readTime: "10 minutes",
  highlights: [
    { icon: "fingerprint", title: "Purpose-led collection", text: "We collect information needed to respond, arrange calls, deliver services, secure the site, and understand performance." },
    { icon: "lock", title: "Protected operations", text: "Access controls, validation, rate limits, authentication, and reputable infrastructure help protect stored information." },
    { icon: "shield", title: "Meaningful choices", text: "You can unsubscribe and may request access, correction, or deletion where applicable." },
  ],
  sections: [
    {
      id: "who-we-are",
      icon: "fingerprint",
      title: "Who we are",
      paragraphs: [
        "Muhyo Tech is a software and web-engineering business based in Lahore, Pakistan. For information submitted through muhyotech.com, Muhyo Tech determines how and why that information is used unless a project agreement states otherwise.",
        "Privacy questions or requests can be sent through our contact page. We may ask for reasonable verification before acting on a request to protect your information from unauthorised access.",
      ],
    },
    {
      id: "information-collected",
      icon: "scroll",
      title: "Information we collect",
      paragraphs: ["The information collected depends on how you use the website and which information you choose to provide."],
      items: [
        "Contact information such as your name, email address, phone number, company, and preferred contact method.",
        "Inquiry and project information such as service interest, objectives, budget or timeline context, messages, attachments, and communication history.",
        "Booking information such as requested service, preferred date and time, project type, source page, and booking status.",
        "Newsletter information such as email address, subscription status, subscription date, and email-delivery history.",
        "Authorised admin information such as account details, role, authentication records, security events, and activity logs.",
        "Technical and usage information such as IP address, browser and device information, user agent, pages viewed, referrer, session identifier, session duration, clicks, interaction count, and scroll depth.",
        "Media or other files you intentionally upload through an authorised feature or secure upload link.",
      ],
    },
    {
      id: "collection-methods",
      icon: "globe",
      title: "How information is collected",
      paragraphs: [
        "Information is collected directly when you complete a form, book a call, subscribe, communicate with us, provide project material, or use an authorised account. Some technical information is collected automatically when the website loads or as you interact with it.",
        "We may also receive limited information from service providers, referral sources, social platforms, or business partners when you choose to interact through those services.",
      ],
    },
    {
      id: "how-we-use-data",
      icon: "check",
      title: "How we use information",
      items: [
        "Respond to questions, qualify project requests, prepare proposals, and communicate about services.",
        "Schedule, confirm, manage, and follow up on calls or project discussions.",
        "Deliver agreed software services, manage client relationships, and maintain business records.",
        "Send newsletters or updates you requested and process unsubscribe choices.",
        "Operate, personalise, troubleshoot, secure, monitor, and improve the website and admin systems.",
        "Measure page performance, traffic, engagement, content usefulness, and conversion journeys.",
        "Prevent spam, abuse, fraud, unauthorised access, and other security threats.",
        "Meet legal obligations, enforce agreements, resolve disputes, and protect legitimate rights.",
      ],
    },
    {
      id: "legal-bases",
      icon: "scale",
      title: "Reasons we process information",
      paragraphs: [
        "Where privacy law requires a legal basis, processing may rely on your consent, steps requested before entering a contract, performance of a contract, compliance with legal obligations, or legitimate interests such as responding to business inquiries, maintaining security, and improving services.",
        "You can withdraw consent for future processing where consent is the basis, including by unsubscribing from marketing email. Withdrawal does not make earlier lawful processing unlawful.",
      ],
    },
    {
      id: "cookies-analytics",
      icon: "fingerprint",
      title: "Cookies, local storage, and analytics",
      paragraphs: [
        "The website uses browser storage and similar technologies for functionality, security, session continuity, preferences, and visitor measurement. A visitor session identifier and session start time may be stored locally to understand aggregate site use.",
      ],
      items: [
        "Google Analytics may load when a measurement ID is configured and may process device, page, and interaction information under Google's own policies.",
        "Vercel Analytics and Speed Insights may collect performance and usage measurements to help us improve reliability and speed.",
        "Authentication cookies and browser storage support authorised admin sessions and security controls.",
        "You can limit cookies or clear browser storage through browser settings, but some protected or preference-based features may stop working correctly.",
      ],
      note: "The website does not currently respond to a universal browser “Do Not Track” signal because there is no consistently adopted standard. Available browser and provider controls can still be used.",
    },
    {
      id: "sharing",
      icon: "globe",
      title: "Service providers and sharing",
      paragraphs: [
        "We do not sell personal information. We may disclose limited information to providers that help operate the website and business, only for relevant services and subject to their own contractual and legal responsibilities.",
      ],
      items: [
        "Vercel or comparable infrastructure providers for hosting, delivery, analytics, and performance monitoring.",
        "MongoDB or comparable database providers for application and business records.",
        "Cloudinary for uploaded and website media storage and delivery.",
        "Email delivery providers and Nodemailer-compatible infrastructure for inquiries, confirmations, security messages, and newsletters.",
        "Google Analytics when configured for website measurement.",
        "Professional advisers, authorities, or counterparties when reasonably required by law, security, a dispute, or a business transaction.",
      ],
    },
    {
      id: "international-transfers",
      icon: "globe",
      title: "International processing",
      paragraphs: [
        "Some providers operate infrastructure in multiple countries, so information may be processed outside your country. Where required, we use available contractual, organisational, or provider safeguards and consider the nature of the information and service involved.",
      ],
    },
    {
      id: "retention",
      icon: "scroll",
      title: "Data retention",
      paragraphs: [
        "We retain information only for as long as reasonably needed for the purpose collected, an active business relationship, security, dispute handling, backups, or legal and accounting obligations. Retention depends on the information and context.",
      ],
      items: [
        "Unsuccessful or inactive inquiries may be removed when no longer useful for follow-up, security, or recordkeeping.",
        "Project and transaction records may be retained longer to support contracts, accounting, warranties, and disputes.",
        "Newsletter records remain active until you unsubscribe or the address is disabled, subject to limited suppression records needed to honour the choice.",
        "Security, analytics, and technical records may be retained for shorter operational periods or in aggregated form.",
      ],
    },
    {
      id: "security",
      icon: "lock",
      title: "Security",
      paragraphs: [
        "Muhyo Tech uses reasonable technical and organisational safeguards appropriate to the website, including access controls, authentication, permissions, input validation, rate limiting, secure upload links, logging, and managed infrastructure.",
        "No internet transmission, storage platform, or security method is completely risk-free. Please avoid sending unnecessary sensitive information through public forms and contact us promptly if you suspect misuse.",
      ],
    },
    {
      id: "your-rights",
      icon: "shield",
      title: "Your choices and rights",
      paragraphs: ["Depending on your location and applicable law, you may have some or all of the following rights:"],
      items: [
        "Ask whether we hold personal information about you and request access to it.",
        "Request correction of inaccurate or incomplete information.",
        "Request deletion or restriction where there is no overriding reason to retain or process the information.",
        "Object to certain processing or withdraw consent for future processing.",
        "Request a portable copy of information you provided where applicable.",
        "Unsubscribe from marketing email using the link in the message or by contacting us.",
        "Complain to an appropriate privacy or data-protection authority where that right is available.",
      ],
      note: "Rights are not absolute. We may need to verify identity, retain limited records, protect another person's rights, or decline a request where permitted by law.",
    },
    {
      id: "children",
      icon: "shield",
      title: "Children's privacy",
      paragraphs: [
        "Muhyo Tech provides business and professional technology services and the website is not directed to children under 16. We do not knowingly request personal information from children. If you believe a child submitted information, contact us so we can review and delete it where appropriate.",
      ],
    },
    {
      id: "ai-processing",
      icon: "sparkle",
      title: "AI-assisted processing",
      paragraphs: [
        "AI-assisted tools may support content drafting, image generation, workflow automation, technical analysis, or service delivery. We aim to avoid placing unnecessary personal information into such tools and apply human judgement where output affects client work.",
        "The public website does not use solely automated decision-making that produces legal or similarly significant effects for visitors.",
      ],
    },
    {
      id: "external-sites",
      icon: "globe",
      title: "External websites",
      paragraphs: [
        "Links to social networks, repositories, messaging services, client websites, and other external platforms are governed by those providers' privacy practices. Review their notices before providing information to them.",
      ],
    },
    {
      id: "policy-updates",
      icon: "scroll",
      title: "Updates to this Policy",
      paragraphs: [
        "We may update this Policy when website features, providers, business practices, or legal requirements change. Material revisions will be reflected by a new updated date and version on this page. Please review it periodically.",
      ],
    },
    {
      id: "privacy-contact",
      icon: "fingerprint",
      title: "Privacy contact",
      paragraphs: [
        "Submit privacy questions or requests through the Muhyo Tech contact page and clearly mark the message as a privacy request. Include the email address or other detail associated with your interaction so we can locate relevant records after appropriate verification.",
      ],
    },
  ],
};

export default function PrivacyPage() {
  return <LegalDocumentPage document={privacyDocument} />;
}

import React from "react";
import GoalsClient from "./GoalsClient";
import { GoalController } from "@/controllers/GoalController";
import { serializeDoc } from "@/lib/mongooseHelper";

import { buildCanonical, getSeoImage } from "@/lib/seo";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";

export const revalidate = 300; // ISR: Revalidate every 5 minutes

export const metadata = {
  title: "Goals & Roadmap",
  description:
    "Explore Muhyo Tech goals, roadmap, real active projects, SiteCraft AI development, QR Profile Connect, LeadFlow AI, and future digital product direction.",
  alternates: { canonical: buildCanonical("/goals") },
  openGraph: {
    title: "Goals & Roadmap | Muhyo Tech - Beyond Objectives",
    description:
      "Explore Muhyo Tech's strategic roadmap, active SaaS projects, and future digital product direction. Building the trusted technology partner for ambitious brands.",
    url: buildCanonical("/goals"),
    images: [{ url: getSeoImage("/goals-preview.png"), width: 1200, height: 630, alt: "Muhyo Tech Goals & Roadmap - Beyond Objectives" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Goals & Roadmap | Muhyo Tech",
    description: "Explore Muhyo Tech's strategic roadmap, active SaaS projects, and future digital product direction.",
    images: [getSeoImage("/goals-preview.png")],
  },
};

export default async function GoalsPage() {
  // Fetch all goals data with fallback
  const [
    goals,
    roadmap,
    milestones,
    vision,
    stats,
    health,
    insights,
    changelog,
    recentProgress,
  ] = await Promise.all([
    GoalController.getAllGoals(true).catch(() => []),
    GoalController.getAllRoadmap(true).catch(() => []),
    GoalController.getAllMilestones(true).catch(() => []),
    GoalController.getVision().catch(() => ({})),
    GoalController.getGoalsStats().catch(() => ({})),
    GoalController.getCompanyHealth().catch(() => ({})),
    GoalController.generateStrategicInsights().catch(() => ({})),
    GoalController.getPublicChangelog(20).catch(() => []),
    GoalController.getRecentProgress(true).catch(() => []),
  ]);

  const pageData = {
    ...GoalController.getGoalsPageData(),
    recentProgress,
  };
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Muhyo Tech Goals and Product Roadmap",
    description: metadata.description,
    url: buildCanonical("/goals"),
    isPartOf: { "@id": `${buildCanonical("/")}#website` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: goals.length,
      itemListElement: goals.slice(0, 30).map((goal, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: goal.title || goal.name || `Goal ${index + 1}`,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: buildCanonical("/") },
          { name: "Goals & Roadmap", url: buildCanonical("/goals") },
        ]}
      />
      <GoalsClient
        initialGoals={goals || []}
        initialRoadmap={roadmap || []}
        initialMilestones={milestones || []}
        initialVision={vision || {}}
        initialStats={stats || {}}
        initialHealth={health || {}}
        initialInsights={insights || {}}
        initialChangelog={changelog || []}
        initialPageData={pageData}
      />
    </>
  );
}

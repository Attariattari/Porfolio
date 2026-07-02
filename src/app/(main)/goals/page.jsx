import React from "react";
import GoalsClient from "./GoalsClient";
import { GoalController } from "@/controllers/GoalController";
import { serializeDoc } from "@/lib/mongooseHelper";

export const revalidate = 300; // ISR: Revalidate every 5 minutes

export const metadata = {
  title: "Goals & Vision | Muhyo Tech",
  description:
    "Explore our strategic goals, roadmap, and vision for the future. See how we're building the next generation of digital solutions.",
};

const schemaData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Muhyo Tech",
  description: "Goals and Vision for Digital Excellence",
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
  ] = await Promise.all([
    GoalController.getAllGoals(true).catch(() => []),
    GoalController.getAllRoadmap(true).catch(() => []),
    GoalController.getAllMilestones(true).catch(() => []),
    GoalController.getVision().catch(() => ({})),
    GoalController.getGoalsStats().catch(() => ({})),
    GoalController.getCompanyHealth().catch(() => ({})),
    GoalController.generateStrategicInsights().catch(() => ({})),
    GoalController.getPublicChangelog(20).catch(() => []),
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
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
      />
    </>
  );
}

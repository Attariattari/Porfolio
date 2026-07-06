import { NextResponse } from "next/server";
import { GoalController } from "@/controllers/GoalController";

// GET all goals, roadmap, milestones - Returns public data
export async function GET() {
    try {
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
            GoalController.getAllGoals(true), // Only published
            GoalController.getAllRoadmap(true), // Only published
            GoalController.getAllMilestones(true), // Only published
            GoalController.getVision(),
            GoalController.getGoalsStats(),
            GoalController.getCompanyHealth(),
            GoalController.generateStrategicInsights(),
            GoalController.getPublicChangelog(20),
            GoalController.getRecentProgress(true),
        ]);

        const pageData = {
            ...GoalController.getGoalsPageData(),
            recentProgress,
        };

        return NextResponse.json({
            success: true,
            data: {
                goals,
                roadmap,
                milestones,
                vision,
                stats,
                health,
                insights,
                changelog,
                pageData,
            },
        });
    } catch (error) {
        console.error("[API] GET /api/goals error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 }, );
    }
}

import cron from "node-cron";
import { runBlogAutomationPipeline } from "../blogAutomation";

/**
 * SERVER SCHEDULER (BACKGROUND WORKER)
 * This is used for long-running servers (e.g. VPS, Docker)
 * where the Node process stays alive.
 */

export function initBlogScheduler() {
    console.log("⏰ Initializing Blog Automation Scheduler (24h)...");

    // Run every 24 hours at midnight
    cron.schedule("0 0 * * *", async() => {
        console.log("🕒 Scheduled Trigger: Starting Blog Pipeline...");
        try {
            const result = await runBlogAutomationPipeline();
            console.log("✅ Scheduled Pipeline Result:", result);
        } catch (error) {
            console.error("❌ Scheduled Pipeline Failed:", error);
        }
    });

    // Optional: Run immediately once on start for testing (remove in production)
    // if (process.env.NODE_ENV === "development") {
    //     console.log("🧪 Dev Mode: Running pipeline once on start...");
    //     runBlogAutomationPipeline();
    // }
}
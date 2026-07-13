import { NextResponse } from "next/server";
import { updateFeaturedRankings } from "@/lib/ai/featuredEngine";
import { runDailyBlogPipeline } from "@/lib/cron/runDailyBlogPipeline";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request) {
  if (process.env.CRON_SECRET) {
    const authorization = request.headers.get("authorization");
    if (authorization !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }
  }

  // This second daily cron doubles as a safe catch-up. Vercel does not retry
  // failed cron invocations, while the shared workflow is idempotent per UTC
  // day and therefore cannot create a duplicate scheduled blog.
  const dailyBlog = await runDailyBlogPipeline({
    baseUrl: new URL(request.url).origin,
    source: "featured-backup",
    backlogLimit: 0,
  });
  const rankings = await updateFeaturedRankings();
  const success = dailyBlog.success && rankings.success;

  return NextResponse.json(
    { success, dailyBlog, rankings },
    { status: success ? 200 : 500 },
  );
}

import { NextResponse } from "next/server";
import { updateFeaturedRankings } from "@/lib/ai/featuredEngine";

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

  const result = await updateFeaturedRankings();
  return NextResponse.json(result, { status: result.success ? 200 : 500 });
}

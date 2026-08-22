import { NextResponse } from "next/server";
import { getSearchIntelligenceStatus, syncSearchIntelligence } from "@/lib/ai/seo/searchIntelligenceService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const status = await getSearchIntelligenceStatus();
    return NextResponse.json({ success: true, status }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to retrieve SEO intelligence status" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const syncResult = await syncSearchIntelligence({
      startDate: body.startDate || null,
      endDate: body.endDate || null,
    });
    return NextResponse.json({ success: true, syncResult }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to execute Search Intelligence sync" },
      { status: 500 }
    );
  }
}

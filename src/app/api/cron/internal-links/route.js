import { NextResponse } from "next/server";
import { auditInternalLinks } from "@/lib/ai/blog/internalLinkingEngine";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request) {
  if (process.env.CRON_SECRET && request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  const result = await auditInternalLinks({ autoApply: true, limit: 100 });
  return NextResponse.json(result);
}

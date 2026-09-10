import { NextResponse } from "next/server";
import { verifyCronCaller } from "@/lib/cron/cronAuth";
import { auditInternalLinks } from "@/lib/ai/blog/internalLinkingEngine";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request) {
  const auth = await verifyCronCaller(request, { permissionModule: "blogs" });
  if (!auth.authorized) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  const result = await auditInternalLinks({ autoApply: true, limit: 100 });
  return NextResponse.json(result);
}

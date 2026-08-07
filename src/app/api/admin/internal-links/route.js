import { NextResponse } from "next/server";
import { getAuthSession, checkPermission } from "@/lib/auth";
import {
  applyInternalLinkSuggestion,
  auditInternalLinks,
  getInternalLinkingDashboard,
  rollbackInternalLinkSuggestion,
  cleanupWeakPendingSuggestions,
  prepareInternalLinkWithAI,
} from "@/lib/ai/blog/internalLinkingEngine";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

async function authorize() {
  const session = await getAuthSession();
  return checkPermission(session, "blogs", "edit") ? session : null;
}

export async function GET() {
  if (!(await authorize())) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  return NextResponse.json({ success: true, data: await getInternalLinkingDashboard() });
}

export async function POST(request) {
  const session = await authorize();
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  try {
    const body = await request.json();
    let result;
    if (body.action === "audit") result = await auditInternalLinks({ autoApply: false, limit: Number(body.limit) || 100 });
    else if (body.action === "apply") result = await applyInternalLinkSuggestion(body.id, session.email, body.anchorText);
    else if (body.action === "cleanup") result = await cleanupWeakPendingSuggestions(session.email);
    else if (body.action === "prepare_ai") result = await prepareInternalLinkWithAI(body.id, session.email);
    else if (body.action === "rollback") result = await rollbackInternalLinkSuggestion(body.id, session.email);
    else return NextResponse.json({ success: false, error: "Unsupported action." }, { status: 400 });
    return NextResponse.json(result, { status: result.success ? 200 : 409 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  const session = await authorize();
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  const { id, action } = await request.json();
  if (!id || action !== "reject") return NextResponse.json({ success: false, error: "Invalid request." }, { status: 400 });
  const { InternalLinkSuggestion } = await import("@/models/InternalLinkSuggestion");
  const suggestion = await InternalLinkSuggestion.findOneAndUpdate({ _id: id, status: { $in: ["pending", "rolled_back"] } }, { $set: { status: "rejected", appliedBy: session.email } }, { new: true });
  return NextResponse.json({ success: Boolean(suggestion), data: suggestion }, { status: suggestion ? 200 : 409 });
}

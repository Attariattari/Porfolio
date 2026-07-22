import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { getAuthSession, checkPermission } from "@/lib/auth";
import { BlogTopicPlan } from "@/models/BlogTopicPlan";
import { activateFallbackTopics, createTopicPlan, reconcileFallbackTopics, refillTopicQueue } from "@/lib/ai/blog/topicQueue";

export const dynamic = "force-dynamic";

async function authorize(action = "edit") {
  const session = await getAuthSession();
  return checkPermission(session, "blogs", action) ? session : null;
}

export async function GET(request) {
  if (!(await authorize("edit"))) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  await dbConnect();
  await reconcileFallbackTopics();
  const status = request.nextUrl.searchParams.get("status");
  const fallbackActive = await BlogTopicPlan.exists({ source: "fallback", status: "ready" });
  const primaryReady = await BlogTopicPlan.exists({ source: { $ne: "fallback" }, status: "ready" });
  const showFallback = Boolean(fallbackActive && !primaryReady);
  const visibility = showFallback ? {} : { source: { $ne: "fallback" } };
  const query = { ...visibility, status: status && status !== "all" ? status : { $ne: "reserve" } };
  const [topics, statusCounts] = await Promise.all([
    BlogTopicPlan.find(query).sort({ status: 1, scheduledFor: 1, priority: -1, createdAt: 1 }).limit(300).lean(),
    BlogTopicPlan.aggregate([{ $match: { ...visibility, status: { $ne: "reserve" } } }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
  ]);
  const counts = Object.fromEntries(statusCounts.map((item) => [item._id, item.count]));
  return NextResponse.json({ success: true, data: { topics, counts, total: Object.values(counts).reduce((sum, count) => sum + count, 0) } });
}

export async function POST(request) {
  if (!(await authorize("create"))) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  try {
    const body = await request.json();
    if (body.action === "refill") {
      const result = await refillTopicQueue({ force: true, target: Number(body.target) || 45, threshold: 0 });
      const activation = result.ready === 0 ? await activateFallbackTopics() : { activated: 0 };
      return NextResponse.json({ success: true, data: { ...result, ...activation } });
    }
    const topic = await createTopicPlan(body, "manual");
    return NextResponse.json({ success: true, data: topic }, { status: 201 });
  } catch (error) {
    const duplicate = error?.code === 11000;
    return NextResponse.json({ success: false, error: duplicate ? "This editorial topic already exists." : error.message }, { status: duplicate ? 409 : 400 });
  }
}

export async function PATCH(request) {
  if (!(await authorize("edit"))) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  try {
    await dbConnect();
    const { id, action, ...changes } = await request.json();
    if (!id) return NextResponse.json({ success: false, error: "Topic id is required." }, { status: 400 });
    const allowed = ["title", "pillar", "subtopic", "problem", "solutionAngle", "businessValue", "audience", "focusKeyword", "searchIntent", "format", "relatedServiceSlugs", "priority", "scheduledFor", "notes"];
    const update = Object.fromEntries(Object.entries(changes).filter(([key]) => allowed.includes(key)));
    if (action === "approve") update.status = "ready";
    if (action === "reject") update.status = "rejected";
    if (action === "retry") { update.status = "ready"; update.failureReason = null; }
    const topic = await BlogTopicPlan.findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true });
    if (!topic) return NextResponse.json({ success: false, error: "Topic not found." }, { status: 404 });
    return NextResponse.json({ success: true, data: topic });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request) {
  if (!(await authorize("delete"))) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  await dbConnect();
  const { id } = await request.json();
  const topic = await BlogTopicPlan.findOneAndDelete({ _id: id, status: { $ne: "processing" } });
  if (!topic) return NextResponse.json({ success: false, error: "Processing topics cannot be deleted." }, { status: 409 });
  return NextResponse.json({ success: true });
}

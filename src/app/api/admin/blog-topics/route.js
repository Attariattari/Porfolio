import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { getAuthSession, checkPermission } from "@/lib/auth";
import { BlogTopicPlan } from "@/models/BlogTopicPlan";
import { appendAuthorityTopics, createTopicPlan, rebuildClusterTopicCatalog, reconcileFallbackTopics, reconcileUsedTopicPlans, refillTopicQueue } from "@/lib/ai/blog/topicQueue";
import { discoverVerifiedTrends } from "@/lib/ai/blog/trendIntelligence";
import { maintainProfessionalTopicReserve } from "@/lib/ai/blog/maintainTopicReserve";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 300;

async function authorize(action = "edit") {
  const session = await getAuthSession();
  return checkPermission(session, "blogs", action) ? session : null;
}

export async function GET(request) {
  if (!(await authorize("edit"))) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  await dbConnect();
  await reconcileFallbackTopics();
  await reconcileUsedTopicPlans();
  const status = request.nextUrl.searchParams.get("status");
  const query = status && status !== "all" ? { status } : {};
  const [topics, statusCounts] = await Promise.all([
    BlogTopicPlan.find(query)
      .sort({ status: 1, scheduledFor: 1, priority: -1, createdAt: 1 })
      .limit(300)
      .populate({
        path: "usedByBlogId",
        select: "title slug articleType publishStatus createdAt generatedAt",
      })
      .lean(),
    BlogTopicPlan.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
  ]);
  const clusters = new Map();
  topics.forEach((topic) => {
    const clusterKey = topic.clusterKey || `standalone-${topic._id}`;
    if (!clusters.has(clusterKey)) clusters.set(clusterKey, []);
    clusters.get(clusterKey).push(topic);
  });

  const completedClusterKeys = new Set(
    [...clusters.entries()]
      .filter(([, clusterTopics]) => {
        const pillar = clusterTopics.find((topic) => topic.articleType === "pillar" && Number(topic.clusterOrder) === 0);
        const childOne = clusterTopics.find((topic) => topic.articleType === "supporting" && Number(topic.clusterOrder) === 1);
        const childTwo = clusterTopics.find((topic) => topic.articleType === "supporting" && Number(topic.clusterOrder) === 2);
        return [pillar, childOne, childTwo].every((topic) => topic?.status === "used" && topic?.usedByBlogId?._id);
      })
      .map(([clusterKey]) => clusterKey),
  );

  const displayTopics = topics.map((topic) => {
    const clusterKey = topic.clusterKey || `standalone-${topic._id}`;
    const queueStatus = topic.status;
    let displayStatus = queueStatus;
    if (completedClusterKeys.has(clusterKey)) displayStatus = "used";
    else if (queueStatus === "processing") displayStatus = "selected";
    else if (queueStatus === "used" && topic.usedByBlogId?._id) displayStatus = "created";
    else if (queueStatus === "used") displayStatus = "failed";
    return { ...topic, queueStatus, status: displayStatus };
  });

  const counts = displayTopics.reduce((result, topic) => {
    result[topic.status] = (result[topic.status] || 0) + 1;
    return result;
  }, {});
  counts.usedClusters = completedClusterKeys.size;
  const total = statusCounts.reduce((sum, item) => sum + item.count, 0);
  return NextResponse.json({ success: true, data: { topics: displayTopics, counts, total } });
}

export async function POST(request) {
  if (!(await authorize("create"))) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  try {
    const body = await request.json();
    if (body.action === "rebuild-clusters") {
      const result = await rebuildClusterTopicCatalog({ targetClusters: 10 });
      return NextResponse.json({ success: true, data: result });
    }
    if (body.action === "rebuild-professional-catalog") {
      const core = await rebuildClusterTopicCatalog({ targetClusters: 5 });
      const authority = await appendAuthorityTopics({ target: Number(body.authorityTarget) || 10 });
      let trends;
      try {
        trends = await discoverVerifiedTrends({ maxTopics: Number(body.trendTarget) || 2 });
      } catch (error) {
        trends = { success: false, verified: 0, message: error.message };
      }
      return NextResponse.json({
        success: true,
        data: {
          core,
          authority,
          trends,
          totalGenerated: Number(core.ai?.topics || 0) + Number(authority.generated || 0) + Number(trends.verified || 0),
        },
      });
    }
    if (body.action === "refill") {
      const result = await refillTopicQueue({ force: true, target: Number(body.target) || 45, threshold: 0 });
      return NextResponse.json({ success: true, data: result });
    }
    if (body.action === "refill-authority") {
      return NextResponse.json({ success: true, data: await appendAuthorityTopics({ target: Number(body.target) || 21 }) });
    }
    if (body.action === "discover-trends") {
      return NextResponse.json({ success: true, data: await discoverVerifiedTrends({ maxTopics: Number(body.target) || 2 }) });
    }
    if (body.action === "maintain-professional-reserve") {
      const result = await maintainProfessionalTopicReserve();
      return NextResponse.json({ success: result.success, data: result }, { status: result.success ? 200 : 500 });
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
    const allowed = ["title", "articleType", "contentCategory", "topicFamily", "clusterKey", "clusterTitle", "parentTopicId", "clusterOrder", "pillar", "subtopic", "problem", "solutionAngle", "businessValue", "audience", "focusKeyword", "searchIntent", "format", "relatedServiceSlugs", "priority", "scheduledFor", "notes", "trendPriority"];
    const update = Object.fromEntries(Object.entries(changes).filter(([key]) => allowed.includes(key)));
    if (action === "approve") {
      const existing = await BlogTopicPlan.findById(id).select("articleType").lean();
      update.status = existing?.articleType === "pillar" ? "planned" : "ready";
    }
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

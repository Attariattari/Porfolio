import { NextResponse } from "next/server";
import { getAuthSession, checkPermission } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import { ServiceOpportunity } from "@/models/ServiceOpportunity";
import {
  evaluateCandidateServiceGap,
  clusterAndEvaluateServiceOpportunities,
  detectAndLogServiceOpportunity,
} from "@/lib/ai/intelligence/serviceGapEngine";

export async function GET(request) {
  try {
    const session = await getAuthSession();
    if (!checkPermission(session, "services", "view")) {
      return NextResponse.json(
        { success: false, error: "Access Denied: You do not have permission to view service opportunities." },
        { status: 403 }
      );
    }

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const query = {};
    if (status && status !== "all") {
      query.status = status;
    }

    const opportunities = await ServiceOpportunity.find(query)
      .sort({ opportunityScore: -1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      count: opportunities.length,
      data: opportunities,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch service opportunities." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getAuthSession();
    if (!checkPermission(session, "services", "edit")) {
      return NextResponse.json(
        { success: false, error: "Access Denied: You do not have permission to evaluate service opportunities." },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { topic, topics, persist = false } = body;

    if (Array.isArray(topics) && topics.length > 0) {
      const clustered = clusterAndEvaluateServiceOpportunities(topics);
      if (persist) {
        await dbConnect();
        for (const candidate of topics) {
          await detectAndLogServiceOpportunity(candidate);
        }
      }
      return NextResponse.json({
        success: true,
        mode: "batch_cluster",
        count: clustered.length,
        data: clustered,
      });
    }

    if (topic) {
      const analysis = evaluateCandidateServiceGap(topic);
      let persisted = null;
      if (persist) {
        await dbConnect();
        persisted = await detectAndLogServiceOpportunity(topic);
      }
      return NextResponse.json({
        success: true,
        mode: "single_topic",
        data: analysis,
        persisted,
      });
    }

    return NextResponse.json(
      { success: false, error: "Missing required payload: 'topic' object or 'topics' array." },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process service opportunity evaluation." },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const session = await getAuthSession();
    if (!checkPermission(session, "services", "edit")) {
      return NextResponse.json(
        { success: false, error: "Access Denied: You do not have permission to update service opportunities." },
        { status: 403 }
      );
    }

    await dbConnect();
    const { id, status, recommendedAction } = await request.json().catch(() => ({}));

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing required parameter: 'id'." },
        { status: 400 }
      );
    }

    const updateFields = {};
    if (status) updateFields.status = status;
    if (recommendedAction) updateFields.recommendedAction = recommendedAction;

    const updated = await ServiceOpportunity.findByIdAndUpdate(id, updateFields, { new: true });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "ServiceOpportunity record not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update service opportunity." },
      { status: 500 }
    );
  }
}

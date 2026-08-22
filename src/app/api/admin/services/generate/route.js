import { NextResponse } from "next/server";
import { getAuthSession, checkPermission } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import { ServiceOpportunity } from "@/models/ServiceOpportunity";
import { generateServiceDraft } from "@/lib/ai/intelligence/services/serviceGeneratorEngine";

export async function POST(request) {
  try {
    const session = await getAuthSession();
    if (!checkPermission(session, "services", "edit")) {
      return NextResponse.json(
        { success: false, error: "Access Denied: You do not have permission to generate services." },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { opportunityId, opportunityPayload } = body;

    let targetOpportunity = opportunityPayload || {};

    if (opportunityId) {
      await dbConnect();
      const dbOpp = await ServiceOpportunity.findById(opportunityId).lean();
      if (!dbOpp) {
        return NextResponse.json(
          { success: false, error: `ServiceOpportunity with ID '${opportunityId}' not found.` },
          { status: 404 }
        );
      }
      targetOpportunity = { ...dbOpp, opportunityId: dbOpp._id.toString() };
    }

    if (!targetOpportunity.suggestedService && !targetOpportunity.proposedServiceName && !targetOpportunity.topicTitle) {
      return NextResponse.json(
        { success: false, error: "Missing required opportunity input: 'opportunityId' or opportunity payload." },
        { status: 400 }
      );
    }

    const result = await generateServiceDraft(targetOpportunity);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate AI service draft." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getAuthSession, checkPermission } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import { ServiceOpportunity } from "@/models/ServiceOpportunity";
import { generateServiceDraft } from "@/lib/ai/intelligence/services/serviceGeneratorEngine";
import { ensureServiceImage } from "@/lib/ai/intelligence/services/ensureServiceImage";

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

    const autoGenerateImage = body.autoGenerateImage === true || body.generateImage === true;
    const sendEmailPrompt = body.sendEmailPrompt === true;

    if (result.success && result.draft?.service && (autoGenerateImage || sendEmailPrompt)) {
      const baseUrl = new URL(request.url).origin;
      try {
        const imgResult = await ensureServiceImage(result.draft.service, {
          autoGenerate: autoGenerateImage,
          baseUrl,
        });
        if (imgResult.imageUrl) {
          result.draft.service.heroImage = imgResult.imageUrl;
          result.draft.service.banner = imgResult.imageUrl;
          result.draft.service.image = imgResult.imageUrl;
          result.draft.service.imageGenerated = true;
          result.draft.service.imageStatus = "generated";
          if (result.data) {
            result.data.heroImage = imgResult.imageUrl;
            result.data.banner = imgResult.imageUrl;
            result.data.image = imgResult.imageUrl;
            result.data.imageGenerated = true;
            result.data.imageStatus = "generated";
          }
        }
        result.imageResult = imgResult;
      } catch (imgErr) {
        console.warn("[services/generate/route] Safe image attachment catch:", imgErr.message);
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate AI service draft." },
      { status: 500 }
    );
  }
}

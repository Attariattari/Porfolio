import { NextResponse } from "next/server";
import { getAuthSession, checkPermission } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import { ServiceValidation } from "@/models/ServiceValidation";
import { validateService } from "@/lib/ai/intelligence/services/serviceValidationEngine";

export async function POST(request) {
  try {
    const session = await getAuthSession();
    if (!checkPermission(session, "services", "edit")) {
      return NextResponse.json(
        { success: false, error: "Access Denied: You do not have permission to validate services." },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { service, servicePayload, opportunityId, persist = true } = body;
    const targetService = service || servicePayload;

    if (!targetService || !targetService.title) {
      return NextResponse.json(
        { success: false, error: "Missing required payload: 'service' object with at least a title." },
        { status: 400 }
      );
    }

    const validationReport = validateService(targetService);

    if (persist) {
      try {
        await dbConnect();
        await ServiceValidation.create({
          serviceSlug: validationReport.serviceSlug,
          opportunityId: opportunityId || targetService.opportunityId || "",
          score: validationReport.score,
          decision: validationReport.decision,
          dimensions: validationReport.dimensions,
          risks: validationReport.risks,
          recommendations: validationReport.recommendations,
          duplicateCandidates: validationReport.duplicateCandidates,
          overlappingServices: validationReport.overlappingServices,
          topicEvidence: validationReport.topicEvidence,
          seoIssues: validationReport.seoIssues,
          contentIssues: validationReport.contentIssues,
        });
      } catch (dbErr) {
        console.warn("[serviceValidationRoute] Failed to persist validation report in DB:", dbErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      report: validationReport,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to validate service payload." },
      { status: 500 }
    );
  }
}

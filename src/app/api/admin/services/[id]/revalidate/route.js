import { NextResponse } from "next/server";
import { getAuthSession, checkPermission } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import Service from "@/models/Service";
import { ServiceValidation } from "@/models/ServiceValidation";
import { validateService } from "@/lib/ai/intelligence/services/serviceValidationEngine";

export async function POST(request, { params }) {
  try {
    const session = await getAuthSession();
    if (!checkPermission(session, "services", "edit")) {
      return NextResponse.json(
        { success: false, error: "Access Denied: You do not have permission to revalidate services." },
        { status: 403 }
      );
    }

    const { id } = params;
    await dbConnect();

    // Fetch existing service from MongoDB
    let serviceDoc = await Service.findById(id).lean();
    if (!serviceDoc) {
      serviceDoc = await Service.findOne({ slug: id }).lean();
    }

    if (!serviceDoc) {
      return NextResponse.json(
        { success: false, error: `Service with ID or slug '${id}' not found.` },
        { status: 404 }
      );
    }

    const validationReport = validateService(serviceDoc, { isNewService: false });

    // Persist Revalidation Report
    const persisted = await ServiceValidation.create({
      serviceSlug: validationReport.serviceSlug,
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
    }).catch(() => null);

    return NextResponse.json({
      success: true,
      serviceTitle: serviceDoc.title,
      serviceSlug: serviceDoc.slug,
      report: validationReport,
      validationId: persisted?._id,
      revalidatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to revalidate service." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getAuthSession, checkPermission } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import Service from "@/models/Service";
import { ServiceOpportunity } from "@/models/ServiceOpportunity";
import { validateServiceDraft } from "@/lib/ai/intelligence/services/serviceGeneratorEngine";
import { invalidateServiceSnapshotCache } from "@/lib/ai/intelligence/services/serviceIntelligenceSnapshot";

export async function POST(request, { params }) {
  try {
    const session = await getAuthSession();
    if (!checkPermission(session, "services", "edit")) {
      return NextResponse.json(
        { success: false, error: "Access Denied: You do not have permission to approve and publish services." },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json().catch(() => ({}));
    const { draft } = body;

    if (!draft || !draft.service) {
      return NextResponse.json(
        { success: false, error: "Missing required payload: 'draft' containing service data." },
        { status: 400 }
      );
    }

    await dbConnect();

    // 1. Validate Draft Quality & Uniqueness
    const validationReport = validateServiceDraft(draft);
    if (!validationReport.valid) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed: Draft does not meet quality or uniqueness criteria.",
          validationReport,
        },
        { status: 422 }
      );
    }

    const serviceData = draft.service;
    serviceData.status = "published";
    serviceData.publishStatus = "published";
    if (!serviceData.slug) {
      serviceData.slug = validationReport.candidateSlug;
    }

    // 2. Create or Update Live Service in MongoDB
    const createdService = await Service.findOneAndUpdate(
      { slug: serviceData.slug },
      serviceData,
      { upsert: true, new: true, runValidators: true }
    );

    // 3. Update Source Opportunity Status to 'approved'
    let updatedOpportunity = null;
    const opportunityId = id || draft.generationMetadata?.sourceOpportunityId;
    if (opportunityId && opportunityId !== "custom") {
      updatedOpportunity = await ServiceOpportunity.findByIdAndUpdate(
        opportunityId,
        { status: "approved", suggestedServiceSlug: serviceData.slug },
        { new: true }
      ).catch(() => null);
    }

    // 4. Invalidate Service Intelligence Snapshot Cache
    invalidateServiceSnapshotCache();

    return NextResponse.json({
      success: true,
      message: `Service '${createdService.title}' successfully published.`,
      service: createdService,
      opportunity: updatedOpportunity,
      validationReport,
      publishedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to approve and publish service." },
      { status: 500 }
    );
  }
}

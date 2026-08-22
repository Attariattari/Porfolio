import { NextResponse } from "next/server";
import { getAuthSession, checkPermission } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import { ServiceOpportunity } from "@/models/ServiceOpportunity";
import { validateServiceDraft } from "@/lib/ai/intelligence/services/serviceGeneratorEngine";

export async function GET(request, { params }) {
  try {
    const session = await getAuthSession();
    if (!checkPermission(session, "services", "view")) {
      return NextResponse.json(
        { success: false, error: "Access Denied: You do not have permission to view draft service." },
        { status: 403 }
      );
    }

    const { id } = params;
    await dbConnect();
    const opportunity = await ServiceOpportunity.findById(id).lean();

    if (!opportunity) {
      return NextResponse.json(
        { success: false, error: "Service opportunity or draft record not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: opportunity,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch service draft." },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getAuthSession();
    if (!checkPermission(session, "services", "edit")) {
      return NextResponse.json(
        { success: false, error: "Access Denied: You do not have permission to update draft service." },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { draft } = body;

    if (!draft || !draft.service) {
      return NextResponse.json(
        { success: false, error: "Missing required payload: 'draft' object." },
        { status: 400 }
      );
    }

    const validationReport = validateServiceDraft(draft);

    return NextResponse.json({
      success: true,
      draft,
      validationReport,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update service draft." },
      { status: 500 }
    );
  }
}

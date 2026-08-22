import { NextResponse } from "next/server";
import { getAuthSession, checkPermission } from "@/lib/auth";
import { regenerateServiceSection, generateServiceDraft } from "@/lib/ai/intelligence/services/serviceGeneratorEngine";

export async function POST(request, { params }) {
  try {
    const session = await getAuthSession();
    if (!checkPermission(session, "services", "edit")) {
      return NextResponse.json(
        { success: false, error: "Access Denied: You do not have permission to regenerate service drafts." },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { draft, section, instruction, opportunityPayload } = body;

    if (section && draft) {
      const result = await regenerateServiceSection(draft, section, instruction);
      return NextResponse.json(result);
    }

    if (opportunityPayload) {
      const result = await generateServiceDraft(opportunityPayload);
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { success: false, error: "Missing required parameters: 'draft' & 'section' or 'opportunityPayload'." },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to regenerate service draft." },
      { status: 500 }
    );
  }
}

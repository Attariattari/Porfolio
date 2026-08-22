import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAuthSession, checkPermission } from "@/lib/auth";
import { publishServiceEntity } from "@/lib/ai/intelligence/services/servicePublishingEngine";

export async function POST(request) {
  try {
    const session = await getAuthSession();
    if (!checkPermission(session, "services", "edit")) {
      return NextResponse.json(
        { success: false, error: "Access Denied: You do not have permission to publish services." },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { service, servicePayload, opportunityId } = body;
    const targetService = service || servicePayload;

    if (!targetService || !targetService.title) {
      return NextResponse.json(
        { success: false, error: "Missing required payload: 'service' object with title." },
        { status: 400 }
      );
    }

    const payloadWithOpportunity = {
      ...targetService,
      opportunityId: opportunityId || targetService.opportunityId || "",
    };

    const result = await publishServiceEntity(payloadWithOpportunity, { revalidatePath });

    if (!result.success) {
      return NextResponse.json(result, { status: 422 });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to publish service entity." },
      { status: 500 }
    );
  }
}

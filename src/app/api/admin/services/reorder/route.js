import { NextResponse } from "next/server";
import { ServiceController } from "@/controllers/ServiceController";
import { ActivityController } from "@/controllers/ActivityController";
import { getAuthSession, checkPermission } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function POST(request) {
  try {
    const session = await getAuthSession();
    if (!checkPermission(session, "services", "update")) {
      return NextResponse.json({ success: false, error: "Access Denied: You do not have 'update' permission for services." }, { status: 403 });
    }

    const { ids } = await request.json();
    if (!Array.isArray(ids)) {
      return NextResponse.json({ success: false, error: "Invalid data format: 'ids' must be an array." }, { status: 400 });
    }

    await ServiceController.reorder(ids);
    
    // Trigger ISR Revalidation
    revalidatePath("/");
    revalidatePath("/services");

    // Log activity
    await ActivityController.logFromSession(session, {
        action: 'UPDATE',
        module: 'SERVICES',
        details: `Reordered services list (${ids.length} items)`,
    });

    return NextResponse.json({ success: true, message: "Services reordered successfully." });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

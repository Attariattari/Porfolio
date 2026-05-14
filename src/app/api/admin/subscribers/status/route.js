import { NextResponse } from "next/server";
import { SubscriberController } from "@/controllers/SubscriberController";
import { getAuthSession, checkPermission } from "@/lib/auth";

export async function POST(request) {
  try {
    const session = await getAuthSession();
    if (!checkPermission(session, "settings", "update")) {
      return NextResponse.json({ success: false, error: "Access Denied" }, { status: 403 });
    }

    const { ids, isActive } = await request.json();

    if (!ids || !Array.isArray(ids)) {
      return NextResponse.json({ success: false, error: "Invalid IDs provided" }, { status: 400 });
    }

    await SubscriberController.bulkUpdateStatus(ids, isActive);

    return NextResponse.json({ 
        success: true, 
        message: `Successfully ${isActive ? 'reactivated' : 'deactivated'} ${ids.length} subscribers.` 
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

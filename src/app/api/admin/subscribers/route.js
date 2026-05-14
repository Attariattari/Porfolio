import { NextResponse } from "next/server";
import { SubscriberController } from "@/controllers/SubscriberController";
import { getAuthSession, checkPermission } from "@/lib/auth";
import { sendNewsletterEmail } from "@/lib/newsletter";

export async function GET(request) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const page = searchParams.get('page') || 1;
    const limit = searchParams.get('limit') || 10;

    const result = await SubscriberController.getAll({ search, status, page, limit });
    const stats = await SubscriberController.getStats();

    return NextResponse.json({ success: true, ...result, stats });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getAuthSession();
    if (!checkPermission(session, "settings", "update")) {
      return NextResponse.json({ success: false, error: "Access Denied" }, { status: 403 });
    }

    const body = await request.json();
    const { type, ...data } = body;

    if (type === 'manual_newsletter') {
        const result = await sendNewsletterEmail('manual', data);
        return NextResponse.json({ success: true, result });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

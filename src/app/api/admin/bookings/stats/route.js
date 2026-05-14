import { NextResponse } from "next/server";
import { BookingController } from "@/controllers/BookingController";
import { authenticateAdminRequest } from "@/lib/adminAuth";

export async function GET(req) {
  const auth = await authenticateAdminRequest(req);
  if (auth.error) {
    return NextResponse.json({ success: false, message: auth.error.message }, { status: auth.error.status });
  }

  try {
    const stats = await BookingController.getStats();
    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { BookingController } from "@/controllers/BookingController";
import { authenticateAdminRequest } from "@/lib/adminAuth";

export async function GET(req, { params }) {
  const auth = await authenticateAdminRequest(req);
  if (auth.error) {
    return NextResponse.json({ success: false, message: auth.error.message }, { status: auth.error.status });
  }

  try {
    const { id } = await params;
    const booking = await BookingController.getById(id);
    return NextResponse.json({ success: true, data: booking });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  const auth = await authenticateAdminRequest(req);
  if (auth.error) {
    return NextResponse.json({ success: false, message: auth.error.message }, { status: auth.error.status });
  }

  try {
    const { id } = await params;
    const data = await req.json();
    const updated = await BookingController.update(id, data);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const auth = await authenticateAdminRequest(req);
  if (auth.error) {
    return NextResponse.json({ success: false, message: auth.error.message }, { status: auth.error.status });
  }

  try {
    const { id } = await params;
    await BookingController.delete(id);
    return NextResponse.json({ success: true, message: "Booking deleted" });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

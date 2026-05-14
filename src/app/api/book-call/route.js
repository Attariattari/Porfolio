import { NextResponse } from "next/server";
import { BookingController } from "@/controllers/BookingController";

export async function POST(req) {
  try {
    const data = await req.json();
    
    // Basic validation
    if (!data.name || !data.email || !data.service || !data.preferredDate || !data.preferredTime) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const booking = await BookingController.create(data);
    return NextResponse.json({ success: true, data: booking });
  } catch (error) {
    console.error("[API Book Call] Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

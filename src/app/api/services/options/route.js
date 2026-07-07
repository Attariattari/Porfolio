import { NextResponse } from "next/server";
import { getPublicServiceOptions } from "@/lib/services/getPublicServiceOptions";

export async function GET() {
  try {
    const services = await getPublicServiceOptions();
    return NextResponse.json({ success: true, data: services });
  } catch (error) {
    console.error("[API Services Options] Error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to load service options", data: [] },
      { status: 500 },
    );
  }
}

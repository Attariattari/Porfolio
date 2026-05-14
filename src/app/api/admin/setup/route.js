import { NextResponse } from "next/server";
import { isSetupComplete } from "@/lib/auth";

export async function GET() {
  const complete = await isSetupComplete();
  return NextResponse.json({ isSetup: complete });
}

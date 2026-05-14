import { NextResponse } from "next/server";
import { portfolioData } from "@/lib/data";

export async function GET() {
  return NextResponse.json({ profile: portfolioData.about });
}

import { NextResponse } from "next/server";
import { SocialController } from "@/controllers/SocialController";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const data = await SocialController.get();
    
    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error("GET /api/social-links error:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to fetch social links",
    }, { status: 500 });
  }
}

// POST /api/social-links
// Updates social links data (Replaces old data)

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate that body is an array of links
    const links = Array.isArray(body) ? body : body.links;
    
    if (!links || !Array.isArray(links)) {
        return NextResponse.json({
            success: false,
            error: "Invalid data format. Expected an array of social links."
        }, { status: 400 });
    }

    const data = await SocialController.update(links);
    
    return NextResponse.json({
      success: true,
      data: data,
      message: "Social links updated successfully",
    });
  } catch (error) {
    console.error("POST /api/social-links error:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to update social links",
    }, { status: 500 });
  }
}

// PATCH for backward compatibility
export async function PATCH(request) {
    return POST(request);
}

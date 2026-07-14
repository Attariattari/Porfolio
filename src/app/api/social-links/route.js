import { NextResponse } from "next/server";
import { SocialController } from "@/controllers/SocialController";
import { getAuthSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

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
    const session = await getAuthSession();
    if (!["super-admin", "root-super-admin"].includes(session?.role)) {
      return NextResponse.json({ success: false, error: "Access Denied" }, { status: 403 });
    }

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
    revalidatePath("/", "layout");
    
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

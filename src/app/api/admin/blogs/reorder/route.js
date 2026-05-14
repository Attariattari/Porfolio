import { NextResponse } from "next/server";
import { BlogController } from "@/controllers/BlogController";
import { ActivityController } from "@/controllers/ActivityController";
import { getAuthSession, checkPermission } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function POST(request) {
  try {
    const session = await getAuthSession();
    if (!checkPermission(session, "blogs", "update")) {
      return NextResponse.json({ success: false, error: "Access Denied: You do not have 'update' permission for blogs." }, { status: 403 });
    }

    const { ids } = await request.json();
    if (!Array.isArray(ids)) {
      return NextResponse.json({ success: false, error: "Invalid data format: 'ids' must be an array." }, { status: 400 });
    }

    await BlogController.reorder(ids);
    
    // Trigger ISR Revalidation
    revalidatePath("/");
    revalidatePath("/blog");

    // Log activity
    await ActivityController.logFromSession(session, {
        action: 'UPDATE',
        module: 'BLOGS',
        details: `Reordered blogs list (${ids.length} items)`,
    });

    return NextResponse.json({ success: true, message: "Blogs reordered successfully." });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

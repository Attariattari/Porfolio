import { NextResponse } from "next/server";
import { BlogController } from "@/controllers/BlogController";
import { ActivityController } from "@/controllers/ActivityController";

export const dynamic = "force-dynamic";
import { getAuthSession, checkPermission } from "@/lib/auth";
import { serializeDoc } from "@/lib/mongooseHelper";
import { revalidatePath } from "next/cache";

// GET ALL BLOGS - Returns merged: MongoDB + unused data.js items (Public)
export async function GET() {
  try {
    const blogs = await BlogController.getAll();
    return NextResponse.json({ success: true, count: blogs.length, data: blogs });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// CREATE NEW BLOG (Admin with Create Permission)
export async function POST(request) {
  try {
    const session = await getAuthSession();
    if (!checkPermission(session, "blogs", "create")) {
      return NextResponse.json({ success: false, error: "Access Denied: You do not have 'create' permission for blogs." }, { status: 403 });
    }

    const body = await request.json();
    const newBlog = await BlogController.create(body);
    
    // Trigger ISR Revalidation
    revalidatePath("/");
    revalidatePath("/blog");

    // Log activity
    await ActivityController.logFromSession(session, {
        action: 'CREATE',
        module: 'BLOGS',
        details: `Created blog: ${newBlog.title}`,
        targetId: newBlog._id
    });

    return NextResponse.json({ success: true, data: serializeDoc(newBlog) }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// DELETE ALL BLOGS (Bulk)
export async function DELETE() {
  try {
    const session = await getAuthSession();
    if (!checkPermission(session, "blogs", "delete")) {
      return NextResponse.json({ success: false, error: "Access Denied: You do not have 'delete' permission for blogs." }, { status: 403 });
    }

    const result = await BlogController.deleteAll();
    
    // Trigger ISR Revalidation
    revalidatePath("/");
    revalidatePath("/blog");

    // Log activity
    await ActivityController.logFromSession(session, {
        action: 'DELETE',
        module: 'BLOGS',
        details: `Deleted all blog records (${result.deletedCount} items)`
    });

    return NextResponse.json({ success: true, message: `Successfully cleared ${result.deletedCount} blogs.` });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

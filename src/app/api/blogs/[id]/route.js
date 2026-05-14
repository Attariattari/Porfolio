import { NextResponse } from "next/server";
import { BlogController } from "@/controllers/BlogController";
import { ActivityController } from "@/controllers/ActivityController";
import { getAuthSession, checkPermission } from "@/lib/auth";

// GET BLOG BY SLUG OR ID (Public)
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const blog = await BlogController.getOne(id);
    if (!blog) return NextResponse.json({ success: false, error: "Blog post not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: blog });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// UPDATE BLOG BY ID (Admin with Edit Permission)
export async function PATCH(request, { params }) {
  try {
    const session = await getAuthSession();
    if (!checkPermission(session, "blogs", "edit")) {
      return NextResponse.json({ success: false, error: "Access Denied: You do not have 'edit' permission for blogs." }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const updatedBlog = await BlogController.update(id, body);
    if (!updatedBlog) return NextResponse.json({ success: false, error: "Blog post not found" }, { status: 404 });
    
    // Log activity
    await ActivityController.logFromSession(session, {
        action: 'UPDATE',
        module: 'BLOGS',
        details: `Updated blog: ${updatedBlog.title}`,
        targetId: updatedBlog._id
    });

    return NextResponse.json({ success: true, data: updatedBlog });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// DELETE ONE BLOG BY ID (Admin with Delete Permission)
export async function DELETE(request, { params }) {
  try {
    const session = await getAuthSession();
    if (!checkPermission(session, "blogs", "delete")) {
      return NextResponse.json({ success: false, error: "Access Denied: You do not have 'delete' permission for blogs." }, { status: 403 });
    }

    const { id } = await params;
    console.log(`[API] Attempting to delete blog with ID: ${id}`);
    
    const deletedBlog = await BlogController.deleteOne(id);
    if (!deletedBlog) {
        console.warn(`[API] Blog not found for deletion. ID: ${id}`);
        return NextResponse.json({ success: false, error: "Blog post not found" }, { status: 404 });
    }
    
    // Log activity
    await ActivityController.logFromSession(session, {
        action: 'DELETE',
        module: 'BLOGS',
        details: `Deleted blog: ${deletedBlog.title}`,
        targetId: deletedBlog._id
    });

    return NextResponse.json({ success: true, message: `Successfully deleted blog: ${deletedBlog.title}` });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

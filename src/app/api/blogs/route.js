import { NextResponse } from "next/server";
import { BlogController } from "@/controllers/BlogController";
import { ActivityController } from "@/controllers/ActivityController";

export const dynamic = "force-dynamic";
import { getAuthSession, checkPermission } from "@/lib/auth";
import { serializeDoc } from "@/lib/mongooseHelper";
import { revalidatePath } from "next/cache";

// GET ALL BLOGS - Returns merged: MongoDB + unused data.js items (Public)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeContent = searchParams.get("includeContent") === "true";
    const paginated = searchParams.has("offset") || searchParams.has("limit") || searchParams.has("category") || searchParams.has("search");

    if (includeContent) {
      const session = await getAuthSession();
      if (!checkPermission(session, "blogs", "edit")) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
      }
    }

    if (!includeContent && paginated) {
      const page = await BlogController.getPublicPage({
        offset: searchParams.get("offset"),
        limit: searchParams.get("limit"),
        category: searchParams.get("category") || "",
        search: searchParams.get("search") || "",
      });
      const response = NextResponse.json({ success: true, ...page, data: page.items });
      response.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=900");
      return response;
    }

    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");

    const blogs = await BlogController.getAll(false, { includeContent });

    if (pageParam || limitParam) {
      const pageNum = Math.max(1, parseInt(pageParam || "1", 10));
      const limitNum = Math.min(100, Math.max(1, parseInt(limitParam || "21", 10)));
      const startIndex = (pageNum - 1) * limitNum;
      const paginatedBlogs = blogs.slice(startIndex, startIndex + limitNum);
      const totalPages = Math.ceil(blogs.length / limitNum) || 1;

      const response = NextResponse.json({
        success: true,
        count: paginatedBlogs.length,
        total: blogs.length,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasMore: pageNum < totalPages,
        data: paginatedBlogs,
      });

      if (includeContent) {
        response.headers.set("Cache-Control", "private, max-age=60, stale-while-revalidate=240");
        response.headers.set("Vary", "Cookie");
      }
      return response;
    }

    const response = NextResponse.json({ success: true, count: blogs.length, data: blogs });

    if (includeContent) {
      // Authenticated admin payloads may be reused by this browser only. Never
      // place draft/full article content in Vercel's shared CDN cache.
      response.headers.set("Cache-Control", "private, max-age=60, stale-while-revalidate=240");
      response.headers.set("Vary", "Cookie");
    }

    return response;
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

// DELETE BLOGS (Bulk or Clear All)
export async function DELETE(request) {
  try {
    const session = await getAuthSession();
    if (!checkPermission(session, "blogs", "delete")) {
      return NextResponse.json({ success: false, error: "Access Denied: You do not have 'delete' permission for blogs." }, { status: 403 });
    }

    let ids = [];
    try {
      const body = await request.json();
      if (body && Array.isArray(body.ids)) {
        ids = body.ids;
      }
    } catch {
      // Empty or non-JSON body
    }

    if (ids.length > 0) {
      const result = await BlogController.deleteMany(ids);
      
      // Trigger ISR Revalidation
      revalidatePath("/");
      revalidatePath("/blog");

      // Log activity
      await ActivityController.logFromSession(session, {
        action: 'DELETE',
        module: 'BLOGS',
        details: `Bulk deleted ${result.deletedCount || ids.length} blog records`
      });

      return NextResponse.json({
        success: true,
        count: result.deletedCount || ids.length,
        message: `Successfully deleted ${result.deletedCount || ids.length} blog(s).`
      });
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

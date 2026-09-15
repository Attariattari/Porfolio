import { NextResponse } from "next/server";
import { getAuthSession, checkPermission } from "@/lib/auth";
import { cacheManager } from "@/lib/cache";
import { BlogController, revalidatePublicBlogPaths } from "@/controllers/BlogController";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const session = await getAuthSession();
    if (!checkPermission(session, "blogs", "edit") && !checkPermission(session, "blogs", "create")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Insufficient permissions to revalidate blog cache." },
        { status: 401 }
      );
    }

    // Invalidate in-memory and Redis caches
    await cacheManager.invalidateByTag("blogs").catch(() => {});

    // Invalidate Next.js static / ISR page caches
    revalidatePublicBlogPaths();

    // Query fresh page data to return current live totals
    const freshPage = await BlogController.getPublicPage({ limit: 1 });

    return NextResponse.json({
      success: true,
      message: "Blog page cache and sitemaps successfully revalidated.",
      liveData: {
        totalPublished: freshPage.total,
        categoriesCount: freshPage.categories.length,
        latestPublishedDate: freshPage.latestPublishedDate,
      },
    });
  } catch (error) {
    console.error("[Blog Revalidate API Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to revalidate blog cache." },
      { status: 500 }
    );
  }
}

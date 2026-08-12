import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { BloggerPost } from "@/models/BloggerPost";
import { Blog } from "@/models/Portfolio";
import { generateBloggerSupportingBlog } from "@/lib/ai/blog/generateBloggerSupportingBlog";
import { checkBloggerConfigStatus, checkIfBloggerPostExists } from "@/lib/server/bloggerService";
import {
  getUnsyncedOldBlogsCount,
  processDailyBloggerBacklog,
} from "@/lib/ai/blog/bloggerBacklogEngine";

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const query = {};
    if (status && status !== "all") {
      query.publishStatus = status;
    }

    const rawPosts = await BloggerPost.find(query)
      .populate("parentBlogId", "image featuredImage title imageStatus")
      .sort({ createdAt: -1 })
      .lean();

    const posts = rawPosts.map((post) => {
      const parentImage = post.parentBlogId?.featuredImage?.url || post.parentBlogId?.image || null;
      const contentImage = post.content?.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] || null;
      return {
        ...post,
        coverImage: contentImage || parentImage || null,
        hasCoverImage: Boolean(contentImage || parentImage),
      };
    });

    // Auto Sync Verification: Check if any published posts were deleted directly on Blogger.com
    for (const post of posts) {
      if (post.publishStatus === "published" && post.bloggerPostId) {
        checkIfBloggerPostExists(post.bloggerPostId).then(async (checkRes) => {
          if (!checkRes.exists && checkRes.reason === "DELETED_ON_BLOGGER") {
            console.log(`[Blogger Auto-Sync] Post "${post.title}" was deleted on Blogger. Reverting status...`);
            await BloggerPost.findByIdAndUpdate(post._id, {
              publishStatus: "pending_review",
              bloggerPostId: null,
              bloggerUrl: null,
              errorLog: "Post was deleted directly on Google Blogger dashboard.",
            });
          }
        }).catch(() => {});
      }
    }

    const configStatus = checkBloggerConfigStatus();
    const backlogStatus = await getUnsyncedOldBlogsCount();

    return NextResponse.json({
      success: true,
      data: posts,
      configStatus,
      backlogStatus: {
        totalWebsiteBlogs: backlogStatus.totalPublishedOnWebsite,
        syncedCount: backlogStatus.syncedToBloggerCount,
        unsyncedCount: backlogStatus.unsyncedCount,
      },
    });
  } catch (error) {
    console.error("[API GET /api/admin/blogger Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();

    // Trigger Drip Engine for 1 Old Blog
    if (body.action === "process_drip") {
      const dripResult = await processDailyBloggerBacklog({ isManual: true });
      if (!dripResult.success) {
        return NextResponse.json(
          { success: false, error: dripResult.error },
          { status: 500 }
        );
      }
      return NextResponse.json({
        success: true,
        message: dripResult.message,
        data: dripResult,
      });
    }

    const { parentBlogId } = body;

    if (!parentBlogId) {
      return NextResponse.json(
        { success: false, error: "parentBlogId or action is required" },
        { status: 400 }
      );
    }

    const parentBlog = await Blog.findById(parentBlogId);
    if (!parentBlog) {
      return NextResponse.json(
        { success: false, error: "Parent blog not found" },
        { status: 404 }
      );
    }

    console.log(`[Blogger API v2] Generating supporting blog for parent ID: ${parentBlogId}...`);
    const result = await generateBloggerSupportingBlog(parentBlogId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Blogger supporting post generated successfully",
      data: result.bloggerPost,
    });
  } catch (error) {
    console.error("[API POST /api/admin/blogger Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { BloggerPost } from "@/models/BloggerPost";
import { Blog } from "@/models/Portfolio";
import { generateBloggerSupportingBlog } from "@/lib/ai/blog/generateBloggerSupportingBlog";
import {
  checkBloggerConfigStatus,
  checkIfBloggerPostExists,
  sanitizeBloggerContentLinks,
  sanitizeBloggerUrl,
  updateGoogleBloggerPost,
} from "@/lib/server/bloggerService";
import {
  getUnsyncedOldBlogsCount,
  processDailyBloggerBacklog,
} from "@/lib/ai/blog/bloggerBacklogEngine";

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const parentBlogId = searchParams.get("parentBlogId");

    // 🔒 AUTO-CLEAN & AUTO-UPDATE EXISTING POSTS WITH LOCALHOST URLS
    const postsNeedingSanitization = await BloggerPost.find({
      $or: [
        { content: { $regex: "localhost|127\\.0\\.0\\.1", $options: "i" } },
        { parentBlogUrl: { $regex: "localhost|127\\.0\\.0\\.1", $options: "i" } },
      ],
    });

    if (postsNeedingSanitization.length > 0) {
      console.log(`[Blogger URL Sanitizer] Found ${postsNeedingSanitization.length} existing posts with localhost URLs. Auto-cleaning...`);
      for (const p of postsNeedingSanitization) {
        const cleanContent = sanitizeBloggerContentLinks(p.content);
        const cleanParentUrl = sanitizeBloggerUrl(p.parentBlogUrl);

        p.content = cleanContent;
        p.parentBlogUrl = cleanParentUrl;
        await p.save();

        if (p.publishStatus === "published" && p.bloggerPostId) {
          updateGoogleBloggerPost(p.bloggerPostId, {
            title: p.title,
            content: cleanContent,
            tags: p.tags,
            canonicalUrl: cleanParentUrl,
          }).catch((err) => console.error(`[Blogger URL Sanitizer Update Error] ${p.title}:`, err.message));
        }
      }
    }

    // 🔒 AUTO-DEDUPLICATE HISTORICAL DUPLICATE BLOGGER POSTS
    try {
      const parentPostGroups = await BloggerPost.aggregate([
        { $match: { parentBlogId: { $exists: true, $ne: null } } },
        { $group: { _id: "$parentBlogId", count: { $sum: 1 }, docs: { $push: "$$ROOT" } } },
        { $match: { count: { $gt: 1 } } },
      ]);

      if (parentPostGroups.length > 0) {
        console.log(`[Blogger Deduplicator] Found ${parentPostGroups.length} parent blogs with historical duplicate posts. Cleaning up...`);
        for (const group of parentPostGroups) {
          const docs = group.docs;
          // Sort to pick the best post to KEEP:
          // 1. Published / has bloggerPostId
          // 2. Highest qualityScore
          // 3. Newest createdAt
          docs.sort((a, b) => {
            const aPub = a.publishStatus === "published" || Boolean(a.bloggerPostId);
            const bPub = b.publishStatus === "published" || Boolean(b.bloggerPostId);
            if (aPub && !bPub) return -1;
            if (!aPub && bPub) return 1;
            return new Date(b.createdAt) - new Date(a.createdAt);
          });

          const keepDoc = docs[0];
          const removeDocs = docs.slice(1);
          const removeIds = removeDocs.map((d) => d._id);

          await BloggerPost.deleteMany({ _id: { $in: removeIds } });
          console.log(`[Blogger Deduplicator] Kept post ${keepDoc._id} ("${keepDoc.title}"). Removed ${removeIds.length} duplicate post(s) for parent ${group._id}.`);
        }
      }
    } catch (dedupErr) {
      console.error("[Blogger Deduplicator Error]:", dedupErr.message);
    }

    const query = {};
    if (status && status !== "all") {
      query.publishStatus = status;
    }
    if (parentBlogId) {
      query.parentBlogId = parentBlogId;
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
    const publishedPosts = posts.filter((p) => p.publishStatus === "published" && p.bloggerPostId);
    if (publishedPosts.length > 0) {
      await Promise.all(
        publishedPosts.map(async (post) => {
          try {
            const checkRes = await checkIfBloggerPostExists(post.bloggerPostId);
            if (!checkRes.exists && checkRes.reason === "DELETED_ON_BLOGGER") {
              console.log(`[Blogger Auto-Sync] Post "${post.title}" was deleted directly on Blogger. Reverting status...`);
              await BloggerPost.findByIdAndUpdate(post._id, {
                publishStatus: "pending_review",
                bloggerPostId: null,
                bloggerUrl: null,
                errorLog: "⚠️ Post was deleted directly on Google Blogger dashboard.",
              });
              post.publishStatus = "pending_review";
              post.bloggerPostId = null;
              post.bloggerUrl = null;
              post.errorLog = "⚠️ Post was deleted directly on Google Blogger dashboard.";
            }
          } catch (err) {
            console.error(`[Blogger Auto-Sync Error] ${post.title}:`, err.message);
          }
        })
      );
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

    const { parentBlogId, force } = body;

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
    const result = await generateBloggerSupportingBlog(parentBlogId, { force: Boolean(force) });

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

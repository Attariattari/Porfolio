import dbConnect from "../../dbConnect.js";
import { Blog } from "../../../models/Portfolio.js";
import { BloggerPost } from "../../../models/BloggerPost.js";
import { generateBloggerSupportingBlog } from "./generateBloggerSupportingBlog.js";
import { publishToGoogleBlogger } from "../../server/bloggerService.js";

/**
 * Blogger Backlog Drip Engine
 * Automatically processes 1 eligible un-synced old blog per day until all old blogs are published on Google Blogger.
 * Auto-stops when caught up, and auto-resumes if new un-synced blogs appear.
 */

export async function getUnsyncedOldBlogsCount() {
  try {
    await dbConnect();

    // Fetch all published website blogs
    const publishedBlogs = await Blog.find({
      $or: [{ publishStatus: "published" }, { status: "published" }],
    })
      .select("_id title slug image featuredImage")
      .lean();

    // Fetch all blog IDs that already have a valid, high-quality Blogger post record (QC score >= 8.0 or live published)
    const existingBloggerPosts = await BloggerPost.find({
      parentBlogId: { $exists: true, $ne: null },
      $or: [
        { qualityScore: { $gte: 8.0 } },
        { publishStatus: "published" },
        { bloggerPostId: { $exists: true, $ne: null } },
      ],
    })
      .select("parentBlogId")
      .lean();

    const syncedParentIds = new Set(
      existingBloggerPosts
        .filter((bp) => bp.parentBlogId)
        .map((bp) => bp.parentBlogId.toString())
    );

    const unsyncedBlogs = publishedBlogs.filter(
      (b) => !syncedParentIds.has(b._id.toString()) && !b._isFromDataJs
    );

    return {
      totalPublishedOnWebsite: publishedBlogs.length,
      syncedToBloggerCount: syncedParentIds.size,
      unsyncedCount: unsyncedBlogs.length,
      unsyncedBlogs,
    };
  } catch (error) {
    console.error("[Blogger Backlog Engine Error] getUnsyncedOldBlogsCount:", error.message);
    return { totalPublishedOnWebsite: 0, syncedToBloggerCount: 0, unsyncedCount: 0, unsyncedBlogs: [] };
  }
}

export async function processDailyBloggerBacklog(options = {}) {
  const isManualRun = options.isManual === true;
  console.log(`[Blogger Drip Engine] Starting daily backlog drip run (Manual: ${isManualRun})...`);

  try {
    await dbConnect();

    const { unsyncedCount, unsyncedBlogs } = await getUnsyncedOldBlogsCount();

    if (unsyncedCount === 0 || unsyncedBlogs.length === 0) {
      console.log("[Blogger Drip Engine] 🎉 All old blogs are 100% caught up on Google Blogger! Standing by.");
      return {
        success: true,
        message: "All old blogs are already published on Google Blogger.",
        processedCount: 0,
        remainingCount: 0,
      };
    }

    // Pick 1 best un-synced old blog (newest first or oldest first)
    const targetBlog = unsyncedBlogs[0];
    console.log(`[Blogger Drip Engine] Selected 1 old blog for today's drip: "${targetBlog.title}" (ID: ${targetBlog._id})`);
    console.log(`[Blogger Drip Engine] Remaining un-synced old blogs after this run: ${unsyncedCount - 1}`);

    // Check if supporting post already exists in pending state, or generate new
    let bloggerPost = await BloggerPost.findOne({ parentBlogId: targetBlog._id });

    if (!bloggerPost) {
      console.log(`[Blogger Drip Engine] Generating 900-1200 word supporting article with QC audit...`);
      const genResult = await generateBloggerSupportingBlog(targetBlog._id, options);
      if (!genResult.success) {
        throw new Error(`AI generation failed for old blog "${targetBlog.title}": ${genResult.error}`);
      }
      bloggerPost = genResult.bloggerPost;
    }

    // Pre-check if bloggerPost is already published or has bloggerPostId
    if (bloggerPost.publishStatus === "published" || bloggerPost.bloggerPostId) {
      console.log(`[Blogger Drip Engine] Selected blog "${targetBlog.title}" is ALREADY published on Blogger (${bloggerPost.bloggerPostId || bloggerPost.bloggerUrl}). Skipping duplicate publish.`);
      return {
        success: true,
        message: `Blog "${targetBlog.title}" is already published on Blogger.`,
        processedBlog: bloggerPost,
        remainingCount: Math.max(0, unsyncedCount - 1),
      };
    }

    // Strict Guard: Ensure Cover Image is resolved before publishing to Blogger
    const coverImageUrl = targetBlog.featuredImage?.url || targetBlog.image;
    if (!coverImageUrl) {
      console.log(`[Blogger Drip Engine] Blog "${targetBlog.title}" has no resolved cover image. Postponing Blogger publish until image is uploaded.`);
      return {
        success: false,
        reason: "Cover image not resolved yet",
        message: `Blog "${targetBlog.title}" is waiting for cover image before publishing to Blogger.`,
      };
    }

    if (!bloggerPost.content.includes("<img")) {
      bloggerPost.content = `
        <div style="margin-bottom: 24px; text-align: center;">
          <img src="${coverImageUrl}" alt="${bloggerPost.title}" style="width: 100%; max-height: 480px; object-fit: cover; border-radius: 12px;" />
        </div>
        ${bloggerPost.content}
      `;
      await bloggerPost.save();
    }

    // 🔒 ATOMIC LOCK: Transition status to "publishing" in MongoDB
    const lockedPost = await BloggerPost.findOneAndUpdate(
      {
        _id: bloggerPost._id,
        publishStatus: { $nin: ["publishing", "published"] },
        $or: [{ bloggerPostId: { $exists: false } }, { bloggerPostId: null }, { bloggerPostId: "" }],
      },
      {
        $set: {
          publishStatus: "publishing",
          publishingStartedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!lockedPost) {
      console.log(`[Blogger Drip Engine] 🔒 Atomic lock active for "${targetBlog.title}". Another worker is actively publishing or post is already published. Aborting duplicate call.`);
      return {
        success: true,
        message: `Blog "${targetBlog.title}" is currently being published by another worker.`,
        remainingCount: Math.max(0, unsyncedCount - 1),
      };
    }

    // Publish to Google Blogger API v3 (Draft or Live based on option)
    const isDraftMode = options.isDraft === true;
    console.log(`[Blogger Drip Engine] Publishing to Blogger API v3 (${isDraftMode ? "Draft" : "Live"}) (Lock Acquired)...`);

    const pubResult = await publishToGoogleBlogger({
      title: lockedPost.title,
      content: lockedPost.content,
      tags: lockedPost.tags,
      canonicalUrl: lockedPost.parentBlogUrl,
      isDraft: isDraftMode,
    });

    if (!pubResult.success) {
      lockedPost.publishStatus = "failed";
      lockedPost.errorLog = pubResult.error;
      await lockedPost.save();
      throw new Error(`Blogger API publish failed: ${pubResult.error}`);
    }

    lockedPost.publishStatus = "published";
    lockedPost.bloggerUrl = pubResult.bloggerUrl;
    lockedPost.bloggerPostId = pubResult.bloggerPostId;
    lockedPost.publishedAt = new Date();
    await lockedPost.save();

    console.log(`[Blogger Drip Engine] ✅ Successfully published 1 old blog to Blogger: "${lockedPost.title}"`);
    console.log(`[Blogger Drip Engine] Live URL: ${pubResult.bloggerUrl}`);

    return {
      success: true,
      message: `Successfully processed old blog: "${targetBlog.title}"`,
      processedBlog: bloggerPost,
      remainingCount: unsyncedCount - 1,
    };
  } catch (error) {
    console.error("[Blogger Drip Engine Error]:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

import dbConnect from "../../dbConnect.js";
import { Blog } from "../../../models/Portfolio.js";
import { BloggerPost } from "../../../models/BloggerPost.js";
import { generateBloggerSupportingBlog } from "./generateBloggerSupportingBlog.js";
import { publishToGoogleBlogger } from "../../server/bloggerService.js";

/**
 * Automates the 2-stage Blogger Publishing Flow:
 * 1. Generates Supporting Blogger Post alongside main website blog generation.
 * 2. Holds publishing UNTIL image is resolved (either AI generated or Super Admin manual upload via email token link).
 */

export async function onMainBlogGenerated(mainBlogId) {
  try {
    await dbConnect();
    console.log(`[Blogger Hook] Main blog created (${mainBlogId}). Generating Blogger Supporting Blog...`);

    // Check if supporting post already exists
    const existing = await BloggerPost.findOne({ parentBlogId: mainBlogId });
    if (existing) {
      console.log(`[Blogger Hook] Supporting post already exists (${existing._id}). Skipping duplicate generation.`);
      return { success: true, bloggerPost: existing };
    }

    // Generate 900-1200 word supporting article with QC audit
    const result = await generateBloggerSupportingBlog(mainBlogId);

    if (result.success) {
      console.log(`[Blogger Hook] Supporting blog generated & stored as pending_review: ${result.bloggerPost._id}`);
      
      // Check if main blog image is ALREADY resolved
      const mainBlog = await Blog.findById(mainBlogId);
      if (mainBlog && (mainBlog.image || mainBlog.featuredImage?.url)) {
        console.log(`[Blogger Hook] Main blog already has image. Triggering Blogger publish check...`);
        await triggerBloggerPublishIfReady(mainBlogId);
      }
    }

    return result;
  } catch (error) {
    console.error("[Blogger Hook Error] Safe catch onMainBlogGenerated:", error.message);
    return { success: false, error: error.message };
  }
}

export async function triggerBloggerPublishIfReady(mainBlogId) {
  try {
    await dbConnect();

    const mainBlog = await Blog.findById(mainBlogId);
    if (!mainBlog) return { success: false, error: "Main blog not found" };

    const imageUrl = mainBlog.featuredImage?.url || mainBlog.image;
    if (!imageUrl) {
      console.log(`[Blogger Hook] Main blog image not resolved yet. Postponing Blogger publication.`);
      return { success: false, reason: "Image not resolved yet" };
    }

    const bloggerPost = await BloggerPost.findOne({ parentBlogId: mainBlogId });
    if (!bloggerPost) {
      console.log(`[Blogger Hook] No Blogger post found for parent ${mainBlogId}. Generating now...`);
      return await onMainBlogGenerated(mainBlogId);
    }

    // PRE-CHECK: If already published or has bloggerPostId, bypass duplicate publish
    if (bloggerPost.publishStatus === "published" || bloggerPost.bloggerPostId) {
      console.log(`[Blogger Hook] Supporting post ${bloggerPost._id} is ALREADY published on Blogger (${bloggerPost.bloggerPostId || bloggerPost.bloggerUrl}). Bypassing duplicate publish.`);
      return { success: true, bloggerPost, alreadyPublished: true };
    }

    // Embed resolved image at top of Blogger content if not already present
    if (!bloggerPost.content.includes("<img")) {
      bloggerPost.content = `
        <div style="margin-bottom: 24px; text-align: center;">
          <img src="${imageUrl}" alt="${bloggerPost.title}" style="width: 100%; max-height: 480px; object-fit: cover; border-radius: 12px;" />
        </div>
        ${bloggerPost.content}
      `;
      await bloggerPost.save();
    }

    // Auto-Publish to Blogger if ENABLE_AUTO_BLOGGER_POST is true
    if (process.env.ENABLE_AUTO_BLOGGER_POST === "true") {
      // 🔒 ATOMIC LOCK: Transition status to "publishing" in MongoDB
      // Only ONE concurrent process will succeed; all others receive null and abort.
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
        console.log(`[Blogger Hook] 🔒 Atomic lock active for ${bloggerPost._id}. Another worker is actively publishing or post is already published. Aborting duplicate call.`);
        return { success: true, bloggerPost, lockedByOther: true };
      }

      console.log(`[Blogger Hook] Image resolved. Auto-publishing to Google Blogger API v3 (Lock Acquired)...`);
      
      const pubResult = await publishToGoogleBlogger({
        title: lockedPost.title,
        content: lockedPost.content,
        tags: lockedPost.tags,
        canonicalUrl: lockedPost.parentBlogUrl,
        isDraft: false,
      });

      if (pubResult.success) {
        lockedPost.publishStatus = "published";
        lockedPost.bloggerUrl = pubResult.bloggerUrl;
        lockedPost.bloggerPostId = pubResult.bloggerPostId;
        lockedPost.publishedAt = new Date();
        await lockedPost.save();
        console.log(`[Blogger Hook] Successfully published to Blogger: ${pubResult.bloggerUrl}`);
        return { success: true, bloggerPost: lockedPost };
      } else {
        lockedPost.publishStatus = "failed";
        lockedPost.errorLog = pubResult.error;
        await lockedPost.save();
        return { success: false, error: pubResult.error, bloggerPost: lockedPost };
      }
    } else {
      console.log(`[Blogger Hook] Image attached. Supporting post ready in Admin Dashboard (/admin/blogger) for 1-Click Publish.`);
    }

    return { success: true, bloggerPost };
  } catch (error) {
    console.error("[Blogger Hook Error] Safe catch triggerBloggerPublishIfReady:", error.message);
    return { success: false, error: error.message };
  }
}

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
    if (process.env.ENABLE_AUTO_BLOGGER_POST === "true" && bloggerPost.publishStatus !== "published") {
      console.log(`[Blogger Hook] Image resolved. Auto-publishing to Google Blogger API v3...`);
      
      const pubResult = await publishToGoogleBlogger({
        title: bloggerPost.title,
        content: bloggerPost.content,
        tags: bloggerPost.tags,
        canonicalUrl: bloggerPost.parentBlogUrl,
        isDraft: false, // Auto live or draft based on setting
      });

      if (pubResult.success) {
        bloggerPost.publishStatus = "published";
        bloggerPost.bloggerUrl = pubResult.bloggerUrl;
        bloggerPost.bloggerPostId = pubResult.bloggerPostId;
        bloggerPost.publishedAt = new Date();
        await bloggerPost.save();
        console.log(`[Blogger Hook] Successfully published to Blogger: ${pubResult.bloggerUrl}`);
      } else {
        bloggerPost.publishStatus = "failed";
        bloggerPost.errorLog = pubResult.error;
        await bloggerPost.save();
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

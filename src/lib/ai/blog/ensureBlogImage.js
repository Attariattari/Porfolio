import dbConnect from "@/lib/dbConnect";
import { Blog } from "@/models/Portfolio";
import { BlogAutomationLog } from "@/models/BlogAutomationLog";
import { cacheManager } from "@/lib/cache";
import { emitSocketEvent } from "@/lib/socket";
import {
  generateBlogImagePrompt,
  isProfessionalImagePromptReady,
} from "./generateBlogImagePrompt";
import { generateBlogImage } from "./generateBlogImage";
import { createBlogImageUploadLink } from "@/lib/server/blogImageUploadToken";
import { sendBlogImagePromptEmail } from "@/lib/server/email/sendBlogImagePromptEmail";

function safeErrorMessage(error) {
  if (!error) return "Image generation failed.";
  return String(error.message || error).slice(0, 180);
}

function getSuperAdminEmail() {
  return (
    process.env.SUPER_ADMIN_EMAIL ||
    process.env.ROOT_ADMIN_EMAIL ||
    process.env.ADMIN_EMAIL ||
    process.env.SMTP_USER
  );
}

export async function ensureBlogImage(blogId, options = {}) {
  const startedAt = new Date();
  const maxImageRetries = Number(options.maxImageRetries || 1);
  const skipGeneration = options.skipGeneration === true;

  try {
    await dbConnect();
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return { success: false, status: "failed", message: "Blog not found." };
    }

    if (blog.featuredImage?.url || blog.image) {
      return { success: true, status: "already_has_image", blog };
    }

    let imagePrompt = {
      prompt: blog.imagePrompt || blog.image_prompt,
      altText: blog.featuredImage?.alt || `${blog.title} blog cover image`,
      visualDirection: blog.imagePromptEnhanced || "",
      negativePrompt: blog.imageNegativePrompt || "",
    };

    if (!isProfessionalImagePromptReady(imagePrompt)) {
      imagePrompt = await generateBlogImagePrompt(blog);
      blog.imagePrompt = imagePrompt.prompt;
      blog.image_prompt = imagePrompt.prompt;
      blog.imagePromptEnhanced = imagePrompt.visualDirection;
      blog.imageNegativePrompt = imagePrompt.negativePrompt;
      await blog.save();
    }

    const imageResult = skipGeneration
      ? {
          success: false,
          error: "AI image generation skipped by admin setting.",
          attempts: 0,
        }
      : await (async () => {
          blog.imageStatus = "generating";
          blog.imageGenerationError = undefined;
          await blog.save();
          emitSocketEvent("blog:image-generating", {
            blogId: blog._id.toString(),
          });

          return generateBlogImage({
            prompt: imagePrompt.prompt,
            negativePrompt: imagePrompt.negativePrompt,
            maxRetries: maxImageRetries,
            providerTimeoutMs: Number(options.providerTimeoutMs || 12000),
          });
        })();

    blog.imageGenerationAttempts =
      (blog.imageGenerationAttempts || 0) + (imageResult.attempts || 0);

    if (!skipGeneration && imageResult.success) {
      blog.image = imageResult.image.url;
      blog.featuredImage = {
        url: imageResult.image.url,
        publicId: imageResult.image.publicId,
        alt: imagePrompt.altText,
        source: "ai_generated",
      };
      blog.imageGenerated = true;
      blog.imageStatus = "generated";

      if (process.env.AUTO_PUBLISH_AI_BLOGS === "true") {
        blog.publishStatus = "published";
      }

      await blog.save();
      await cacheManager.invalidateByTag("blogs");
      emitSocketEvent("blog:image-generated", { blogId: blog._id.toString() });

      await BlogAutomationLog.create({
        blogId: blog._id,
        contentStatus: "success",
        imageStatus: "generated",
        startedAt,
        finishedAt: new Date(),
        status: "success",
        message: "AI blog image generated and attached.",
      });

      return { success: true, status: "generated", blog };
    }

    const targetEmail = getSuperAdminEmail();
    blog.imageStatus = "manual_required";
    blog.imageGenerated = false;
    blog.imageGenerationError = skipGeneration
      ? "AI image generation skipped by admin setting."
      : "AI image provider unavailable after retry.";

    let uploadLink = null;
    let emailSent = false;

    if (targetEmail) {
      const { rawToken, link } = await createBlogImageUploadLink({
        blog,
        targetEmail,
        createdBy: "ai-blog-automation",
      });
      uploadLink = link;
      blog.manualImageUploadTokenId = link._id;

      const emailResult = await sendBlogImagePromptEmail({
        to: targetEmail,
        blog,
        imagePrompt,
        uploadToken: rawToken,
        expiresAt: link.expiresAt,
        baseUrl: options.baseUrl,
      });

      if (emailResult.success) {
        link.emailSentAt = new Date();
        await link.save();
        emailSent = true;
      }
    }

    await blog.save();
    await cacheManager.invalidateByTag("blogs");
    emitSocketEvent("blog:image-required", { blogId: blog._id.toString() });

    await BlogAutomationLog.create({
      blogId: blog._id,
      contentStatus: "success",
      imageStatus: "manual_required",
      imagePromptEmailSent: emailSent,
      uploadLinkId: uploadLink?._id,
      imageError: imageResult.error,
      startedAt,
      finishedAt: new Date(),
      status: "partial_success",
      message: emailSent
        ? "AI blog generated; manual image upload email sent."
        : "AI blog generated; manual image upload required.",
    });

    return {
      success: true,
      status: "manual_required",
      emailSent,
      uploadLinkId: uploadLink?._id?.toString(),
      blog,
    };
  } catch (error) {
    console.error("[ensureBlogImage] Safe failure:", safeErrorMessage(error));
    await BlogAutomationLog.create({
      blogId,
      contentStatus: "success",
      imageStatus: "failed",
      imageError: safeErrorMessage(error),
      startedAt,
      finishedAt: new Date(),
      status: "partial_success",
      message: "Image workflow failed safely after blog generation.",
    }).catch(() => {});

    return {
      success: false,
      status: "failed",
      message: "Image workflow failed safely.",
    };
  }
}

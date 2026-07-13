import dbConnect from "@/lib/dbConnect";
import { Blog } from "@/models/Portfolio";
import { BlogImageUploadLink } from "@/models/BlogImageUploadLink";
import {
  finalizeBlogPipeline,
  runBlogAutomationPipeline,
} from "@/lib/blogAutomation";

function getUtcDay() {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  return {
    start,
    slot: start.toISOString().slice(0, 10),
  };
}

function hasImage(blog) {
  return Boolean(blog?.image || blog?.featuredImage?.url);
}

async function hasActiveEmailedPrompt(blogId, now = new Date()) {
  return Boolean(await BlogImageUploadLink.exists({
    blogId,
    status: "active",
    emailSentAt: { $exists: true },
    expiresAt: { $gt: now },
  }));
}

async function sendPromptWhenRequired(blog, baseUrl) {
  if (!blog || hasImage(blog)) {
    return {
      id: blog?._id,
      success: true,
      status: "already_has_image",
      emailSent: false,
    };
  }

  if (await hasActiveEmailedPrompt(blog._id)) {
    return {
      id: blog._id,
      success: true,
      status: "email_already_sent",
      emailSent: true,
    };
  }

  const result = await finalizeBlogPipeline(blog._id, {
    generateImage: false,
    baseUrl,
  });

  return {
    id: blog._id,
    success: result.success,
    status: result.status,
    emailSent: Boolean(result.emailSent),
  };
}

/**
 * Idempotent daily blog contract shared by the primary cron and its backup.
 * One UTC slot can create at most one scheduled blog. A later invocation can
 * safely finish or retry the prompt email without creating a duplicate post.
 */
export async function runDailyBlogPipeline({
  baseUrl,
  source = "primary",
  backlogLimit = 2,
} = {}) {
  await dbConnect();

  const { start, slot } = getUtcDay();
  const results = {
    slot,
    source,
    step1: null,
    step2: [],
  };

  let dailyBlog = await Blog.findOne({
    aiGenerated: true,
    $or: [
      { automationSlot: slot },
      { createdAt: { $gte: start } },
    ],
  }).sort({ createdAt: 1 });

  if (!dailyBlog) {
    results.step1 = await runBlogAutomationPipeline(
      0,
      null,
      null,
      null,
      {
        automationSlot: slot,
        automationSource: `vercel-cron:${source}`,
      },
    );

    if (results.step1?.success && results.step1.blogId) {
      dailyBlog = await Blog.findById(results.step1.blogId);
    }
  } else {
    results.step1 = {
      success: true,
      blogId: dailyBlog._id,
      message: "Daily blog slot already exists.",
    };
  }

  if (dailyBlog) {
    results.step2.push(await sendPromptWhenRequired(dailyBlog, baseUrl));
  }

  const activePromptBlogIds = await BlogImageUploadLink.distinct("blogId", {
    status: "active",
    emailSentAt: { $exists: true },
    expiresAt: { $gt: new Date() },
  });
  const excludedBlogIds = [
    ...activePromptBlogIds,
    ...(dailyBlog?._id ? [dailyBlog._id] : []),
  ];

  if (backlogLimit > 0) {
    const pendingImageBlogs = await Blog.find({
      aiGenerated: true,
      imageGenerated: false,
      imageStatus: { $in: ["pending", "failed", "manual_required"] },
      _id: { $nin: excludedBlogIds },
    })
      .sort({ createdAt: 1 })
      .limit(backlogLimit);

    for (const blog of pendingImageBlogs) {
      results.step2.push(await sendPromptWhenRequired(blog, baseUrl));
    }
  }

  const failed =
    results.step1?.success !== true ||
    !dailyBlog ||
    results.step2.some((step) =>
      step.success === false ||
      (step.status === "manual_required" && !step.emailSent),
    );

  return {
    success: !failed,
    message: failed
      ? "Daily blog contract is incomplete and should be retried."
      : "Daily blog and image-prompt workflow is complete.",
    dailyBlogId: dailyBlog?._id?.toString() || null,
    results,
  };
}

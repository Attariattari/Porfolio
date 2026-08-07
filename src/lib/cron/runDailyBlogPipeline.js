import dbConnect from "@/lib/dbConnect";
import { Blog } from "@/models/Portfolio";
import { BlogImageUploadLink } from "@/models/BlogImageUploadLink";
import {
  finalizeBlogPipeline,
  runBlogAutomationPipeline,
} from "@/lib/blogAutomation";
import { getBlogAutomationSettings, getNextAutomationAt } from "@/lib/blogAutomationSettings";

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
 * Idempotent scheduled blog contract shared by the primary cron and backup.
 * Each invocation creates at most one article; hourly invocations continue
 * until the configured UTC-day limit is reached, while interval and unique
 * slot guards prevent bursts and duplicates.
 */
export async function runDailyBlogPipeline({
  baseUrl,
  source = "primary",
  backlogLimit = 2,
} = {}) {
  await dbConnect();

  const { start, slot } = getUtcDay();
  const settings = await getBlogAutomationSettings();
  const results = {
    slot,
    source,
    settings,
    step1: null,
    step2: [],
  };

  const automatedToday = await Blog.find({
    aiGenerated: true,
    createdAt: { $gte: start },
    automationSlot: { $exists: true, $ne: null },
  }).sort({ createdAt: 1 }).select("_id automationSlot createdAt generatedAt").lean();
  const lastAutomatedBlog = await Blog.findOne({ aiGenerated: true, automationSlot: { $exists: true, $ne: null } })
    .sort({ createdAt: -1 })
    .select("createdAt generatedAt")
    .lean();
  const nextEligibleAt = getNextAutomationAt({ settings, lastGeneratedAt: lastAutomatedBlog?.generatedAt || lastAutomatedBlog?.createdAt });
  const due = settings.enabled && automatedToday.length < settings.dailyQuantity && nextEligibleAt <= new Date();
  const highestSlotOrdinal = automatedToday.reduce((highest, blog) => {
    const match = String(blog.automationSlot || "").match(new RegExp(`^${slot}-(\\d+)$`));
    return match ? Math.max(highest, Number(match[1]) || 0) : highest;
  }, 0);
  const nextSlot = `${slot}-${String(highestSlotOrdinal + 1).padStart(2, "0")}`;
  let dailyBlog = null;

  if (due) {
    results.step1 = await runBlogAutomationPipeline(
      0,
      null,
      null,
      null,
      {
        automationSlot: nextSlot,
        automationSource: `vercel-cron:${source}`,
      },
    );

    if (results.step1?.success && results.step1.blogId) {
      dailyBlog = await Blog.findById(results.step1.blogId);
    }
  } else {
    results.step1 = {
      success: true,
      skipped: true,
      message: !settings.enabled
        ? "Automatic blog generation is disabled."
        : automatedToday.length >= settings.dailyQuantity
          ? `Daily limit of ${settings.dailyQuantity} automated blogs is complete.`
          : `Next automated blog is eligible after ${nextEligibleAt.toISOString()}.`,
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
    results.step2.some((step) =>
      step.success === false ||
      (step.status === "manual_required" && !step.emailSent),
    );
  const reportedNextEligibleAt = dailyBlog
    ? new Date(new Date(dailyBlog.generatedAt || dailyBlog.createdAt).getTime() + settings.intervalHours * 3600000)
    : nextEligibleAt;

  return {
    success: !failed,
    message: failed
      ? "Daily blog contract is incomplete and should be retried."
      : "Daily blog and image-prompt workflow is complete.",
    dailyBlogId: dailyBlog?._id?.toString() || null,
    schedule: {
      enabled: settings.enabled,
      generatedToday: automatedToday.length + (dailyBlog ? 1 : 0),
      dailyQuantity: settings.dailyQuantity,
      intervalHours: settings.intervalHours,
      nextEligibleAt: reportedNextEligibleAt.toISOString(),
    },
    results,
  };
}

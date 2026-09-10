import dbConnect from "@/lib/dbConnect";
import { SiteConfig } from "@/models/Portfolio";

export const BLOG_AUTOMATION_DEFAULTS = Object.freeze({
  enabled: true,
  dailyQuantity: 1,
  intervalHours: 24,
  customScheduledAt: null,
});

export function sanitizeBlogAutomationSettings(value = {}) {
  const customScheduledAt = value.customScheduledAt
    ? new Date(value.customScheduledAt)
    : null;
  const validCustomScheduledAt =
    customScheduledAt && Number.isFinite(customScheduledAt.getTime())
      ? customScheduledAt
      : null;

  return {
    enabled: value.enabled !== false,
    dailyQuantity: Math.min(12, Math.max(1, Math.trunc(Number(value.dailyQuantity) || BLOG_AUTOMATION_DEFAULTS.dailyQuantity))),
    intervalHours: Math.min(168, Math.max(1, Math.trunc(Number(value.intervalHours) || BLOG_AUTOMATION_DEFAULTS.intervalHours))),
    customScheduledAt: validCustomScheduledAt,
    lastVercelCronAt: value.lastVercelCronAt ? new Date(value.lastVercelCronAt) : null,
    lastVercelCronStatus: value.lastVercelCronStatus || null,
    updatedAt: value.updatedAt ? new Date(value.updatedAt) : null,
    updatedBy: value.updatedBy || null,
  };
}

export async function getBlogAutomationSettings() {
  await dbConnect();
  const config = await SiteConfig.findOne().select("blogAutomation").lean();
  return sanitizeBlogAutomationSettings(config?.blogAutomation || BLOG_AUTOMATION_DEFAULTS);
}

export function getNextAutomationAt({ settings, lastGeneratedAt = null } = {}) {
  // 0. Priority One-Off Custom Scheduled Timer
  if (settings?.customScheduledAt) {
    const customTime = new Date(settings.customScheduledAt);
    if (Number.isFinite(customTime.getTime())) {
      return customTime;
    }
  }

  const intervalHours = Number(settings?.intervalHours || 24);
  const dailyQuantity = Math.max(1, Number(settings?.dailyQuantity || 1));

  // Equal division interval: total hours window ÷ number of blogs
  // e.g. 24 hours ÷ 4 blogs = 6 hours (21,600,000 ms)
  // e.g. 24 hours ÷ 6 blogs = 4 hours (14,400,000 ms)
  const intervalPerBlogMs = (intervalHours / dailyQuantity) * 3600_000;

  const generatedAt = lastGeneratedAt ? new Date(lastGeneratedAt) : null;
  const validGeneratedAt = Number.isFinite(generatedAt?.getTime());
  const settingsUpdatedAt = settings?.updatedAt ? new Date(settings.updatedAt) : null;
  const validSettingsUpdatedAt = settingsUpdatedAt && Number.isFinite(settingsUpdatedAt.getTime());

  // 1. If a blog was previously generated:
  // Next eligible time is dynamically (last blog timestamp + intervalPerBlogMs).
  // - If that time is in the past (<= now), returning it signals DUE NOW to cron & UI.
  // - If that time is in the future (> now), it gives the exact dynamic countdown target.
  if (validGeneratedAt) {
    return new Date(generatedAt.getTime() + intervalPerBlogMs);
  }

  // 2. If no blog has ever been generated:
  // Schedule from when admin settings were updated
  if (validSettingsUpdatedAt) {
    return new Date(settingsUpdatedAt.getTime() + intervalPerBlogMs);
  }

  return new Date(0);
}


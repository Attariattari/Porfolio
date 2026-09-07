import dbConnect from "@/lib/dbConnect";
import { SiteConfig } from "@/models/Portfolio";

export const BLOG_AUTOMATION_DEFAULTS = Object.freeze({
  enabled: true,
  dailyQuantity: 1,
  intervalHours: 24,
});

export function sanitizeBlogAutomationSettings(value = {}) {
  return {
    enabled: value.enabled !== false,
    dailyQuantity: Math.min(12, Math.max(1, Math.trunc(Number(value.dailyQuantity) || BLOG_AUTOMATION_DEFAULTS.dailyQuantity))),
    intervalHours: Math.min(168, Math.max(1, Math.trunc(Number(value.intervalHours) || BLOG_AUTOMATION_DEFAULTS.intervalHours))),
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

  // 1. If a blog was previously generated, check the natural next interval
  if (validGeneratedAt) {
    const normalNext = new Date(generatedAt.getTime() + intervalPerBlogMs);

    // If the natural interval is still in the future, honor it
    if (normalNext > new Date()) {
      return normalNext;
    }

    // If settings were updated AFTER the last blog and the natural next has already elapsed:
    // schedule exactly one equal interval from when settings were updated, NOT immediately.
    if (validSettingsUpdatedAt && settingsUpdatedAt > generatedAt) {
      const scheduledFromUpdate = new Date(settingsUpdatedAt.getTime() + intervalPerBlogMs);
      if (scheduledFromUpdate > new Date()) {
        return scheduledFromUpdate;
      }
    }
  }

  // 2. If no blog has ever been generated (or baseline time needed):
  // Schedule exactly one equal interval from when settings were saved/updated (or from now)
  const baseTime = validSettingsUpdatedAt ? settingsUpdatedAt : new Date();
  const scheduledFromBase = new Date(baseTime.getTime() + intervalPerBlogMs);

  return scheduledFromBase > new Date() ? scheduledFromBase : new Date(Date.now() + intervalPerBlogMs);
}


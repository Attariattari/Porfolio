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

  // Per-blog interval = total window ÷ number of blogs
  // e.g. 24 hours / 12 blogs = 2 hours between each blog
  const intervalPerBlogMs = (intervalHours / dailyQuantity) * 3600_000;

  const generatedAt = lastGeneratedAt ? new Date(lastGeneratedAt) : null;
  const validGeneratedAt = Number.isFinite(generatedAt?.getTime());
  const settingsUpdatedAt = settings?.updatedAt ? new Date(settings.updatedAt) : null;
  const validSettingsUpdatedAt = settingsUpdatedAt && Number.isFinite(settingsUpdatedAt.getTime());

  // If settings were saved AFTER the last blog (or no blog has ever been generated),
  // the first blog should fire 10 minutes after the settings were saved.
  if (validSettingsUpdatedAt && (!validGeneratedAt || settingsUpdatedAt > generatedAt)) {
    const settingsTrigger = new Date(settingsUpdatedAt.getTime() + 10 * 60_000);
    if (!validGeneratedAt) return settingsTrigger;
    // Return whichever comes FIRST: settings trigger or normal interval
    const normalNext = new Date(generatedAt.getTime() + intervalPerBlogMs);
    return settingsTrigger < normalNext ? settingsTrigger : normalNext;
  }

  // No blog has been generated and no settings date → eligible immediately
  if (!validGeneratedAt) return new Date(0);

  // Normal schedule: last blog time + per-blog interval
  return new Date(generatedAt.getTime() + intervalPerBlogMs);
}


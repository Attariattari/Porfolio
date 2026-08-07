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
  const updatedAt = settings?.updatedAt ? new Date(settings.updatedAt) : null;
  const generatedAt = lastGeneratedAt ? new Date(lastGeneratedAt) : null;
  const anchors = [updatedAt, generatedAt].filter((date) => Number.isFinite(date?.getTime()));
  if (!anchors.length) return new Date(0);
  const anchor = new Date(Math.max(...anchors.map((date) => date.getTime())));
  return new Date(anchor.getTime() + Number(settings.intervalHours || 24) * 3600000);
}

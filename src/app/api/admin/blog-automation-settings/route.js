import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { getAuthSession, checkPermission } from "@/lib/auth";
import { SiteConfig } from "@/models/Portfolio";
import { getBlogAutomationSettings, sanitizeBlogAutomationSettings } from "@/lib/blogAutomationSettings";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function authorize() {
  const session = await getAuthSession();
  return checkPermission(session, "blogs", "edit") ? session : null;
}

import { Blog } from "@/models/Portfolio";
import { getNextAutomationAt } from "@/lib/blogAutomationSettings";

async function enrichWithScheduleTimes(settings) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const automatedToday = await Blog.find({
    aiGenerated: true,
    createdAt: { $gte: startOfDay },
    automationSlot: { $exists: true, $ne: null },
  }).select("_id").lean();

  const lastAutomatedBlog = await Blog.findOne({ aiGenerated: true, automationSlot: { $exists: true, $ne: null } })
    .sort({ createdAt: -1 })
    .select("createdAt generatedAt")
    .lean();
  const lastGeneratedAt = lastAutomatedBlog?.generatedAt || lastAutomatedBlog?.createdAt || null;
  const nextEligibleAt = getNextAutomationAt({ settings, lastGeneratedAt });
  return {
    ...settings,
    generatedTodayCount: automatedToday.length,
    lastGeneratedAt: lastGeneratedAt ? new Date(lastGeneratedAt).toISOString() : null,
    nextEligibleAt: nextEligibleAt ? nextEligibleAt.toISOString() : null,
  };
}

export async function GET() {
  if (!(await authorize())) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  await dbConnect();
  const settings = await getBlogAutomationSettings();
  const data = await enrichWithScheduleTimes(settings);
  return NextResponse.json({ success: true, data });
}

export async function PATCH(request) {
  const session = await authorize();
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  const body = await request.json();
  const dailyQuantity = Number(body.dailyQuantity);
  const intervalHours = Number(body.intervalHours);
  if (!Number.isInteger(dailyQuantity) || dailyQuantity < 1 || dailyQuantity > 12) {
    return NextResponse.json({ success: false, error: "Daily quantity must be a whole number from 1 to 12." }, { status: 400 });
  }
  if (!Number.isInteger(intervalHours) || intervalHours < 1 || intervalHours > 168) {
    return NextResponse.json({ success: false, error: "Interval must be a whole number from 1 to 168 hours." }, { status: 400 });
  }
  await dbConnect();
  const value = sanitizeBlogAutomationSettings({
    enabled: body.enabled !== false,
    dailyQuantity,
    intervalHours,
    updatedAt: new Date(),
    updatedBy: session.email,
  });
  const config = await SiteConfig.findOneAndUpdate(
    {},
    { $set: { blogAutomation: value, updatedAt: new Date() } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  ).select("blogAutomation").lean();
  const settings = sanitizeBlogAutomationSettings(config.blogAutomation);
  const data = await enrichWithScheduleTimes(settings);
  return NextResponse.json({ success: true, data });
}

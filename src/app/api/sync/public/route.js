import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Blog, Project, Service, Skill, SiteConfig } from "@/models/Portfolio";
import { serializeDoc } from "@/lib/mongooseHelper";

export const dynamic = "force-dynamic";

/**
 * Public Incremental Delta Synchronization API
 * 
 * Returns ONLY newly created or modified records since the client's last cached timestamp.
 * Avoids re-transmitting entire databases to users.
 */
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const timestamps = body.timestamps || {};

    await dbConnect();

    const deltas = {};
    let hasUpdates = false;

    // 1. BLOGS DELTA
    if (timestamps.blogs) {
      const sinceDate = new Date(Number(timestamps.blogs));
      if (!isNaN(sinceDate.getTime())) {
        const updatedBlogs = await Blog.find({
          publishStatus: "published",
          updatedAt: { $gt: sinceDate },
        })
          .select("-content -auditBackup -intelligenceAudit")
          .sort({ updatedAt: -1 })
          .limit(20)
          .lean();

        if (updatedBlogs && updatedBlogs.length > 0) {
          deltas.blogs = serializeDoc(updatedBlogs);
          hasUpdates = true;
        }
      }
    }

    // 2. PROJECTS DELTA
    if (timestamps.projects) {
      const sinceDate = new Date(Number(timestamps.projects));
      if (!isNaN(sinceDate.getTime())) {
        const updatedProjects = await Project.find({
          publishStatus: "published",
          updatedAt: { $gt: sinceDate },
        })
          .sort({ updatedAt: -1 })
          .limit(20)
          .lean();

        if (updatedProjects && updatedProjects.length > 0) {
          deltas.projects = serializeDoc(updatedProjects);
          hasUpdates = true;
        }
      }
    }

    // 3. SERVICES DELTA
    if (timestamps.services) {
      const sinceDate = new Date(Number(timestamps.services));
      if (!isNaN(sinceDate.getTime())) {
        const updatedServices = await Service.find({
          publishStatus: "published",
          updatedAt: { $gt: sinceDate },
        })
          .sort({ updatedAt: -1 })
          .limit(20)
          .lean();

        if (updatedServices && updatedServices.length > 0) {
          deltas.services = serializeDoc(updatedServices);
          hasUpdates = true;
        }
      }
    }

    // 4. SKILLS DELTA
    if (timestamps.skills) {
      const sinceDate = new Date(Number(timestamps.skills));
      if (!isNaN(sinceDate.getTime())) {
        const updatedSkills = await Skill.find({
          updatedAt: { $gt: sinceDate },
        })
          .sort({ updatedAt: -1 })
          .limit(20)
          .lean();

        if (updatedSkills && updatedSkills.length > 0) {
          deltas.skills = serializeDoc(updatedSkills);
          hasUpdates = true;
        }
      }
    }

    // 5. SITE SETTINGS DELTA
    if (timestamps.settings) {
      const sinceDate = new Date(Number(timestamps.settings));
      if (!isNaN(sinceDate.getTime())) {
        const updatedConfig = await SiteConfig.findOne({
          updatedAt: { $gt: sinceDate },
        }).lean();

        if (updatedConfig) {
          deltas.settings = serializeDoc(updatedConfig);
          hasUpdates = true;
        }
      }
    }

    const response = NextResponse.json({
      success: true,
      hasUpdates,
      deltas,
      serverTime: Date.now(),
    });

    response.headers.set("Cache-Control", "public, s-maxage=30, stale-while-revalidate=60");
    return response;
  } catch (error) {
    console.error("[PublicDeltaSyncAPI] Error calculating delta:", error);
    return NextResponse.json(
      { success: false, hasUpdates: false, error: "Sync delta calculation failed" },
      { status: 500 }
    );
  }
}

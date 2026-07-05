import { NextResponse } from "next/server";
import { Project } from "@/models/Portfolio";
import dbConnect from "@/lib/dbConnect";
import { portfolioData } from "@/lib/data";
import { getAuthSession } from "@/lib/auth";
import { ActivityController } from "@/controllers/ActivityController";
import { cacheManager } from "@/lib/cache";
import { emitSocketEvent, SOCKET_EVENTS } from "@/lib/socket";
import { revalidatePath } from "next/cache";

const isEmptyValue = (value) => {
  if (value === undefined || value === null || value === "") return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
};

const buildSafeMergePayload = (existing, project) => {
  const payload = { updatedAt: new Date() };

  Object.entries(project).forEach(([key, value]) => {
    if (key === "_id" || key === "createdAt" || key === "updatedAt") return;
    if (isEmptyValue(value)) return;
    if (isEmptyValue(existing?.[key])) {
      payload[key] = value;
    }
  });

  return payload;
};

export async function POST(request) {
  try {
    const session = await getAuthSession();
    if (!["super-admin", "root-super-admin"].includes(session?.role)) {
      return NextResponse.json(
        { success: false, error: "Only Super Admin can import projects." },
        { status: 403 },
      );
    }

    const { mode = "safe" } = await request.json().catch(() => ({}));
    await dbConnect();

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const project of portfolioData.projects || []) {
      if (!project.slug || !project.title) {
        skipped += 1;
        continue;
      }

      const existing = await Project.findOne({ slug: project.slug }).lean();
      if (existing && mode !== "force") {
        const payload = buildSafeMergePayload(existing, project);
        if (Object.keys(payload).length <= 1) {
          skipped += 1;
          continue;
        }

        await Project.updateOne({ slug: project.slug }, { $set: payload });
        updated += 1;
        continue;
      }

      await Project.updateOne(
        { slug: project.slug },
        { $set: { ...project, updatedAt: new Date() } },
        { upsert: true },
      );
      existing ? (updated += 1) : (created += 1);
    }

    await cacheManager.invalidateByTag("projects");
    revalidatePath("/");
    revalidatePath("/projects");
    for (const project of portfolioData.projects || []) {
      if (project.slug) revalidatePath(`/projects/${project.slug}`);
    }
    emitSocketEvent(SOCKET_EVENTS.PROJECTS_REORDERED);
    emitSocketEvent(SOCKET_EVENTS.STATS_UPDATED);

    await ActivityController.logFromSession(session, {
      action: "IMPORT",
      module: "PROJECTS",
      details: `Imported projects from data.js. Created: ${created}, Updated: ${updated}, Skipped: ${skipped}`,
    }).catch(() => null);

    return NextResponse.json({
      success: true,
      summary: { created, updated, skipped, mode },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

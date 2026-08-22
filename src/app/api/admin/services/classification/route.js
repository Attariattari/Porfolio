import { NextResponse } from "next/server";
import { getAuthSession, checkPermission } from "@/lib/auth";
import { ServiceController } from "@/controllers/ServiceController";
import { classifyService, getAllServiceClassifications } from "@/lib/ai/intelligence/services/serviceClassificationEngine";
import { runClassificationMigration } from "@/lib/ai/intelligence/services/serviceClassificationMigration";
import dbConnect from "@/lib/dbConnect";
import Service from "@/models/Service";
import { revalidatePath } from "next/cache";

// GET ALL OR ONE SERVICE CLASSIFICATION PROFILE
export async function GET(request) {
  try {
    const session = await getAuthSession();
    if (!checkPermission(session, "services", "view")) {
      return NextResponse.json(
        { success: false, error: "Access Denied: You do not have 'view' permission for service classifications." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (slug) {
      const dbService = await ServiceController.getOne(slug);
      const profile = dbService?.classification || classifyService(slug);
      return NextResponse.json({ success: true, data: profile });
    }

    const allServices = await ServiceController.getAll(false).catch(() => []);
    const classifications = allServices.map((svc) => ({
      slug: svc.slug,
      title: svc.title,
      classification: svc.classification || classifyService(svc.slug),
    }));

    return NextResponse.json({
      success: true,
      count: classifications.length,
      data: classifications,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load service classifications." },
      { status: 500 }
    );
  }
}

// POST: BACKFILL MIGRATION OR MANUAL ADMIN CLASSIFICATION OVERRIDE
export async function POST(request) {
  try {
    const session = await getAuthSession();
    if (!checkPermission(session, "services", "edit")) {
      return NextResponse.json(
        { success: false, error: "Access Denied: You do not have 'edit' permission for service classifications." },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const action = body.action || "migrate";

    if (action === "migrate") {
      const dryRun = Boolean(body.dryRun);
      const force = Boolean(body.force);
      const summary = await runClassificationMigration({ dryRun, force });

      revalidatePath("/admin/services");
      return NextResponse.json({
        success: true,
        message: `Classification migration completed. ${summary.updated} updated, ${summary.skipped} skipped.`,
        data: summary,
      });
    }

    if (action === "update") {
      const { slug, classification } = body;
      if (!slug || !classification) {
        return NextResponse.json(
          { success: false, error: "Missing required parameters: 'slug' and 'classification'." },
          { status: 400 }
        );
      }

      await dbConnect();
      const updatedClassification = {
        ...classification,
        provenance: {
          source: "admin",
          verifiedByAdmin: true,
          updatedAt: new Date().toISOString(),
          updatedBy: session?.user?.email || "admin",
        },
      };

      const updatedDoc = await Service.findOneAndUpdate(
        { slug },
        { $set: { classification: updatedClassification, updatedAt: new Date() } },
        { new: true }
      ).lean();

      revalidatePath("/admin/services");
      revalidatePath(`/services/${slug}`);

      return NextResponse.json({
        success: true,
        message: `Service classification for '${slug}' updated successfully by admin.`,
        data: updatedDoc?.classification || updatedClassification,
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action parameter. Expected 'migrate' or 'update'." },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process classification request." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { ServiceController } from "@/controllers/ServiceController";
import { ActivityController } from "@/controllers/ActivityController";
import { getAuthSession } from "@/lib/auth";

const isSuperAdmin = (session) =>
  session?.role === "super-admin" || session?.role === "root-super-admin";

export async function POST(request) {
  try {
    const session = await getAuthSession();
    if (!isSuperAdmin(session)) {
      return NextResponse.json(
        { success: false, error: "Access denied. Super Admin required." },
        { status: 403 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const mode = body.mode === "force" ? "force" : "safe";
    const summary = await ServiceController.importFromSeed({ mode });

    revalidatePath("/");
    revalidatePath("/services");
    revalidatePath("/admin/services");

    await ActivityController.logFromSession(session, {
      action: "IMPORT",
      module: "SERVICES",
      details: `Imported services from seed data in ${mode} mode. ${summary.created} created, ${summary.updated} updated, ${summary.skipped} skipped, ${summary.errors} errors.`,
    });

    return NextResponse.json({
      success: true,
      mode,
      summary,
      message: `Services imported successfully. ${summary.created} created, ${summary.updated} updated.`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || "Service import failed." },
      { status: 500 },
    );
  }
}

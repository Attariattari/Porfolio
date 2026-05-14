import { NextResponse } from "next/server";
import { ProjectController } from "@/controllers/ProjectController";
import { ActivityController } from "@/controllers/ActivityController";
import { getAuthSession, checkPermission } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// GET ALL PROJECTS - Returns merged: MongoDB + unused data.js items (Public Access)
export async function GET() {
  try {
    const projects = await ProjectController.getAll();
    return NextResponse.json({ success: true, count: projects.length, data: projects });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// CREATE NEW PROJECT (Admin with Create Permission)
export async function POST(request) {
  try {
    const session = await getAuthSession();
    if (!checkPermission(session, "projects", "create")) {
      return NextResponse.json({ success: false, error: "Access Denied: You do not have 'create' permission for projects." }, { status: 403 });
    }

    const body = await request.json();
    const newProject = await ProjectController.create(body);
    
    // Trigger ISR Revalidation
    revalidatePath("/");
    revalidatePath("/projects");

    // Log activity
    await ActivityController.logFromSession(session, {
        action: 'CREATE',
        module: 'PROJECTS',
        details: `Launched project: ${newProject.title}`,
        targetId: newProject._id
    });

    return NextResponse.json({ success: true, data: newProject }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// DELETE ALL PROJECTS (Admin with Delete Permission)
export async function DELETE() {
  try {
    const session = await getAuthSession();
    if (!checkPermission(session, "projects", "delete")) {
      return NextResponse.json({ success: false, error: "Access Denied: You do not have 'delete' permission for projects." }, { status: 403 });
    }

    const result = await ProjectController.deleteAll();
    
    // Trigger ISR Revalidation
    revalidatePath("/");
    revalidatePath("/projects");

    // Log activity
    await ActivityController.logFromSession(session, {
        action: 'DELETE',
        module: 'PROJECTS',
        details: `Deleted all project records (${result.deletedCount} items)`
    });

    return NextResponse.json({ success: true, message: `Successfully cleared ${result.deletedCount} projects.` });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

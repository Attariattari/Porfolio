import { NextResponse } from "next/server";
import { ProjectController } from "@/controllers/ProjectController";
import { ActivityController } from "@/controllers/ActivityController";
import { getAuthSession, checkPermission } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// GET PROJECT BY ID (Public Access)
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const project = await ProjectController.getById(id);
    if (!project) return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// UPDATE PROJECT BY ID (Admin with Edit Permission)
export async function PATCH(request, { params }) {
  try {
    const session = await getAuthSession();
    if (!checkPermission(session, "projects", "edit")) {
      return NextResponse.json({ success: false, error: "Access Denied: You do not have 'edit' permission for projects." }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const updatedProject = await ProjectController.update(id, body);
    if (!updatedProject) return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
    
    // Trigger ISR Revalidation
    revalidatePath("/");
    revalidatePath("/projects");
    revalidatePath(`/projects/${updatedProject.slug}`);

    // Log activity
    await ActivityController.logFromSession(session, {
        action: 'UPDATE',
        module: 'PROJECTS',
        details: `Updated project: ${updatedProject.title}`,
        targetId: updatedProject._id
    });

    return NextResponse.json({ success: true, data: updatedProject });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// DELETE ONE PROJECT BY ID (Admin with Delete Permission)
export async function DELETE(request, { params }) {
  try {
    const session = await getAuthSession();
    if (!checkPermission(session, "projects", "delete")) {
      return NextResponse.json({ success: false, error: "Access Denied: You do not have 'delete' permission for projects." }, { status: 403 });
    }

    const { id } = await params;
    const deletedProject = await ProjectController.deleteOne(id);
    if (!deletedProject) return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
    
    // Trigger ISR Revalidation
    revalidatePath("/");
    revalidatePath("/projects");
    revalidatePath(`/projects/${deletedProject.slug}`);

    // Log activity
    await ActivityController.logFromSession(session, {
        action: 'DELETE',
        module: 'PROJECTS',
        details: `Deleted project: ${deletedProject.title}`,
        targetId: deletedProject._id
    });

    return NextResponse.json({ success: true, message: `Successfully deleted project: ${deletedProject.title}` });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

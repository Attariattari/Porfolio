import { NextResponse } from "next/server";
import { ServiceController } from "@/controllers/ServiceController";
import { ActivityController } from "@/controllers/ActivityController";
import { getAuthSession, checkPermission } from "@/lib/auth";

// GET SERVICE BY ID (Public)
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const service = await ServiceController.getById(id);
    if (!service) return NextResponse.json({ success: false, error: "Service not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: service });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// UPDATE SERVICE BY ID (Admin with Edit Permission)
export async function PATCH(request, { params }) {
  try {
    const session = await getAuthSession();
    if (!checkPermission(session, "services", "edit")) {
      return NextResponse.json({ success: false, error: "Access Denied: You do not have 'edit' permission for services." }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const updatedService = await ServiceController.update(id, body);
    if (!updatedService) return NextResponse.json({ success: false, error: "Service not found" }, { status: 404 });
    
    // Log activity
    await ActivityController.logFromSession(session, {
        action: 'UPDATE',
        module: 'SERVICES',
        details: `Modified service: ${updatedService.title}`,
        targetId: updatedService._id
    });

    return NextResponse.json({ success: true, data: updatedService });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// DELETE ONE SERVICE BY ID (Admin with Delete Permission)
export async function DELETE(request, { params }) {
  try {
    const session = await getAuthSession();
    if (!checkPermission(session, "services", "delete")) {
      return NextResponse.json({ success: false, error: "Access Denied: You do not have 'delete' permission for services." }, { status: 403 });
    }

    const { id } = await params;
    const deletedService = await ServiceController.deleteOne(id);
    if (!deletedService) return NextResponse.json({ success: false, error: "Service not found" }, { status: 404 });
    
    // Log activity
    await ActivityController.logFromSession(session, {
        action: 'DELETE',
        module: 'SERVICES',
        details: `Retired service: ${deletedService.title}`,
        targetId: deletedService._id
    });

    return NextResponse.json({ success: true, message: `Successfully deleted service: ${deletedService.title}` });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

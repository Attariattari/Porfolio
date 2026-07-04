import { NextResponse } from "next/server";
import { ServiceController } from "@/controllers/ServiceController";
import { ActivityController } from "@/controllers/ActivityController";
import { getAuthSession, checkPermission } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// GET ALL SERVICES - Returns merged: MongoDB + unused data.js items (Public)
export async function GET() {
  try {
    const services = await ServiceController.getAll();
    return NextResponse.json({ success: true, count: services.length, data: services });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// CREATE NEW SERVICE (Admin with Create Permission)
export async function POST(request) {
  try {
    const session = await getAuthSession();
    if (!checkPermission(session, "services", "create")) {
      return NextResponse.json({ success: false, error: "Access Denied: You do not have 'create' permission for services." }, { status: 403 });
    }

    const body = await request.json();
    const newService = await ServiceController.create(body);
    revalidatePath("/");
    revalidatePath("/services");
    
    // Log activity
    await ActivityController.logFromSession(session, {
        action: 'CREATE',
        module: 'SERVICES',
        details: `Enabled service: ${newService.title}`,
        targetId: newService._id
    });

    return NextResponse.json({ success: true, data: newService }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// DELETE ALL SERVICES (Bulk)
export async function DELETE() {
  try {
    const session = await getAuthSession();
    if (!checkPermission(session, "services", "delete")) {
      return NextResponse.json({ success: false, error: "Access Denied: You do not have 'delete' permission for services." }, { status: 403 });
    }

    const result = await ServiceController.deleteAll();
    revalidatePath("/");
    revalidatePath("/services");
    
    // Log activity
    await ActivityController.logFromSession(session, {
        action: 'DELETE',
        module: 'SERVICES',
        details: `Deleted all service records (${result.deletedCount} items)`
    });

    return NextResponse.json({ success: true, message: `Successfully cleared ${result.deletedCount} services.` });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

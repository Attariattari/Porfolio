import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { NotificationController } from "@/controllers/NotificationController";

async function isAdmin() {
    const session = await getAuthSession();
    return ["user", "admin", "super-admin", "root-super-admin"].includes(session?.role);
}

async function isSuperAdmin() {
    const session = await getAuthSession();
    return session?.role === "super-admin" || session?.role === "root-super-admin";
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  const notifications = await NotificationController.getAll();
  return NextResponse.json({ notifications });
}

export async function POST(request) {
  try {
    const { id, action, status, title, message, type } = await request.json();
    
    if (action === "CREATE") {
      if (!(await isAdmin())) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      const result = await NotificationController.create({ title, message, type });
      return NextResponse.json({ success: true, data: result });
    }

    if (!(await isAdmin())) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    if (action === "UPDATE_STATUS") {
      const result = await NotificationController.markAsRead(id);
      return NextResponse.json({ success: !!result });
    } else if (action === "DELETE") {
      const result = await NotificationController.delete(id);
      return NextResponse.json({ success: result.success });
    }
    
    return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("Notifications API Error:", err);
    return NextResponse.json({ success: false, message: err.message || "Server error" }, { status: 500 });
  }
}

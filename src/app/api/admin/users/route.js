import { NextResponse } from "next/server";
import { getAllUsers, approveUser, denyUser, removeUser, updateUserMetadata, getAuthSession } from "@/lib/auth";

async function isSuperAdmin() {
    const session = await getAuthSession();
    return session?.role === "super-admin" || session?.role === "root-super-admin";
}

export async function GET() {
  if (!(await isSuperAdmin())) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  const users = await getAllUsers();
  return NextResponse.json({ users });
}

export async function POST(request) {
  if (!(await isSuperAdmin())) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  try {
    const { email, action } = await request.json(); // approve, deny, remove
    if (action === "approve") {
      const result = await approveUser(email);
      return NextResponse.json(result);
    } else if (action === "deny") {
      const result = await denyUser(email);
      return NextResponse.json(result);
    } else if (action === "remove") {
      const result = await removeUser(email);
      return NextResponse.json(result);
    }
    return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function PATCH(request) {
  if (!(await isSuperAdmin())) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  try {
    const { email, role, permissions } = await request.json();
    const result = await updateUserMetadata(email, { role, permissions });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ success: false, message: "Metadata update failure." }, { status: 500 });
  }
}

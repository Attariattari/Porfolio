import { NextResponse } from "next/server";
import { getAllUsers, approveUser, denyUser, removeUser, updateUserMetadata, getAuthSession } from "@/lib/auth";

async function getAuthorizedSession() {
    const session = await getAuthSession();
    return session && ["super-admin", "root-super-admin"].includes(session.role) ? session : null;
}

export async function GET() {
  if (!(await getAuthorizedSession())) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  const users = await getAllUsers();
  return NextResponse.json({ users });
}

export async function POST(request) {
  const session = await getAuthorizedSession();
  if (!session) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  try {
    const { email, action } = await request.json(); // approve, deny, remove
    const users = await getAllUsers();
    const target = users.find((user) => user.email?.toLowerCase() === email?.toLowerCase());
    if (target?.role === "super-admin" && session.role !== "root-super-admin") {
      return NextResponse.json({ success: false, message: "Only the root administrator can change a super administrator account." }, { status: 403 });
    }
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
  const session = await getAuthorizedSession();
  if (!session) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  try {
    const { email, role, permissions } = await request.json();
    const result = await updateUserMetadata(email, { role, permissions }, session);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ success: false, message: "Metadata update failure." }, { status: 500 });
  }
}

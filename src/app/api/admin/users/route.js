import { NextResponse } from "next/server";
import { getAllUsers, approveUser, denyUser, removeUser, updateUserMetadata, getAuthSession } from "@/lib/auth";
import User from "@/models/AdminModels";
import dbConnect from "@/lib/dbConnect";
import eventBus, { ADMIN_EVENTS } from "@/lib/eventBus";

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
    if (["restrict", "restore"].includes(action) && session.role !== "root-super-admin") {
      return NextResponse.json({ success: false, message: "Only the root administrator can restrict or restore accounts." }, { status: 403 });
    }
    if (action === "restrict" || action === "restore") {
      await dbConnect();
      const normalizedEmail = email?.trim().toLowerCase();
      const rootEmail = (process.env.SUPER_ADMIN_EMAIL || "attariattari549@gmail.com").toLowerCase();
      if (!normalizedEmail || normalizedEmail === rootEmail || target?.role === "root-super-admin") {
        return NextResponse.json({ success: false, message: "The root administrator account cannot be restricted." }, { status: 403 });
      }
      const update = action === "restrict"
        ? { $set: { status: "restricted", accessRestriction: { reason: "Access restricted by the root administrator.", restrictedAt: new Date(), restrictedBy: session.email } }, $unset: { accessAppeal: 1 } }
        : { $set: { status: "approved" }, $unset: { accessRestriction: 1, accessAppeal: 1 } };
      const updated = await User.findOneAndUpdate({ email: normalizedEmail }, update, { new: true });
      if (!updated) return NextResponse.json({ success: false, message: "User account not found." }, { status: 404 });
      eventBus.emit(ADMIN_EVENTS.USER_UPDATE, { email: normalizedEmail, status: updated.status, forceLogout: action === "restrict" });
      return NextResponse.json({ success: true, status: updated.status });
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

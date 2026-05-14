import { NextResponse } from "next/server";
import { getPendingApprovals, approveUser, denyUser, getAuthSession } from "@/lib/auth";

// Middleware-like check for Super Admin
async function checkSuperAdmin() {
    const session = await getAuthSession();
    return session && session.role === "super-admin";
}

export async function GET() {
  if (!(await checkSuperAdmin())) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }
  const pending = await getPendingApprovals();
  return NextResponse.json({ approvals: pending });
}

export async function POST(request) {
  if (!(await checkSuperAdmin())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  try {
    const { email, action } = await request.json(); // action: 'approve' or 'deny'
    
    if (action === "approve") {
      const result = await approveUser(email);
      return NextResponse.json(result);
    } else {
      const result = await denyUser(email);
      return NextResponse.json(result);
    }
  } catch (err) {
    return NextResponse.json({ success: false, message: "Action failed" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request) {
  // PATCH: Delete both httpOnly and non-httpOnly auth cookies
  (await cookies()).delete("admin_auth_token");
  (await cookies()).delete("admin_token");
  return NextResponse.json({ success: true, message: "Signed out" });
}

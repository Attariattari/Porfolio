import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { invalidateAuthSessionCache } from "@/lib/auth";

export async function POST(request) {
  // PATCH: Delete both httpOnly and non-httpOnly auth cookies
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_auth_token")?.value || cookieStore.get("admin_token")?.value;
  if (token) invalidateAuthSessionCache(token);
  cookieStore.delete("admin_auth_token");
  cookieStore.delete("admin_token");
  return NextResponse.json({ success: true, message: "Signed out" });
}

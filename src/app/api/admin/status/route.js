import { NextResponse } from "next/server";
import { isUserActive } from "@/lib/auth";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) return NextResponse.json({ success: false, message: "Email required." }, { status: 400 });

    const active = await isUserActive(email);
    return NextResponse.json({ success: true, active });
}

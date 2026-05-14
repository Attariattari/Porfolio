import { NextResponse } from "next/server";
import { sendVerificationCode, isUserActive } from "@/lib/auth";

export async function POST(request) {
  try {
    const { email, type } = await request.json(); // type: 'setup' or 'reset'
    const userIsActive = await isUserActive(email);

    if (type === 'setup' && userIsActive) {
        return NextResponse.json({ success: false, message: "This entity is already registered. Request a reset instead." }, { status: 400 });
    }

    if (type === 'reset' && !userIsActive) {
        return NextResponse.json({ success: false, message: "No active account found for this identity." }, { status: 404 });
    }

    const result = await sendVerificationCode(email, type);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ success: false, message: "Gateway failure." }, { status: 500 });
  }
}

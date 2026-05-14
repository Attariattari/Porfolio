import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/AdminModels";
import { sendVerificationCode } from "@/lib/auth";

export async function POST(request) {
  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ success: false, message: "Identification signature required." }, { status: 400 });

    const normalizedEmail = email.toLowerCase();
    await dbConnect();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
        return NextResponse.json({ success: false, code: "NOT_FOUND", message: "Identity hash not found in Muhyo Tech." }, { status: 404 });
    }

    // Only allow if denied or removed or just lost passkey
    // If approved, they should just login
    if (user.status === "approved") {
        return NextResponse.json({ success: false, message: "Account node is already active. Please utilize the standard gateway." }, { status: 400 });
    }

    // Trigger verification code for recovery
    const res = await sendVerificationCode(normalizedEmail, "setup");
    
    if (res.success) {
        return NextResponse.json({ success: true, message: "Identity trace initialized. Verification code dispatched." });
    } else {
        return NextResponse.json({ success: false, message: "Communication relay failure." }, { status: 500 });
    }

  } catch (error) {
    return NextResponse.json({ success: false, message: "Muhyo Tech internal error." }, { status: 500 });
  }
}

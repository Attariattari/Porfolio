import { NextResponse } from "next/server";
import { verifyAndHandleRequest } from "@/lib/auth";

export async function POST(request) {
  try {
    const { email, code } = await request.json();
    const result = await verifyAndHandleRequest(email, code);

    if (result.success) {
      return NextResponse.json(result);
    }

    return NextResponse.json(result, { status: 400 });
  } catch (err) {
    return NextResponse.json({ success: false, message: "Verification failed." }, { status: 500 });
  }
}

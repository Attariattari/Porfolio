import { NextResponse } from "next/server";
import { login } from "@/lib/auth";
import { ActivityController } from "@/controllers/ActivityController";

export async function POST(request) {
  try {
    const { email, passkey } = await request.json();
    const result = await login(email, passkey);

    if (!result.success) {
       return NextResponse.json({ 
           success: false, 
           code: result.code, 
           message: result.message 
       }, { status: 401 });
    }

    // Log activity
    await ActivityController.log({
        user: {
            name: result.name || result.email.split('@')[0],
            email: result.email,
            role: result.role
        },
        action: 'LOGIN',
        module: 'USERS',
        details: `Successful administrative entry from ${result.email}`
    });

    // Return token for client-side storage as well
    return NextResponse.json({ 
      success: true, 
      message: "Authorized",
      token: result.token, // Return JWT token for localStorage
      user: {
        email: result.email,
        role: result.role,
      }
    }, { status: 200 });
  } catch (error) {
    console.error("[Login Error]", error);
    return NextResponse.json({ success: false, message: "Authentication failed" }, { status: 500 });
  }
}

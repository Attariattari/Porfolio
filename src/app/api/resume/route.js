import { NextResponse } from "next/server";
import { ResumeController } from "@/controllers/ResumeController";
import { getAuthSession, checkPermission } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// GET RESUME (Public)
export async function GET() {
  try {
    const resume = await ResumeController.get();
    return NextResponse.json({ success: true, data: resume });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// UPDATE RESUME (Admin with Resume:Edit Permission)
export async function PATCH(request) {
  try {
    const session = await getAuthSession();
    if (!checkPermission(session, "resume", "edit")) {
      return NextResponse.json({ success: false, error: "Access Denied: You do not have 'edit' permission for the resume." }, { status: 403 });
    }

    const body = await request.json();
    const updatedResume = await ResumeController.update(body);
    revalidatePath("/resume");
    return NextResponse.json({ success: true, data: updatedResume });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

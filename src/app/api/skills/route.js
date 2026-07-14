import { NextResponse } from "next/server";
import { SkillController } from "@/controllers/SkillController";
import { getAuthSession, checkPermission } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// GET ALL SKILLS - Returns merged: MongoDB + unused data.js items (Public)
export async function GET() {
  try {
    const skills = await SkillController.getAll();
    return NextResponse.json({ success: true, count: skills.length, data: skills });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// CREATE NEW SKILL (Admin with Create Permission)
export async function POST(request) {
  try {
    const session = await getAuthSession();
    if (!checkPermission(session, "skills", "create")) {
      return NextResponse.json({ success: false, error: "Access Denied: You do not have 'create' permission for skills." }, { status: 403 });
    }

    const body = await request.json();
    const newSkill = await SkillController.create(body);
    revalidatePath("/");
    revalidatePath("/skills");
    return NextResponse.json({ success: true, data: newSkill }, { status:201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// DELETE ALL SKILLS (Bulk)
export async function DELETE() {
  try {
    const session = await getAuthSession();
    if (!checkPermission(session, "skills", "delete")) {
      return NextResponse.json({ success: false, error: "Access Denied: You do not have 'delete' permission for skills." }, { status: 403 });
    }

    await SkillController.deleteAll();
    revalidatePath("/");
    revalidatePath("/skills");
    return NextResponse.json({ success: true, message: "Successfully cleared all skills." });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

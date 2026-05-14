import { NextResponse } from "next/server";
import { SkillController } from "@/controllers/SkillController";
import { getAuthSession, checkPermission } from "@/lib/auth";

// UPDATE SKILL BY ID (Admin with Edit Permission)
export async function PATCH(request, { params }) {
  try {
    const session = await getAuthSession();
    if (!checkPermission(session, "skills", "edit")) {
      return NextResponse.json({ success: false, error: "Access Denied: You do not have 'edit' permission for skills." }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const updatedSkill = await SkillController.update(id, body);
    if (!updatedSkill) return NextResponse.json({ success: false, error: "Skill not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: updatedSkill });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// DELETE ONE SKILL BY ID (Admin with Delete Permission)
export async function DELETE(request, { params }) {
  try {
    const session = await getAuthSession();
    if (!checkPermission(session, "skills", "delete")) {
      return NextResponse.json({ success: false, error: "Access Denied: You do not have 'delete' permission for skills." }, { status: 403 });
    }

    const { id } = await params;
    const deletedSkill = await SkillController.deleteOne(id);
    if (!deletedSkill) return NextResponse.json({ success: false, error: "Skill not found" }, { status: 404 });
    return NextResponse.json({ success: true, message: `Successfully deleted skill.` });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

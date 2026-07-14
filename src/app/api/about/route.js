import { NextResponse } from "next/server";
import { AboutController } from "@/controllers/AboutController";
import { getAuthSession, checkPermission } from "@/lib/auth";
import { serializeDoc } from "@/lib/mongooseHelper";
import { getAboutPageData } from "@/lib/content/getAboutPageData";
import { revalidatePath } from "next/cache";

// GET PROFILE (Public)
export async function GET() {
  try {
    const profile = await AboutController.get();
    return NextResponse.json({ success: true, data: serializeDoc(profile) });
  } catch (error) {
    console.warn("[about-api] Unable to load DB profile, using safe fallback");
    return NextResponse.json({ success: true, data: getAboutPageData(null) });
  }
}

// UPDATE PROFILE (Admin with About:Edit Permission)
export async function PATCH(request) {
  try {
    const session = await getAuthSession();
    if (!["super-admin", "root-super-admin"].includes(session?.role)) {
      return NextResponse.json({ success: false, error: "Access Denied: About page management is limited to Super Admin users." }, { status: 403 });
    }

    if (!checkPermission(session, "about", "edit")) {
      return NextResponse.json({ success: false, error: "Access Denied: You do not have 'edit' permission for the profile." }, { status: 403 });
    }

    const body = await request.json();
    const updatedProfile = await AboutController.update(body);
    revalidatePath("/");
    revalidatePath("/about");
    return NextResponse.json({ success: true, data: serializeDoc(updatedProfile) });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

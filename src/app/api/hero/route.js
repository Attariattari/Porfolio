import { NextResponse } from "next/server";
import { HeroController } from "@/controllers/HeroController";
import { getAuthSession, checkPermission } from "@/lib/auth";
import { serializeDoc } from "@/lib/mongooseHelper";

// GET HERO (Public)
export async function GET() {
    try {
        const hero = await HeroController.get();
        return NextResponse.json({ success: true, data: serializeDoc(hero) });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// UPDATE HERO (Admin)
export async function PATCH(request) {
    try {
        const session = await getAuthSession();
        
        // Use about permission as a proxy for hero management
        if (!checkPermission(session, "about", "edit")) {
            return NextResponse.json({ success: false, error: "Access Denied" }, { status: 403 });
        }

        const body = await request.json();
        const updatedHero = await HeroController.update(body);
        return NextResponse.json({ success: true, data: serializeDoc(updatedHero) });
    } catch (error) {
        console.error("API Hero PATCH Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

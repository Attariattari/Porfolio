import { NextResponse } from "next/server";
import { SubscriberController } from "@/controllers/SubscriberController";
import { getAuthSession } from "@/lib/auth";

export async function PATCH(request, { params }) {
    try {
        const session = await getAuthSession();
        if (!session || session.role !== "super-admin") {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const updated = await SubscriberController.update(id, body);
        
        if (!updated) {
            return NextResponse.json({ success: false, error: "Node not found." }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Subscriber node recalibrated.", data: updated });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const session = await getAuthSession();
        if (!session || session.role !== "super-admin") {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const result = await SubscriberController.delete(id);
        
        if (!result) {
            return NextResponse.json({ success: false, error: "Node not found." }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Subscriber successfully deleted." });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

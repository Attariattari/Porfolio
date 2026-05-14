import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Booking from "@/models/Booking";
import { ContactMessage } from "@/models/Portfolio";
import { Subscriber } from "@/models/Subscriber";
import { getAuthSession } from "@/lib/auth";
import { serializeDoc } from "@/lib/mongooseHelper";

export const dynamic = 'force-dynamic';

export async function GET(req) {
    try {
        const session = await getAuthSession();
        if (!session) {
            return NextResponse.json({ success: false, message: "Unauthorized node traversal" }, { status: 401 });
        }

        await dbConnect();

        const [bookings, messages, subscribers] = await Promise.all([
            Booking.find().sort({ createdAt: -1 }).limit(5).lean(),
            ContactMessage.find().sort({ createdAt: -1 }).limit(5).lean(),
            Subscriber.find().sort({ createdAt: -1 }).limit(5).lean()
        ]);

        return NextResponse.json({
            success: true,
            data: {
                bookings: serializeDoc(bookings),
                messages: serializeDoc(messages),
                subscribers: serializeDoc(subscribers)
            }
        });
    } catch (error) {
        console.error("[Dashboard Recent API] Retrieval failed:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

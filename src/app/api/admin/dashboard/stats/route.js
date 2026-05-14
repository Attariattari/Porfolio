import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Booking from "@/models/Booking";
import { ContactMessage, Project, Service, Blog } from "@/models/Portfolio";
import { Subscriber } from "@/models/Subscriber";
import { getAuthSession } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(req) {
    try {
        const session = await getAuthSession();
        if (!session) {
            return NextResponse.json({ success: false, message: "Unauthorized node traversal" }, { status: 401 });
        }

        await dbConnect();

        const [
            bookingsData,
            blogsCount,
            servicesCount,
            projectsCount,
            subscribersCount,
            unreadMessages
        ] = await Promise.all([
            Booking.aggregate([
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        new: { $sum: { $cond: [{ $eq: ["$status", "new"] }, 1, 0] } },
                        confirmed: { $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] } },
                        completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } }
                    }
                }
            ]),
            Blog.countDocuments(),
            Service.countDocuments(),
            Project.countDocuments(),
            Subscriber.countDocuments(),
            ContactMessage.countDocuments({ status: "new" })
        ]);

        const stats = {
            bookings: bookingsData[0] || { total: 0, new: 0, confirmed: 0, completed: 0 },
            blogs: blogsCount,
            services: servicesCount,
            projects: projectsCount,
            subscribers: subscribersCount,
            unreadMessages
        };

        return NextResponse.json({ success: true, data: stats });
    } catch (error) {
        console.error("[Dashboard Stats API] Retrieval failed:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

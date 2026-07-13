import { NextResponse } from "next/server";
import { updateFeaturedRankings } from "@/lib/ai/featuredEngine";
import { Blog } from "@/models/Portfolio";
import dbConnect from "@/lib/dbConnect";
import { getAuthSession } from "@/lib/auth";

export async function GET() {
    const session = await getAuthSession();
    if (!session || !["super-admin", "root-super-admin"].includes(session.role)) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const result = await updateFeaturedRankings();

    // Log verification
    const featured = await Blog.find({ featured: true })
        .sort({ featuredOrder: 1 })
        .select("title featured featuredOrder aiGenerated");

    return NextResponse.json({
        result,
        featuredBlogs: featured,
    });
}

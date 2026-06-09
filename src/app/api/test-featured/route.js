import { NextResponse } from "next/server";
import { updateFeaturedRankings } from "@/lib/ai/featuredEngine";
import { Blog } from "@/models/Portfolio";
import dbConnect from "@/lib/dbConnect";

export async function GET() {
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
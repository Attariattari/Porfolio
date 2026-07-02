import { NextResponse } from "next/server";
import { runBlogAutomationPipeline, finalizeBlogPipeline } from "@/lib/blogAutomation";
import { Blog } from "@/models/Portfolio";
import dbConnect from "@/lib/dbConnect";

export async function GET(request) {
    try {
        await dbConnect();
        
        const results = {
            step1: null,
            step2: []
        };

        // STEP 1: Generate a new blog post if none were generated today
        // (Optional check to prevent multiple blogs per day)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayBlog = await Blog.findOne({ 
            aiGenerated: true, 
            createdAt: { $gte: today } 
        });

        if (!todayBlog) {
            console.log("[Cron] Starting Step 1: Text Generation");
            results.step1 = await runBlogAutomationPipeline();
            if (results.step1?.success && results.step1.blogId) {
                console.log("[Cron] Starting Step 1b: Image Ensure");
                const imageResult = await finalizeBlogPipeline(results.step1.blogId);
                results.step2.push({
                    id: results.step1.blogId,
                    success: imageResult.success,
                    status: imageResult.status,
                });
            }
        } else {
            results.step1 = { success: true, message: "Blog for today already exists" };
        }

        // STEP 2: Find any AI blogs missing images and generate them
        const pendingImageBlogs = await Blog.find({
            aiGenerated: true,
            imageGenerated: false,
            imageStatus: { $ne: "generating" }
        }).limit(2); // Process 2 at a time to avoid timeouts

        if (pendingImageBlogs.length > 0) {
            console.log(`[Cron] Starting Step 2: Image Generation for ${pendingImageBlogs.length} blogs`);
            for (const blog of pendingImageBlogs) {
                const res = await finalizeBlogPipeline(blog._id);
                results.step2.push({ id: blog._id, success: res.success });
            }
        }

        return NextResponse.json({
            success: true,
            message: "Cron pipeline executed",
            results
        });

    } catch (error) {
        console.error("Cron Route Error:", error);
        return NextResponse.json({
            success: false,
            message: "Cron execution failed",
            error: error.message
        }, { status: 500 });
    }
}

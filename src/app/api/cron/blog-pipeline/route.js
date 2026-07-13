import { NextResponse } from "next/server";
import { runBlogAutomationPipeline, finalizeBlogPipeline } from "@/lib/blogAutomation";
import { Blog } from "@/models/Portfolio";
import { BlogImageUploadLink } from "@/models/BlogImageUploadLink";
import dbConnect from "@/lib/dbConnect";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET(request) {
    try {
        if (process.env.CRON_SECRET) {
            const authorization = request.headers.get("authorization");
            if (authorization !== `Bearer ${process.env.CRON_SECRET}`) {
                return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
            }
        }

        await dbConnect();
        
        const results = {
            step1: null,
            step2: []
        };

        // STEP 1: Generate a new blog post if none were generated today
        // (Optional check to prevent multiple blogs per day)
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        const todayBlog = await Blog.findOne({ 
            aiGenerated: true, 
            createdAt: { $gte: today } 
        });

        if (!todayBlog) {
            console.log("[Cron] Starting Step 1: Text Generation");
            results.step1 = await runBlogAutomationPipeline();
            if (results.step1?.success && results.step1.blogId) {
                console.log("[Cron] Starting Step 1b: Image prompt email");
                const imageResult = await finalizeBlogPipeline(results.step1.blogId, {
                    generateImage: false,
                    baseUrl: new URL(request.url).origin,
                });
                results.step2.push({
                    id: results.step1.blogId,
                    success: imageResult.success,
                    status: imageResult.status,
                    emailSent: !!imageResult.emailSent,
                });
            }
        } else {
            results.step1 = { success: true, message: "Blog for today already exists" };
        }

        // STEP 2: Find any AI blogs missing images and generate them
        const blogsWithConfirmedEmail = await BlogImageUploadLink.distinct("blogId", {
            emailSentAt: { $exists: true },
        });
        const excludedBlogIds = results.step1?.blogId
            ? [...blogsWithConfirmedEmail, results.step1.blogId]
            : blogsWithConfirmedEmail;

        const pendingImageBlogs = await Blog.find({
            aiGenerated: true,
            imageGenerated: false,
            imageStatus: { $in: ["pending", "failed", "manual_required"] },
            _id: { $nin: excludedBlogIds },
        }).limit(2); // Process 2 at a time to avoid timeouts

        if (pendingImageBlogs.length > 0) {
            console.log(`[Cron] Starting Step 2: Prompt email workflow for ${pendingImageBlogs.length} blogs`);
            for (const blog of pendingImageBlogs) {
                const res = await finalizeBlogPipeline(blog._id, {
                    generateImage: false,
                    baseUrl: new URL(request.url).origin,
                });
                results.step2.push({
                    id: blog._id,
                    success: res.success,
                    status: res.status,
                    emailSent: !!res.emailSent,
                });
            }
        }

        const failed =
            results.step1?.success === false ||
            results.step2.some((step) =>
                step.success === false ||
                (step.status === "manual_required" && !step.emailSent),
            );

        if (failed) {
            return NextResponse.json({
                success: false,
                message: "Cron pipeline completed with failures and should be retried",
                results,
            }, { status: 500 });
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

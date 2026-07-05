import { NextResponse } from "next/server";
import { runBlogAutomationPipeline, finalizeBlogPipeline } from "@/lib/blogAutomation";

export const dynamic = "force-dynamic";
// Hobby plan max: 60s. For longer operations, use background jobs or upgrade to Pro

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const baseUrl = new URL(request.url).origin;
    const action = searchParams.get("action"); // 'init' or 'finalize'
    const blogId = searchParams.get("id");
    const generateImage = searchParams.get("generateImage") !== "false";

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            const sendUpdate = (data) => {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
            };

            try {
                if (action === "finalize" && blogId) {
                    // Fast path: Don't wait for image generation
                    // Send blog completion immediately, image can be generated in background
                    const result = await finalizeBlogPipeline(
                        blogId,
                        { generateImage: false, baseUrl }, // Skip image here
                        (progress) => {
                            sendUpdate(progress);
                        }
                    );
                    
                    sendUpdate({
                        status: "COMPLETED",
                        details: {
                            message: "Blog saved successfully. Image generation starting...",
                            emailSent: false,
                            workflowStatus: "blog_completed",
                        },
                    });

                    // Generate image in background (don't await)
                    if (generateImage) {
                        setTimeout(() => {
                            finalizeBlogPipeline(
                                blogId,
                                { generateImage: true, baseUrl },
                                (progress) => console.log("[Background] Image progress:", progress)
                            ).catch(err => console.error("[Background] Image generation error:", err));
                        }, 100);
                    }
                } else {
                    const result = await runBlogAutomationPipeline(0, (progress) => {
                        sendUpdate(progress);
                    });
                    
                    if (result?.success && result.blogId) {
                        sendUpdate({
                            status: "COMPLETED",
                            details: {
                                message: "Blog content created. Image generation starting in background...",
                                emailSent: false,
                                workflowStatus: "blog_completed",
                            },
                        });

                        // Generate image in background (don't await) or send manual upload email if off
                        setTimeout(() => {
                            finalizeBlogPipeline(
                                result.blogId,
                                { generateImage, baseUrl },
                                (progress) => console.log("[Background] Image/Email progress:", progress)
                            ).catch(err => console.error("[Background] Image/Email generation error:", err));
                        }, 100);
                    }
                }
                
                // Final close
                controller.close();
            } catch (error) {
                sendUpdate({ status: "ERROR", details: { message: error.message } });
                controller.close();
            }
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    });
}

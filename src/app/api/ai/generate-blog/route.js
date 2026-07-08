import { NextResponse } from "next/server";
import { runBlogAutomationPipeline, finalizeBlogPipeline } from "@/lib/blogAutomation";

export const dynamic = "force-dynamic";
// Hobby plan max: 60s. For longer operations, use background jobs or upgrade to Pro

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const baseUrl = new URL(request.url).origin;
    const action = searchParams.get("action"); // 'init' or 'finalize'
    const blogId = searchParams.get("id");
    const generateImage = searchParams.get("generateImage") === "true";

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            const keepAlive = setInterval(() => {
                try {
                    controller.enqueue(encoder.encode(`: keepalive\n\n`));
                } catch {
                    clearInterval(keepAlive);
                }
            }, 15000);

            const sendUpdate = (data) => {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
            };

            try {
                if (action === "finalize" && blogId) {
                    if (generateImage) {
                        // Fast path: don't wait for image generation.
                        sendUpdate({
                            status: "COMPLETED",
                            details: {
                                message: "Image generation starting...",
                                emailSent: false,
                                workflowStatus: "blog_completed",
                            },
                        });

                        setTimeout(() => {
                            finalizeBlogPipeline(
                                blogId,
                                { generateImage: true, baseUrl },
                                (progress) => console.log("[Background] Image progress:", progress)
                            ).catch(err => console.error("[Background] Image generation error:", err));
                        }, 100);
                    } else {
                        const result = await finalizeBlogPipeline(
                            blogId,
                            { generateImage: false, baseUrl },
                            (progress) => {
                                sendUpdate(progress);
                            }
                        );
                        
                        sendUpdate({
                            status: "COMPLETED",
                            details: {
                                message: result.emailSent
                                    ? "Secure image prompt email sent."
                                    : "Manual image upload is required, but email was not confirmed.",
                                emailSent: !!result.emailSent,
                                workflowStatus: "manual_required",
                                uploadLinkId: result.uploadLinkId,
                            },
                        });
                    }
                } else {
                    const result = await runBlogAutomationPipeline(0, (progress) => {
                        sendUpdate(progress);
                    });
                    
                    if (result?.success && result.blogId) {
                        if (generateImage) {
                            sendUpdate({
                                status: "COMPLETED",
                                details: {
                                    message: "Blog content created. Image generation starting in background...",
                                    emailSent: false,
                                    workflowStatus: "blog_completed",
                                },
                            });

                            // Generate image in background (don't await)
                            setTimeout(() => {
                                finalizeBlogPipeline(
                                    result.blogId,
                                    { generateImage: true, baseUrl },
                                    (progress) => console.log("[Background] Image progress:", progress)
                                ).catch(err => console.error("[Background] Image generation error:", err));
                            }, 100);
                        } else {
                            const imageResult = await finalizeBlogPipeline(
                                result.blogId,
                                { generateImage: false, baseUrl },
                                (progress) => sendUpdate(progress),
                            );

                            sendUpdate({
                                status: "COMPLETED",
                                details: {
                                    message: imageResult.emailSent
                                        ? "Blog content created. Secure image prompt email sent."
                                        : "Blog content created. Manual image upload is required, but email was not confirmed.",
                                    emailSent: !!imageResult.emailSent,
                                    workflowStatus: "manual_required",
                                    uploadLinkId: imageResult.uploadLinkId,
                                },
                            });
                        }
                    }
                }
                
                // Final close
                clearInterval(keepAlive);
                controller.close();
            } catch (error) {
                sendUpdate({ status: "ERROR", details: { message: error.message } });
                clearInterval(keepAlive);
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

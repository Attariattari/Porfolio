import { NextResponse } from "next/server";
import { runBlogAutomationPipeline, finalizeBlogPipeline } from "@/lib/blogAutomation";
import { getBlogAutomationSettings } from "@/lib/blogAutomationSettings";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

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
                        sendUpdate({
                            status: "GENERATING_IMAGE",
                            details: {
                                message: "Image generation is running...",
                            },
                        });

                        const result = await finalizeBlogPipeline(
                            blogId,
                            { generateImage: true, baseUrl },
                            (progress) => sendUpdate(progress),
                        );

                        sendUpdate({
                            status: "COMPLETED",
                            details: {
                                message: result.status === "generated"
                                    ? "Blog image generated successfully."
                                    : result.emailSent
                                      ? "Image generation failed; secure upload email sent."
                                      : "Image generation failed and email was not confirmed.",
                                emailSent: !!result.emailSent,
                                workflowStatus: result.status,
                            },
                        });
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
                    const settings = await getBlogAutomationSettings();
                    if (!settings.enabled && searchParams.get("force") !== "true") {
                        sendUpdate({
                            status: "FAILED",
                            details: {
                                message: "AI Blog Automation is currently turned OFF in Master Database Settings. Please turn it ON from the dashboard header to generate.",
                                isPaused: true,
                            },
                        });
                        clearInterval(keepAlive);
                        controller.close();
                        return;
                    }

                    const result = await runBlogAutomationPipeline(0, (progress) => {
                        sendUpdate(progress);
                    });

                    if (!result?.success) {
                        const rawMsg = result?.error || result?.details?.message || "AI blog generation failed.";
                        const isConcurrent = /already processing/i.test(rawMsg);
                        const cleanMsg = isConcurrent
                            ? "Another AI article is currently being generated. Please wait for it to complete before starting a new one."
                            : rawMsg;

                        sendUpdate({
                            status: isConcurrent ? "BUSY" : "FAILED",
                            details: {
                                ...(result?.details || {}),
                                message: cleanMsg,
                                isConcurrent,
                            },
                        });
                        clearInterval(keepAlive);
                        await new Promise((r) => setTimeout(r, 150));
                        controller.close();
                        return;
                    }
                    
                    if (result?.success && result.blogId) {
                        // Finish this invocation after content persistence. The
                        // browser starts finalize in a fresh Function invocation,
                        // giving image/email work its own Hobby-plan time budget.
                        sendUpdate({
                            status: "COMPLETED",
                            details: {
                                message: "Blog content created. Starting image/email workflow...",
                                workflowStatus: "content_ready",
                                blogId: result.blogId.toString(),
                                generateImage,
                            },
                        });
                    }
                }
                
                // Final close
                clearInterval(keepAlive);
                await new Promise((r) => setTimeout(r, 100));
                controller.close();
            } catch (error) {
                const rawMsg = error.message || "An unexpected error occurred.";
                const isConcurrent = /already processing/i.test(rawMsg);
                const cleanMsg = isConcurrent
                    ? "Another AI article is currently being generated. Please wait for it to complete before starting a new one."
                    : rawMsg;

                sendUpdate({
                    status: isConcurrent ? "BUSY" : "ERROR",
                    details: { message: cleanMsg, isConcurrent },
                });
                clearInterval(keepAlive);
                await new Promise((r) => setTimeout(r, 150));
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

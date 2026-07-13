import { NextResponse } from "next/server";
import { runBlogAutomationPipeline, finalizeBlogPipeline } from "@/lib/blogAutomation";

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
                    const result = await runBlogAutomationPipeline(0, (progress) => {
                        sendUpdate(progress);
                    });

                    if (!result?.success) {
                        sendUpdate({
                            status: "FAILED",
                            details: result?.details || {
                                message: result?.error || "AI blog generation failed.",
                            },
                        });
                        clearInterval(keepAlive);
                        controller.close();
                        return;
                    }
                    
                    if (result?.success && result.blogId) {
                        if (generateImage) {
                            sendUpdate({
                                status: "GENERATING_IMAGE",
                                details: {
                                    message: "Blog content created. Generating its image...",
                                },
                            });

                            const imageResult = await finalizeBlogPipeline(
                                result.blogId,
                                { generateImage: true, baseUrl },
                                (progress) => sendUpdate(progress),
                            );

                            sendUpdate({
                                status: "COMPLETED",
                                details: {
                                    message: imageResult.status === "generated"
                                        ? "Blog content and image created successfully."
                                        : imageResult.emailSent
                                          ? "Blog created; secure upload email sent."
                                          : "Blog created, but image/email workflow needs attention.",
                                    emailSent: !!imageResult.emailSent,
                                    workflowStatus: imageResult.status,
                                },
                            });
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

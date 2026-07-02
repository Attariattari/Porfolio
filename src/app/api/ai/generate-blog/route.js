import { NextResponse } from "next/server";
import { runBlogAutomationPipeline, finalizeBlogPipeline } from "@/lib/blogAutomation";

export const dynamic = "force-dynamic";

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
                    const result = await finalizeBlogPipeline(blogId, { generateImage, baseUrl }, (progress) => {
                        sendUpdate(progress);
                    });
                    sendUpdate({
                        status: "COMPLETED",
                        details: {
                            message: result?.emailSent
                                ? "Secure upload email sent to Super Admin."
                                : result?.status === "generated"
                                    ? "AI image generated and attached."
                                    : "Image workflow finished. Manual upload may be required.",
                            emailSent: !!result?.emailSent,
                            workflowStatus: result?.status,
                        },
                    });
                } else {
                    const result = await runBlogAutomationPipeline(0, (progress) => {
                        sendUpdate(progress);
                    });
                    if (result?.success && result.blogId) {
                        const imageResult = await finalizeBlogPipeline(result.blogId, { generateImage, baseUrl }, (progress) => {
                            sendUpdate(progress);
                        });
                        sendUpdate({
                            status: "COMPLETED",
                            details: {
                                message: imageResult?.emailSent
                                    ? "Blog saved and secure upload email sent to Super Admin."
                                    : imageResult?.status === "generated"
                                        ? "Blog saved with AI image attached."
                                        : "Blog saved. Manual image upload may be required.",
                                emailSent: !!imageResult?.emailSent,
                                workflowStatus: imageResult?.status,
                            },
                        });
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

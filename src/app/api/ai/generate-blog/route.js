import { NextResponse } from "next/server";
import { runBlogAutomationPipeline, finalizeBlogPipeline } from "@/lib/blogAutomation";

export const dynamic = "force-dynamic";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
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
                    await finalizeBlogPipeline(blogId, { generateImage }, (progress) => {
                        sendUpdate(progress);
                    });
                } else {
                    await runBlogAutomationPipeline(0, (progress) => {
                        sendUpdate(progress);
                    }, { stopAtText: true });
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


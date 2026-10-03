import { NextResponse } from "next/server";
import { z } from "zod";
import { generateGeminiResponse } from "@/lib/geminiService";
import { checkRateLimit, getClientIP } from "@/lib/rateLimit";
import { SERVICE_OPTIONS } from "@/lib/constants";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

const RequestSchema = z.object({
  service: z.string().max(120).optional().default("web-development"),
  otherService: z.string().max(200).optional().default(""),
  subject: z.string().max(200).optional().default(""),
  currentNotes: z.string().max(2000).optional().default(""),
});

/**
 * High-quality contextual fallback generator if Gemini is temporarily
 * unavailable, rate-limited, or offline. Ensures 100% zero-error uptime.
 */
function getSmartFallbackTemplate({ serviceTitle, subject }) {
  const cleanSubject = subject?.trim();
  const topic = cleanSubject ? `for ${cleanSubject}` : "for our upcoming project";

  switch (serviceTitle.toLowerCase()) {
    case "ui/ux design":
      return `I am looking for professional UI/UX design ${topic}. We need modern user flows, high-fidelity Figma prototypes, and an intuitive design system. Please let me know your availability for a project discussion.`;
    case "mobile apps":
    case "mobile app development":
      return `I am looking to develop a high-performance, cross-platform mobile application ${topic}. Key requirements include responsive UI, secure authentication, and smooth API integration. Looking forward to discussing our timeline and scope.`;
    case "api & backend":
    case "api-development":
      return `We require robust backend and API development ${topic}. We need scalable database architecture, secure RESTful endpoints, and seamless third-party integrations. Please let me know when we can connect.`;
    case "cloud & devops":
      return `We are seeking cloud architecture and DevOps support ${topic}. Our primary goals are automated CI/CD deployment pipelines, scalable cloud infrastructure, and reliable monitoring. Looking forward to your consultation.`;
    case "seo optimization":
      return `I am looking for advanced SEO optimization and technical performance audit ${topic}. We want to improve organic rankings, Core Web Vitals, and search visibility. Please share your approach and availability.`;
    default:
      return `I am looking to build a modern, high-performance web application ${topic}. We require clean responsive design, secure authentication, database integration, and fast performance. Please let me know your availability to discuss requirements and estimates.`;
  }
}

export async function POST(request) {
  try {
    const clientIP = getClientIP(request);
    const rateLimit = await checkRateLimit(`contact-ai:${clientIP}`, {
      maxRequests: 20,
      windowMs: 10 * 60 * 1000,
    });

    const body = await request.json().catch(() => ({}));
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Invalid request payload." },
        { status: 400 },
      );
    }

    const { service, otherService, subject, currentNotes } = parsed.data;

    // Resolve human-readable service title
    let serviceTitle = "Web Development";
    if (service === "other" && otherService.trim()) {
      serviceTitle = otherService.trim();
    } else {
      const match = SERVICE_OPTIONS.find((s) => s.value === service);
      if (match) serviceTitle = match.label;
    }

    // If rate-limited, gracefully return high-quality smart fallback
    if (!rateLimit.allowed) {
      const fallback = getSmartFallbackTemplate({ serviceTitle, subject });
      return NextResponse.json({
        success: true,
        data: { description: fallback, isFallback: true },
      });
    }

    const prompt = `You are helping a prospective client write a clear, highly professional project inquiry to Muhyo Tech.

Context:
- Selected Service: "${serviceTitle}"
- Project Subject / Topic: "${subject.trim() || "Custom Project Requirement"}"
${currentNotes.trim() ? `- Client rough notes or thoughts: "${currentNotes.trim()}"` : ""}

Task:
Write a polished, 2-to-3 sentence first-person project inquiry message (approx 45 to 80 words) that the client can directly send.

Guidelines:
1. Natural first-person tone ("I am looking to..." or "We need...").
2. Clearly mention the project goals, key expected features/outcomes relevant to the selected service and subject.
3. End with a polite request to discuss requirements, timeline, or consultation.
4. Strictly return plain text only. NO greetings (no "Dear", "Hello"), NO subject lines, NO bullet points, NO quotes, and NO sign-offs.`;

    const generationConfig = {
      temperature: 0.5,
      topP: 0.85,
      maxOutputTokens: 1024,
      systemInstruction:
        "You write concise, elite, first-person project inquiry messages for web development and software engineering clients. Return clean plain text only without quotation marks or greetings.",
    };

    let generatedText = "";
    try {
      generatedText = await generateGeminiResponse(prompt, generationConfig);
    } catch (aiError) {
      console.warn("[Contact AI Description] Gemini failed, using smart fallback:", aiError.message);
      const fallback = getSmartFallbackTemplate({ serviceTitle, subject });
      return NextResponse.json({
        success: true,
        data: { description: fallback, isFallback: true },
      });
    }

    const cleanedDescription = generatedText
      .replace(/^["']|["']$/g, "")
      .replace(/^```(?:text)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .replace(/^(?:subject|description|inquiry):\s*/i, "")
      .trim();

    if (!cleanedDescription || cleanedDescription.length < 25) {
      const fallback = getSmartFallbackTemplate({ serviceTitle, subject });
      return NextResponse.json({
        success: true,
        data: { description: fallback, isFallback: true },
      });
    }

    return NextResponse.json({
      success: true,
      data: { description: cleanedDescription, isFallback: false },
    });
  } catch (error) {
    console.error("[Contact AI Description] Fatal error:", error);
    // Even on fatal server crash, provide safe fallback with HTTP 200
    const fallback =
      "I am looking to develop a custom web application tailored to our business requirements. Please let me know your availability to discuss scope and timelines.";
    return NextResponse.json({
      success: true,
      data: { description: fallback, isFallback: true },
    });
  }
}

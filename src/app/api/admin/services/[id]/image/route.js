import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Service from "@/models/Service";
import { getAuthSession, checkPermission } from "@/lib/auth";
import { checkRateLimit, getClientIP } from "@/lib/rateLimit";
import { ensureServiceImage } from "@/lib/ai/intelligence/services/ensureServiceImage";
import {
  generateServiceImagePrompt,
  isProfessionalServiceImagePromptReady,
} from "@/lib/ai/intelligence/services/generateServiceImagePrompt";
import { sendServiceImagePromptEmail } from "@/lib/server/email/sendServiceImagePromptEmail";
import { createServiceImageUploadLink } from "@/lib/server/serviceImageUploadToken";

function isSuperAdmin(session) {
  return session?.role === "super-admin" || session?.role === "root-super-admin";
}

export async function POST(request, { params }) {
  try {
    const baseUrl = new URL(request.url).origin;
    const ip = getClientIP(request);
    const limit = await checkRateLimit(`admin-service-image:${ip}`, {
      maxRequests: 15,
      windowMs: 60 * 1000,
    });

    if (!limit.allowed) {
      return NextResponse.json(
        { success: false, code: "RATE_LIMITED", message: "Too many requests. Please try again later." },
        { status: 429 },
      );
    }

    const session = await getAuthSession();
    if (!isSuperAdmin(session) && !checkPermission(session, "services", "edit")) {
      return NextResponse.json(
        { success: false, message: "Access Denied: Permission required to manage service images." },
        { status: 403 },
      );
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const action = body.action || "generate_ai";

    await dbConnect();
    // Allow ID lookup by MongoDB _id or by slug
    let service = await Service.findById(id).catch(() => null);
    if (!service) {
      service = await Service.findOne({ slug: id });
    }

    if (!service) {
      return NextResponse.json(
        { success: false, message: `Service with ID/slug '${id}' not found.` },
        { status: 404 },
      );
    }

    // Action 1: Auto AI Image Generation (Pollinations Flux + Cloudinary)
    if (action === "generate_ai" || action === "regenerate") {
      const result = await ensureServiceImage(service, {
        autoGenerate: true,
        baseUrl,
        force: true,
        maxRetries: 1,
      });

      return NextResponse.json({
        success: result.success,
        status: result.status,
        imageUrl: result.imageUrl || service.heroImage || "",
        service: result.service,
        message: result.imageUrl ? "AI service image successfully generated and attached." : result.message,
      });
    }

    // Action 2: Send Image Prompt Email to Super Admin
    if (action === "send_prompt") {
      let imagePrompt = {
        prompt: service.imagePrompt,
        visualDirection: service.imagePromptEnhanced,
        negativePrompt: service.imageNegativePrompt,
        altText: service.heroImageAlt || `${service.title} service cover`,
      };

      if (!isProfessionalServiceImagePromptReady(imagePrompt)) {
        imagePrompt = await generateServiceImagePrompt(service);
        service.imagePrompt = imagePrompt.prompt;
        service.imagePromptEnhanced = imagePrompt.prompt;
        service.imageNegativePrompt = imagePrompt.negativePrompt;
        if (!service.heroImageAlt) service.heroImageAlt = imagePrompt.altText;
        await service.save();
      }

      // Generate secure HMAC-signed upload token for the service image upload page
      let uploadToken = null;
      let expiresAt = null;

      try {
        const tokenResult = await createServiceImageUploadLink({
          service,
          targetEmail:
            body.to ||
            process.env.SUPER_ADMIN_EMAIL ||
            process.env.ROOT_ADMIN_EMAIL ||
            process.env.ADMIN_EMAIL ||
            process.env.SMTP_USER,
        });
        uploadToken = tokenResult?.rawToken || null;
        expiresAt = tokenResult?.link?.expiresAt || null;
      } catch (tokenErr) {
        console.error("[Admin Service Image API] Failed to create upload token link:", tokenErr);
      }

      const emailResult = await sendServiceImagePromptEmail({
        to: body.to,
        service,
        imagePrompt,
        uploadToken,
        expiresAt,
        baseUrl,
      });

      return NextResponse.json({
        success: Boolean(emailResult?.success),
        status: emailResult?.success ? "email_sent" : "email_failed",
        uploadToken: uploadToken || undefined,
        message: emailResult?.success
          ? "Professional service image prompt email sent to Super Admin."
          : (emailResult?.error || emailResult?.message || "Failed to send prompt email."),
      });
    }

    // Action 3: Regenerate Prompt Only (No Image, No Email)
    if (action === "regenerate_prompt") {
      const imagePrompt = await generateServiceImagePrompt(service);
      service.imagePrompt = imagePrompt.prompt;
      service.imagePromptEnhanced = imagePrompt.prompt;
      service.imageNegativePrompt = imagePrompt.negativePrompt;
      if (!service.heroImageAlt) service.heroImageAlt = imagePrompt.altText;
      if (service.imageStatus === "pending") service.imageStatus = "manual_required";
      await service.save();

      return NextResponse.json({
        success: true,
        status: "prompt_regenerated",
        imagePrompt,
        message: "Professional 4K service image prompt regenerated successfully.",
      });
    }

    return NextResponse.json(
      { success: false, message: `Unknown action '${action}'. Supported: 'generate_ai', 'send_prompt', 'regenerate_prompt'` },
      { status: 400 },
    );
  } catch (error) {
    console.error("[Admin Service Image API Error]:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Service image operation failed." },
      { status: 500 },
    );
  }
}

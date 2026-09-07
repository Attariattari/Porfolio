import dbConnect from "@/lib/dbConnect";
import Service from "@/models/Service";
import {
  generateServiceImagePrompt,
  isProfessionalServiceImagePromptReady,
} from "./generateServiceImagePrompt";
import { generateBlogCoverImage } from "@/lib/ai/imageGenerator";
import { sendServiceImagePromptEmail } from "@/lib/server/email/sendServiceImagePromptEmail";
import { createServiceImageUploadLink } from "@/lib/server/serviceImageUploadToken";

export async function ensureServiceImage(serviceOrId, options = {}) {
  const autoGenerate = options.autoGenerate === true;
  const baseUrl = options.baseUrl || "";

  try {
    let service = null;
    let isDbDoc = false;

    if (typeof serviceOrId === "string") {
      await dbConnect();
      service = await Service.findById(serviceOrId);
      isDbDoc = Boolean(service);
    } else if (serviceOrId && typeof serviceOrId === "object") {
      if (serviceOrId._id) {
        await dbConnect();
        service = await Service.findById(serviceOrId._id).catch(() => null);
        if (service) {
          isDbDoc = true;
        } else {
          service = serviceOrId;
        }
      } else {
        service = serviceOrId;
      }
    }

    if (!service) {
      return { success: false, status: "failed", message: "Service not found." };
    }

    // 1. If service already has an image and force regeneration is not requested
    if (!options.force && (service.heroImage || service.banner || service.image)) {
      return {
        success: true,
        status: "already_has_image",
        imageUrl: service.heroImage || service.banner || service.image,
        service,
      };
    }

    // 2. Ensure Professional 4K Image Prompt is ready
    let imagePrompt = {
      prompt: service.imagePrompt || service.image_prompt,
      visualDirection: service.imagePromptEnhanced || "",
      negativePrompt: service.imageNegativePrompt || "",
      altText: service.heroImageAlt || `${service.title} service cover`,
    };

    if (!isProfessionalServiceImagePromptReady(imagePrompt) || options.regeneratePrompt) {
      imagePrompt = await generateServiceImagePrompt(service, {
        useAI: true,
      });

      service.imagePrompt = imagePrompt.prompt;
      service.imagePromptEnhanced = imagePrompt.visualDirection;
      service.imageNegativePrompt = imagePrompt.negativePrompt;
      if (!service.heroImageAlt) {
        service.heroImageAlt = imagePrompt.altText;
      }

      if (isDbDoc) {
        await service.save();
      }
    }

    // 3. Mode A: AI Auto Image Generation
    if (autoGenerate) {
      service.imageStatus = "generating";
      if (isDbDoc) await service.save();

      try {
        const imageResult = await generateBlogCoverImage(imagePrompt.prompt, {
          maxRetries: Number(options.maxRetries || 1),
          timeoutMs: Number(options.timeoutMs || 14000),
          retryDelayMs: 1000,
        });

        if (imageResult?.url) {
          service.heroImage = imageResult.url;
          service.banner = imageResult.url;
          service.image = imageResult.url;
          service.heroImageAlt = service.heroImageAlt || imagePrompt.altText;
          service.imageGenerated = true;
          service.imageStatus = "generated";

          if (isDbDoc) {
            await service.save();
          }

          return {
            success: true,
            status: "generated",
            imageUrl: imageResult.url,
            imagePrompt,
            service,
          };
        }
      } catch (genError) {
        console.warn("[ensureServiceImage] AI generation failed, falling back to email prompt:", genError.message);
      }
    }

    // 4. Mode B: Manual Prompt Email Notification
    service.imageStatus = "manual_required";
    if (isDbDoc) {
      await service.save();
    }

    let emailSent = false;
    try {
      let uploadToken = null;
      let expiresAt = null;

      if (isDbDoc && service._id) {
        const tokenResult = await createServiceImageUploadLink({
          service,
          targetEmail:
            options.to ||
            process.env.SUPER_ADMIN_EMAIL ||
            process.env.ROOT_ADMIN_EMAIL ||
            process.env.ADMIN_EMAIL ||
            process.env.SMTP_USER,
        }).catch(() => null);

        uploadToken = tokenResult?.rawToken || null;
        expiresAt = tokenResult?.link?.expiresAt || null;
      }

      const emailResult = await sendServiceImagePromptEmail({
        to: options.to,
        service,
        imagePrompt,
        uploadToken,
        expiresAt,
        baseUrl,
      });
      emailSent = Boolean(emailResult?.success);
    } catch (emailErr) {
      console.warn("[ensureServiceImage] Could not send prompt email:", emailErr.message);
    }

    return {
      success: true,
      status: "manual_required",
      emailSent,
      imagePrompt,
      service,
      message: emailSent
        ? "Professional service image prompt emailed to Super Admin."
        : "Professional service image prompt ready. Email could not be sent.",
    };
  } catch (error) {
    console.error("[ensureServiceImage] Critical failure:", error.message);
    return {
      success: false,
      status: "failed",
      error: error.message || "Failed to process service image.",
    };
  }
}

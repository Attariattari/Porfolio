import { generateBlogCoverImage } from "@/lib/ai/imageGenerator";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function generateBlogImage({
  prompt,
  negativePrompt = "",
  maxRetries = 1,
  providerTimeoutMs = 12000,
  blog = null,
  visualDirection = "",
}) {
  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      const result = await generateBlogCoverImage(prompt, {
        negativePrompt,
        maxRetries: 1,
        timeoutMs: providerTimeoutMs,
        retryDelayMs: 1000,
        blog,
        visualDirection,
        auditQuality: true,
      });

      if (result?.url) {
        return {
          success: true,
          attempts: attempt,
          image: {
            url: result.url,
            publicId: result.publicId,
          },
          audit: result.audit,
        };
      }
    } catch (error) {
      console.warn(`[BlogImage] Provider failed on attempt ${attempt}:`, error?.message || error);
    }

    if (attempt < maxRetries) await sleep(1000);
  }

  return {
    success: false,
    attempts: maxRetries,
    error: "AI image provider unavailable after retry.",
  };
}

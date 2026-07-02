import { generateBlogCoverImage } from "@/lib/ai/imageGenerator";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function generateBlogImage({
  prompt,
  negativePrompt = "",
  maxRetries = 1,
  providerTimeoutMs = 12000,
}) {
  const safePrompt = [prompt, negativePrompt ? `Avoid: ${negativePrompt}` : ""]
    .filter(Boolean)
    .join("\n");

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      const result = await generateBlogCoverImage(safePrompt, {
        maxRetries: 1,
        timeoutMs: providerTimeoutMs,
        retryDelayMs: 1000,
      });
      if (result?.url) {
        return {
          success: true,
          attempts: attempt,
          image: {
            url: result.url,
            publicId: result.publicId,
          },
        };
      }
    } catch (error) {
      console.warn(`[BlogImage] Provider failed on attempt ${attempt}.`);
    }

    if (attempt < maxRetries) await sleep(1000);
  }

  return {
    success: false,
    attempts: maxRetries,
    error: "AI image provider unavailable after retry.",
  };
}

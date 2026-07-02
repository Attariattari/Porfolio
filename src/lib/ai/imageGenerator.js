/**
 * AI Blog Cover Image Generator
 * Uses Pollinations.ai free API (flux model) to generate cover images
 * Handles rate-limiting detection and retries with different seeds
 * Uploads generated images to Cloudinary using signed server-side upload
 */

import crypto from "crypto";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Generate a blog cover image from a concept/prompt
 * @param {string} imageConcept - The image concept/prompt from Gemini
 * @returns {Promise<{url: string, publicId: string} | null>} - Image URL and publicId, or null if all retries fail
 */
export async function generateBlogCoverImage(imageConcept, options = {}) {
  if (!imageConcept) {
    console.error("[ImageGen] No image concept provided");
    return null;
  }

  const MAX_RETRIES = Number(options.maxRetries || 1);
  const RETRY_DELAY = Number(options.retryDelayMs || 1000);
  const TIMEOUT_MS = Number(options.timeoutMs || 12000);
  const MIN_VALID_IMAGE_SIZE = 50000; // 50KB - tiny responses are usually placeholders/errors

  // Enhance the prompt with quality keywords
  const enhancedPrompt = `${imageConcept}. professional photography, high quality, detailed, 4k, clean composition`;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`[ImageGen] Attempt ${attempt}/${MAX_RETRIES}: Generating image from Pollinations...`);

      const uniqueSeed = Math.floor(Math.random() * 1000000);
      const encodedPrompt = encodeURIComponent(enhancedPrompt);

      // Call Pollinations.ai flux model — correct endpoint: image.pollinations.ai/prompt/
      const pollUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?model=flux&nologo=true&width=1200&height=630&seed=${uniqueSeed}`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
      let response;
      try {
        response = await fetch(pollUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'Muhyo-Tech-Blog-Pipeline',
          },
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeout);
      }

      if (!response.ok) {
        console.warn(`[ImageGen] Pollinations returned ${response.status}, retrying...`);
        if (attempt < MAX_RETRIES) {
          await sleep(RETRY_DELAY);
        }
        continue;
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const bufferSize = buffer.length;

      console.log(`[ImageGen] Received image: ${(bufferSize / 1024 / 1024).toFixed(2)}MB`);

      // Check if this is a placeholder/error response.
      if (bufferSize < MIN_VALID_IMAGE_SIZE) {
        console.warn(
          `[ImageGen] Detected tiny placeholder response (${(bufferSize / 1024).toFixed(1)}KB). Retrying with new seed...`
        );
        if (attempt < MAX_RETRIES) {
          await sleep(RETRY_DELAY);
        }
        continue;
      }

      // Upload to Cloudinary using signed server-side upload
      console.log("[ImageGen] Uploading to Cloudinary...");
      const result = await uploadImageBufferToCloudinary(buffer, "blog-cover");

      if (result && result.url) {
        console.log(`[ImageGen] ✅ Successfully generated and uploaded cover image: ${result.url}`);
        return {
          url: result.url,
          publicId: result.publicId,
        };
      }

      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY);
      }
    } catch (error) {
      console.error(`[ImageGen] Attempt ${attempt} failed:`, error.message);
      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY);
      }
    }
  }

  console.error("[ImageGen] All retry attempts exhausted. Returning null for fallback.");
  return null;
}

/**
 * Upload image buffer to Cloudinary using signed server-side upload.
 * Unsigned presets do not allow folder overrides — we must sign the request
 * with CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET for server-side cron use.
 * @param {Buffer} imageBuffer - Image data as buffer
 * @param {string} filename - Filename for the upload
 * @returns {Promise<{url: string, publicId: string} | null>}
 */
async function uploadImageBufferToCloudinary(imageBuffer, filename = "blog-cover") {
  try {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey    = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error(
        "Cloudinary env vars missing: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, or CLOUDINARY_API_SECRET"
      );
    }

    const folder    = "Muhyo-Tech/blog/ai-generated";
    const timestamp = Math.floor(Date.now() / 1000).toString();

    // Build the signature string (params must be alphabetically sorted)
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
    const signature = crypto
      .createHash("sha256")
      .update(paramsToSign + apiSecret)
      .digest("hex");

    // Build FormData with the signed parameters
    const formData = new FormData();
    const blob = new Blob([imageBuffer], { type: "image/jpeg" });
    formData.append("file", blob, `${filename}.jpg`);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp);
    formData.append("folder", folder);
    formData.append("signature", signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Cloudinary upload failed (${response.status}): ${errorData.error?.message || JSON.stringify(errorData)}`
      );
    }

    const data = await response.json();

    if (!data.secure_url) {
      throw new Error("No secure_url in Cloudinary response");
    }

    console.log(`[ImageGen] Cloudinary upload successful: ${data.secure_url}`);

    return {
      url: data.secure_url,
      publicId: data.public_id,
    };
  } catch (error) {
    console.error("[ImageGen] Cloudinary upload error:", error.message);
    return null;
  }
}

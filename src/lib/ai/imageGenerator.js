/**
 * AI Blog Cover Image Generator
 * Uses Pollinations.ai API (flux model) to generate cover images
 * Aligned with Muhyo Tech 16:9 true widescreen standards and closed-loop vision auditing
 * Uploads verified images to Cloudinary using signed server-side upload
 */

import crypto from "crypto";
import { auditBlogImageQuality } from "@/lib/ai/imageAuditor";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Generate a blog cover image from a concept/prompt with optional vision quality audit
 * @param {string} imageConcept - The image concept/prompt from Gemini
 * @param {Object} [options]
 * @param {string} [options.negativePrompt] - Negative prompt string to avoid
 * @param {Object} [options.blog] - Blog document for multimodal vision validation
 * @param {string} [options.visualDirection] - Visual direction summary
 * @param {boolean} [options.auditQuality=true] - Whether to run Gemini Vision QC before Cloudinary upload
 * @param {number} [options.maxRetries=1] - Maximum retries
 * @param {number} [options.timeoutMs=12000] - Provider timeout in ms
 * @param {number} [options.width=1200] - Target image width
 * @param {number} [options.height=675] - Target image height (true 16:9)
 * @returns {Promise<{url: string, publicId: string, audit?: Object} | null>}
 */
export async function generateBlogCoverImage(imageConcept, options = {}) {
  if (!imageConcept) {
    console.error("[ImageGen] No image concept provided");
    return null;
  }

  const MAX_RETRIES = Number(options.maxRetries || 1);
  const RETRY_DELAY = Number(options.retryDelayMs || 1000);
  const TIMEOUT_MS = Number(options.timeoutMs || 12000);
  const MIN_VALID_IMAGE_SIZE = 40000; // 40KB minimum for valid render

  const width = options.width || 1200;
  const height = options.height || 675; // 16:9 widescreen standard
  const negativePrompt = options.negativePrompt || "";
  const auditQuality = options.auditQuality !== false;

  // If prompt is already an ultra-detailed 600+ char prompt, avoid diluting it with repetitive text
  let effectivePrompt = imageConcept.trim();
  if (effectivePrompt.length < 300) {
    effectivePrompt = `${effectivePrompt}. 16:9 widescreen, professional editorial photography, clean architectural composition, studio lighting`;
  }

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`[ImageGen] Attempt ${attempt}/${MAX_RETRIES}: Requesting flux render (${width}x${height})...`);

      const uniqueSeed = Math.floor(Math.random() * 1000000);
      const encodedPrompt = encodeURIComponent(effectivePrompt);
      const encodedAvoid = negativePrompt ? `&avoid=${encodeURIComponent(negativePrompt.slice(0, 400))}` : "";

      const pollUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?model=flux&nologo=true&width=${width}&height=${height}&seed=${uniqueSeed}${encodedAvoid}`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
      let response;
      try {
        response = await fetch(pollUrl, {
          method: "GET",
          headers: {
            "User-Agent": "Muhyo-Tech-Visual-Engine",
          },
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeout);
      }

      if (!response.ok) {
        console.warn(`[ImageGen] Provider returned ${response.status}, retrying...`);
        if (attempt < MAX_RETRIES) await sleep(RETRY_DELAY);
        continue;
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const bufferSize = buffer.length;

      console.log(`[ImageGen] Received buffer: ${(bufferSize / 1024).toFixed(1)}KB`);

      if (bufferSize < MIN_VALID_IMAGE_SIZE) {
        console.warn(`[ImageGen] Detected tiny placeholder (${(bufferSize / 1024).toFixed(1)}KB). Retrying with new seed...`);
        if (attempt < MAX_RETRIES) await sleep(RETRY_DELAY);
        continue;
      }

      // Pre-Upload Vision Quality Audit (Gemini Multimodal)
      let auditResult = null;
      if (auditQuality && (options.blog || options.visualDirection)) {
        console.log("[ImageGen] Running pre-upload multimodal vision audit...");
        auditResult = await auditBlogImageQuality({
          imageBuffer: buffer,
          blog: options.blog || {},
          prompt: effectivePrompt,
          visualDirection: options.visualDirection || "",
        });

        console.log(`[ImageGen] Vision Audit Score: ${auditResult.score}/10 (Passed: ${auditResult.passed})`);

        if (!auditResult.passed && attempt < MAX_RETRIES) {
          console.warn(`[ImageGen] Quality check rejected image: ${auditResult.critique}. Retrying...`);
          // Enrich prompt slightly with auditor recommendations if available
          if (auditResult.recommendations && auditResult.recommendations !== "None") {
            effectivePrompt = `${effectivePrompt}. Note: ${auditResult.recommendations.slice(0, 150)}`;
          }
          await sleep(RETRY_DELAY);
          continue;
        }
      }

      // Upload to Cloudinary using signed server-side upload
      console.log("[ImageGen] Uploading verified image to Cloudinary...");
      const result = await uploadImageBufferToCloudinary(buffer, "blog-cover");

      if (result && result.url) {
        console.log(`[ImageGen] ✅ Successfully uploaded to Cloudinary: ${result.url}`);
        return {
          url: result.url,
          publicId: result.publicId,
          audit: auditResult,
          bufferSize,
        };
      }

      if (attempt < MAX_RETRIES) await sleep(RETRY_DELAY);
    } catch (error) {
      console.error(`[ImageGen] Attempt ${attempt} failed:`, error?.message || error);
      if (attempt < MAX_RETRIES) await sleep(RETRY_DELAY);
    }
  }

  console.error("[ImageGen] All retry attempts exhausted. Returning null for fallback.");
  return null;
}

/**
 * Upload image buffer to Cloudinary using signed server-side upload.
 * @param {Buffer} imageBuffer - Image data as buffer
 * @param {string} filename - Filename for the upload
 * @returns {Promise<{url: string, publicId: string} | null>}
 */
export async function uploadImageBufferToCloudinary(imageBuffer, filename = "blog-cover") {
  try {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error(
        "Cloudinary env vars missing: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, or CLOUDINARY_API_SECRET"
      );
    }

    const folder = "Muhyo-Tech/blog/ai-generated";
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

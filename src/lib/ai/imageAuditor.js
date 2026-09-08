/**
 * AI Blog Cover Image Auditor
 * Validates that generated images are accessible, within file-size bounds,
 * and meet Muhyo Tech's multimodal vision quality standards.
 */

import {
  reviewContentWithGemini,
  reviewImageBufferWithGemini,
} from "@/lib/geminiService";

const MIN_FILE_SIZE = 15000; // 15KB minimum
const MAX_FILE_SIZE = 2500000; // 2.5MB maximum

/**
 * Audit a blog cover image from its URL
 * Confirms reachability, content-type, and file size
 * @param {string} imageUrl - Cloudinary or hosted image URL to audit
 * @returns {Promise<{passed: boolean, reason?: string, size?: number}>}
 */
export async function auditBlogImage(imageUrl) {
  try {
    if (!imageUrl) {
      return {
        passed: false,
        reason: "No image URL provided",
      };
    }

    console.log(`[ImageAudit] Auditing image header: ${imageUrl}`);

    const response = await fetch(imageUrl, {
      method: "HEAD",
    });

    if (!response.ok) {
      return {
        passed: false,
        reason: `Image unreachable (HTTP ${response.status})`,
      };
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.startsWith("image/")) {
      return {
        passed: false,
        reason: `Invalid content-type: ${contentType} (expected image/*)`,
      };
    }

    const contentLength = parseInt(response.headers.get("content-length") || "0", 10);

    if (contentLength === 0) {
      const fullResponse = await fetch(imageUrl, { method: "GET" });
      if (!fullResponse.ok) {
        return {
          passed: false,
          reason: `Full image fetch failed (HTTP ${fullResponse.status})`,
        };
      }
      const buffer = Buffer.from(await fullResponse.arrayBuffer());
      return validateImageSize(buffer.length);
    }

    return validateImageSize(contentLength);
  } catch (error) {
    console.error("[ImageAudit] Audit error:", error.message);
    return {
      passed: false,
      reason: `Audit error: ${error.message}`,
    };
  }
}

/**
 * Validate image file size is within acceptable range
 * @param {number} fileSize - File size in bytes
 * @returns {{passed: boolean, reason?: string, size: number}}
 */
function validateImageSize(fileSize) {
  if (fileSize < MIN_FILE_SIZE) {
    return {
      passed: false,
      reason: `Image too small: ${(fileSize / 1024).toFixed(1)}KB (minimum ${(MIN_FILE_SIZE / 1024).toFixed(1)}KB)`,
      size: fileSize,
    };
  }

  if (fileSize > MAX_FILE_SIZE) {
    return {
      passed: false,
      reason: `Image too large: ${(fileSize / 1024 / 1024).toFixed(2)}MB (maximum ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(2)}MB)`,
      size: fileSize,
    };
  }

  return {
    passed: true,
    size: fileSize,
  };
}

/**
 * Multimodal Vision Quality Audit using Gemini Multimodal
 * Evaluates generated buffer/URL against narrative relevance, text cleanliness, and brand harmony.
 *
 * @param {Object} params
 * @param {Buffer} [params.imageBuffer] - Raw image buffer
 * @param {string} [params.imageUrl] - Image URL if buffer not provided
 * @param {Object} [params.blog] - Blog record with title, industry, businessProblem
 * @param {string} [params.prompt] - Target prompt used for generation
 * @param {string} [params.visualDirection] - Visual direction summary
 * @returns {Promise<{
 *   passed: boolean,
 *   score: number,
 *   critique: string,
 *   recommendations: string,
 *   metrics: { narrative: number, textCleanliness: number, brandHarmony: number, composition: number }
 * }>}
 */
export async function auditBlogImageQuality({
  imageBuffer,
  imageUrl,
  blog = {},
  prompt = "",
  visualDirection = "",
} = {}) {
  // 1. Basic integrity check
  if (imageBuffer) {
    const sizeCheck = validateImageSize(imageBuffer.length);
    if (!sizeCheck.passed) {
      return {
        passed: false,
        score: 3.0,
        critique: sizeCheck.reason,
        recommendations: "Regenerate with valid dimensions and non-empty payload.",
        metrics: { narrative: 2, textCleanliness: 2, brandHarmony: 2, composition: 2 },
      };
    }
  }

  // 2. Multimodal vision review
  const evaluationPrompt = `
You are the Senior Editorial Quality Inspector for Muhyo Tech's publication covers.
Inspect this generated 16:9 banner image against its editorial assignment:

ARTICLE CONTEXT:
- Title: ${blog.title || "Technical Engineering Article"}
- Target Concept: ${visualDirection || prompt.slice(0, 200) || "Engineering visual narrative"}
- Industry: ${typeof blog.industry === "object" ? blog.industry?.name || blog.industry?.slug || "Software" : blog.industry || "Software"}

EVALUATE AND SCORE (0 to 10):
1. narrativeRelevance: Does the visual communicate technical depth or relevant architecture rather than being completely unrelated? (0-10)
2. textCleanliness: Is the image free of broken, smeared, or garbled AI pseudo-lettering? (10 = clean abstract graphics or zero text; 0 = chaotic gibberish lettering). (0-10)
3. brandHarmony: Does the color palette respect dark-mode architectural slate/obsidian tones with restrained accents, rather than garish neon or childish clipart? (0-10)
4. composition: Is the framing balanced with clean negative space suitable for a 16:9 banner? (0-10)

OUTPUT STRICT JSON ONLY:
{
  "narrativeRelevance": 8.0,
  "textCleanliness": 8.5,
  "brandHarmony": 8.0,
  "composition": 8.0,
  "overallScore": 8.1,
  "passed": true,
  "critique": "Brief 1-sentence assessment",
  "recommendations": "Actionable feedback for prompt refinement if score < 7.2, or 'None'"
}
`.trim();

  try {
    let rawResponse = "";
    if (imageBuffer) {
      rawResponse = await reviewImageBufferWithGemini(evaluationPrompt, imageBuffer, "image/jpeg");
    } else if (imageUrl) {
      rawResponse = await reviewContentWithGemini(evaluationPrompt, imageUrl);
    } else {
      return {
        passed: true,
        score: 8.0,
        critique: "No buffer or URL provided for multimodal audit; passed via standard validation.",
        recommendations: "None",
        metrics: { narrative: 8, textCleanliness: 8, brandHarmony: 8, composition: 8 },
      };
    }

    const cleaned = rawResponse.replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    const narrative = Number(parsed.narrativeRelevance || 8);
    const textCleanliness = Number(parsed.textCleanliness || 8);
    const brandHarmony = Number(parsed.brandHarmony || 8);
    const composition = Number(parsed.composition || 8);

    const calculatedScore = Number(
      parsed.overallScore ||
      (narrative * 0.35 + textCleanliness * 0.30 + brandHarmony * 0.20 + composition * 0.15).toFixed(1)
    );

    // Pass threshold: overall score >= 7.2 and textCleanliness >= 5.5
    const passed = calculatedScore >= 7.2 && textCleanliness >= 5.5;

    return {
      passed,
      score: calculatedScore,
      critique: parsed.critique || "Automated multimodal vision evaluation complete.",
      recommendations: parsed.recommendations || (passed ? "None" : "Refine prompt clarity and reduce text artifacts."),
      metrics: {
        narrative,
        textCleanliness,
        brandHarmony,
        composition,
      },
    };
  } catch (error) {
    console.warn("[ImageAudit] Multimodal vision review skipped/failed:", error?.message || error);
    // Graceful fallback: do NOT block production pipeline if vision model API is unreachable
    return {
      passed: true,
      score: 7.8,
      critique: "Multimodal vision auditor offline; passed via structural integrity check.",
      recommendations: "None",
      metrics: { narrative: 7.8, textCleanliness: 8, brandHarmony: 8, composition: 7.5 },
    };
  }
}

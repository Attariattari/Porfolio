/**
 * AI Blog Cover Image Auditor
 * Validates that generated images are accessible and meet quality standards
 */

const MIN_FILE_SIZE = 15000; // 15KB minimum
const MAX_FILE_SIZE = 2000000; // 2MB maximum

/**
 * Audit a blog cover image from its URL
 * Confirms reachability, content-type, and file size
 * @param {string} imageUrl - Cloudinary image URL to audit
 * @returns {Promise<{passed: boolean, reason?: string}>}
 */
export async function auditBlogImage(imageUrl) {
  try {
    if (!imageUrl) {
      return {
        passed: false,
        reason: "No image URL provided",
      };
    }

    console.log(`[ImageAudit] Auditing image: ${imageUrl}`);

    // Fetch image to check headers and size
    const response = await fetch(imageUrl, {
      method: "HEAD",
    });

    // Check if request was successful
    if (!response.ok) {
      return {
        passed: false,
        reason: `Image unreachable (HTTP ${response.status})`,
      };
    }

    // Check content-type
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.startsWith("image/")) {
      return {
        passed: false,
        reason: `Invalid content-type: ${contentType} (expected image/*)`,
      };
    }

    // Check file size via Content-Length header
    const contentLength = parseInt(response.headers.get("content-length") || "0", 10);

    if (contentLength === 0) {
      // Fallback: fetch full image if Content-Length not available
      console.log("[ImageAudit] Content-Length not available in HEAD response, fetching full image...");
      const fullResponse = await fetch(imageUrl, {
        method: "GET",
      });

      if (!fullResponse.ok) {
        return {
          passed: false,
          reason: `Full image fetch failed (HTTP ${fullResponse.ok})`,
        };
      }

      const arrayBuffer = await fullResponse.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const actualSize = buffer.length;

      return validateImageSize(actualSize);
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
 * @returns {{passed: boolean, reason?: string}}
 */
function validateImageSize(fileSize) {
  if (fileSize < MIN_FILE_SIZE) {
    return {
      passed: false,
      reason: `Image too small: ${(fileSize / 1024).toFixed(1)}KB (minimum ${(MIN_FILE_SIZE / 1024).toFixed(1)}KB)`,
    };
  }

  if (fileSize > MAX_FILE_SIZE) {
    return {
      passed: false,
      reason: `Image too large: ${(fileSize / 1024 / 1024).toFixed(2)}MB (maximum ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(2)}MB)`,
    };
  }

  console.log(`[ImageAudit] ✅ Image passed audit (${(fileSize / 1024).toFixed(1)}KB)`);
  return {
    passed: true,
  };
}

import { generateGeminiResponse } from "@/lib/geminiService";

const FALLBACK_NEGATIVE_PROMPT =
  "No fake logos, no watermarks, no fake brand names, no gibberish text, no unreadable labels, no copyrighted characters, no misleading claims, no cluttered UI, no neon cyberpunk, no obvious AI-art cliches.";

export function isProfessionalImagePromptReady(imagePrompt = {}) {
  const prompt = String(imagePrompt.prompt || "").trim();
  const visualDirection = String(imagePrompt.visualDirection || "").trim();
  const hasProfessionalDetail =
    /(composition|foreground|background|lighting|camera|editorial|cover|aspect ratio|16:9|style|palette|depth)/i.test(
      prompt,
    );

  return prompt.length >= 650 && visualDirection.length >= 80 && hasProfessionalDetail;
}

function excerptHtml(value = "", maxLength = 1800) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export async function generateBlogImagePrompt(blog, options = {}) {
  const contentExcerpt = excerptHtml(blog.content || "");

  const fallback = {
    prompt: `Create a premium 16:9 technical editorial blog cover image for a Muhyo Tech article titled "${blog.title}". Communicate the article's core idea through a realistic software-engineering visual narrative, not generic stock imagery. Use believable web-development and product-delivery artifacts: architecture cards, deployment pipelines, monitoring dashboards, server/product details, data-flow paths, or before/after workflow states when relevant. Short readable UI labels or status cards are allowed if they clarify the story; avoid fake logos, gibberish, watermarks, and long text. Composition: strong central focal point, balanced foreground/background depth, clean negative space for a blog header crop, attractive social-preview readability. Lighting: realistic professional product or office lighting with crisp detail and trustworthy contrast. Palette: deep navy, slate, emerald, cyan accents, and restrained warm highlights. Style: premium realistic technical/product publication cover, sharp, modern, grounded, high-resolution, suitable for a professional software agency blog. Avoid neon cyberpunk, floating code clouds, plastic AI gloss, clutter, cartoons, random robots, and template-like scenes.`,
    altText: `${blog.title} blog cover image`,
    visualDirection:
      "Premium 16:9 technical editorial cover with realistic software-engineering artifacts, clear problem-to-outcome narrative, and clean blog/social crop space.",
    negativePrompt: FALLBACK_NEGATIVE_PROMPT,
  };

  // The manual-email path already follows a full AI content-generation run.
  // Use the deterministic production-ready prompt there so SMTP gets a fresh,
  // predictable time budget instead of spending another Gemini request.
  if (options.useAI === false) {
    return fallback;
  }

  try {
    const response = await generateGeminiResponse(
      `
      Create a FULL professional image-generation prompt for a Muhyo Tech blog cover.

      BLOG:
      Title: ${blog.title}
      Summary: ${blog.summary || ""}
      Category: ${blog.category || "Technology"}
      Tags: ${Array.isArray(blog.tags) ? blog.tags.join(", ") : ""}
      Keywords: ${Array.isArray(blog.keywords) ? blog.keywords.join(", ") : ""}
      Content Excerpt: ${contentExcerpt}

      BRAND STYLE:
      Muhyo Tech, web development, software engineering, digital services, portfolio/business websites.

      REQUIREMENTS:
      - The prompt must be production-ready for an AI image generator.
      - Prompt length: 850-1300 characters.
      - Include aspect ratio 16:9.
      - Include subject, composition, foreground/background, technical artifacts, mood, lighting, depth, palette, style, and quality.
      - Make it specific to this exact blog topic and content excerpt.
      - Clean SaaS/web development feel, premium software-engineering/product publication style.
      - Suitable for a blog featured image and social preview crop.
      - Prefer realistic technical storytelling: architecture cards, dashboard panels, data-flow paths, pipeline stages, product screens, servers, devices, or before/after transformation scenes when relevant.
      - Short readable labels/status cards are allowed only when they clarify the technical story.
      - No random robots unless directly relevant
      - No fake logos, no gibberish, no watermarks, no text-heavy design, no copyrighted characters
      - Do not include instructions to add large title text inside the image.
      - Avoid neon cyberpunk, floating code clouds, fantasy holograms, plastic AI gloss, and generic stock-photo scenes.

      OUTPUT STRICT JSON:
      {
        "prompt": "Full production-ready image generation prompt, 850-1300 characters",
        "altText": "Short descriptive alt text",
        "visualDirection": "Specific art direction, 120-220 characters",
        "negativePrompt": "Detailed negative prompt"
      }
      `,
      {
        temperature: 0.45,
        responseMimeType: "application/json",
      },
    );

    const parsed = JSON.parse(
      response.replace(/```json/gi, "").replace(/```/g, "").trim(),
    );

    const normalized = {
      prompt: parsed.prompt || fallback.prompt,
      altText: parsed.altText || fallback.altText,
      visualDirection: parsed.visualDirection || fallback.visualDirection,
      negativePrompt: parsed.negativePrompt || FALLBACK_NEGATIVE_PROMPT,
    };

    if (!isProfessionalImagePromptReady(normalized)) {
      return fallback;
    }

    return normalized;
  } catch (error) {
    console.warn("[BlogImagePrompt] Falling back to deterministic prompt.");
    return fallback;
  }
}

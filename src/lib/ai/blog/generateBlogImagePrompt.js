import { generateGeminiResponse } from "@/lib/geminiService";

const FALLBACK_NEGATIVE_PROMPT =
  "No text, no logos, no watermarks, no fake screenshots, no copyrighted characters, no misleading claims, no cluttered UI.";

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

export async function generateBlogImagePrompt(blog) {
  const contentExcerpt = excerptHtml(blog.content || "");

  const fallback = {
    prompt: `Create a premium 16:9 editorial blog cover image for a Muhyo Tech article titled "${blog.title}". The image should communicate the article's core idea through a professional web-development visual narrative, not generic stock imagery. Use a clean SaaS/software-engineering environment with layered interface panels, architecture diagrams, code-inspired details, deployment or data-flow elements when relevant, and a polished founder-led technology publication feel. Composition: strong central focal point, balanced foreground and background depth, clear negative space for a blog header crop, no visible text inside the image. Lighting: soft cinematic key light with subtle contrast, crisp highlights, realistic shadows, high-end digital editorial finish. Palette: deep navy, slate, emerald, cyan accents, and restrained warm highlights. Style: premium realistic digital illustration or refined photoreal editorial render, sharp, clean, modern, trustworthy, high-resolution, suitable for a professional software agency blog. Avoid logos, fake screenshots, text labels, watermarks, clutter, cartoons, random robots, and anything that looks like a template.`,
    altText: `${blog.title} blog cover image`,
    visualDirection:
      "Premium 16:9 SaaS editorial cover with a clear software-engineering narrative, layered UI/architecture elements, cinematic lighting, and clean negative space for blog use.",
    negativePrompt: FALLBACK_NEGATIVE_PROMPT,
  };

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
      - Include subject, composition, foreground/background, mood, lighting, depth, palette, style, and quality.
      - Make it specific to this exact blog topic and content excerpt.
      - Clean SaaS/web development feel, premium software-engineering publication style.
      - Suitable for a blog featured image and social preview crop.
      - No random robots unless directly relevant
      - No fake screenshots, no text-heavy design, no logos, no copyrighted characters
      - Do not include instructions to add title text inside the image.

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

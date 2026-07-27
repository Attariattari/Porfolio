import { generateGeminiResponse } from "@/lib/geminiService";
import { ensureBlogImageAlt } from "@/lib/blogImageAlt";
import { Blog } from "@/models/Portfolio";

const FALLBACK_NEGATIVE_PROMPT =
  "No fake logos, no watermarks, no fake brand names, no gibberish text, no unreadable labels, no copyrighted characters, no misleading claims, no cluttered UI, no neon cyberpunk, no obvious AI-art cliches, no generic blue dashboard template, no repeated office background.";

const VISUAL_PALETTES = [
  "warm ivory, terracotta, deep ink, and restrained brass accents",
  "forest green, sandstone, copper, and soft cream",
  "cobalt blue, ice white, coral, and graphite",
  "aubergine, muted lavender, antique gold, and charcoal",
  "charcoal, mineral silver, lime leaf, and off-white",
  "deep teal, warm cream, rust orange, and slate",
  "burgundy, dusty blush, graphite, and parchment",
  "indigo, amber, pale mist, and dark walnut",
  "olive, clay, soft sky blue, and bone white",
  "matte black, clean white, electric orange, and steel gray",
  "ocean blue, seafoam, warm yellow, and navy",
  "plum, mint, peach, and midnight gray",
];

const BACKGROUND_DIRECTIONS = [
  "a daylight architecture studio with physical system cards arranged on a large table",
  "a believable server operations room with layered infrastructure depth",
  "a minimal product strategy wall with pinned flows, devices, and real material texture",
  "a close technical workbench with hardware, diagrams, and one precise focal artifact",
  "a bright collaborative design lab viewed from an elevated three-quarter angle",
  "a dark but natural control room lit by practical screens and warm task lighting",
  "a clean modular tabletop landscape representing connected product stages",
  "an outdoor-to-indoor transition metaphor using real architectural spaces and devices",
  "a focused debugging desk shot from overhead with restrained, believable artifacts",
  "a spacious industrial studio with projected data paths and tangible workflow objects",
  "a customer-facing product environment showing the real business outcome in context",
  "a macro close-up of one system bottleneck surrounded by subtle contextual layers",
];

function stableHash(value = "") {
  return [...String(value)].reduce((hash, character) => ((hash * 31) + character.charCodeAt(0)) >>> 0, 2166136261);
}

function getVisualIdentity(blog = {}, recentDirections = []) {
  const clusterSeed = stableHash(blog.clusterKey || blog.category || "muhyo-tech");
  const articleSeed = stableHash(`${blog.slug || blog.title}:${blog.clusterOrder || 0}`);
  const recentText = recentDirections.join(" ").toLowerCase();
  const paletteStart = (clusterSeed + Number(blog.clusterOrder || 0) * 3 + articleSeed) % VISUAL_PALETTES.length;
  const backgroundStart = (clusterSeed * 3 + Number(blog.clusterOrder || 0) * 5 + articleSeed) % BACKGROUND_DIRECTIONS.length;
  const paletteIndex = Array.from(
    { length: VISUAL_PALETTES.length },
    (_, offset) => (paletteStart + offset) % VISUAL_PALETTES.length,
  ).find((index) => !recentText.includes(VISUAL_PALETTES[index].toLowerCase())) ?? paletteStart;
  const backgroundIndex = Array.from(
    { length: BACKGROUND_DIRECTIONS.length },
    (_, offset) => (backgroundStart + offset) % BACKGROUND_DIRECTIONS.length,
  ).find((index) => !recentText.includes(BACKGROUND_DIRECTIONS[index].toLowerCase())) ?? backgroundStart;
  const articleType = blog.articleType === "pillar" ? "pillar" : "supporting";
  return {
    articleType,
    palette: VISUAL_PALETTES[paletteIndex],
    background: BACKGROUND_DIRECTIONS[backgroundIndex],
    composition: articleType === "pillar"
      ? "a broad authority overview with multiple connected layers, clear hierarchy, and one central system-level focal point"
      : "a tightly focused close-up of the article's single problem, mechanism, and outcome with a distinct camera angle",
  };
}

async function getRecentVisualDirections(blog = {}) {
  try {
    const recent = await Blog.find({
      _id: { $ne: blog._id },
      $or: [
        { imagePrompt: { $type: "string", $ne: "" } },
        { imagePromptEnhanced: { $type: "string", $ne: "" } },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("title articleType clusterKey imagePrompt imagePromptEnhanced")
      .lean();
    return recent.map((item) =>
      `${item.title}: ${String(item.imagePromptEnhanced || item.imagePrompt || "").replace(/\s+/g, " ").slice(0, 280)}`,
    );
  } catch {
    return [];
  }
}

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
  const recentVisualDirections = await getRecentVisualDirections(blog);
  const visualIdentity = getVisualIdentity(blog, recentVisualDirections);
  const recentAvoidance = recentVisualDirections.length
    ? recentVisualDirections.map((item, index) => `${index + 1}. ${item}`).join("\n")
    : "No recent visual directions available.";

  const fallback = {
    prompt: `Create a premium 16:9 technical editorial ${visualIdentity.articleType} cover for the Muhyo Tech article "${blog.title}". Communicate the exact lesson through realistic software-engineering and business artifacts, not generic stock imagery. Article-level composition: ${visualIdentity.composition}. Use this specific background direction: ${visualIdentity.background}. Use a clearly dominant, distinctive palette of ${visualIdentity.palette}; do not fall back to the usual dark-blue/cyan SaaS look. Show believable architecture cards, workflows, product states, infrastructure, devices, or before/after operational outcomes only when they explain this topic. Keep a strong focal point, balanced depth, clean social-preview crop space, realistic materials, and professional lighting. No reused banner layout, generic office scene, repeated dashboard wall, neon cyberpunk, floating code, plastic AI gloss, random robots, fake logos, gibberish, watermarks, or large title text.` ,
    altText: ensureBlogImageAlt("", blog.title),
    visualDirection:
      `${visualIdentity.articleType} cover; ${visualIdentity.composition}; ${visualIdentity.background}; palette: ${visualIdentity.palette}.`,
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
      Article Type: ${visualIdentity.articleType}
      Cluster: ${blog.clusterTitle || blog.clusterKey || "Standalone editorial topic"}
      Cluster Position: ${Number(blog.clusterOrder || 0)} (0=pillar, 1/2=supporting)
      Tags: ${Array.isArray(blog.tags) ? blog.tags.join(", ") : ""}
      Keywords: ${Array.isArray(blog.keywords) ? blog.keywords.join(", ") : ""}
      Content Excerpt: ${contentExcerpt}

      ASSIGNED UNIQUE VISUAL IDENTITY:
      - Palette: ${visualIdentity.palette}
      - Background: ${visualIdentity.background}
      - Composition: ${visualIdentity.composition}

      RECENT BANNERS TO DIFFERENTIATE FROM:
      ${recentAvoidance}

      BRAND STYLE:
      Muhyo Tech, web development, software engineering, digital services, portfolio/business websites.

      REQUIREMENTS:
      - The prompt must be production-ready for an AI image generator.
      - Prompt length: 850-1300 characters.
      - Include aspect ratio 16:9.
      - Include subject, composition, foreground/background, technical artifacts, mood, lighting, depth, palette, style, and quality.
      - Make it specific to this exact blog topic and content excerpt.
      - Follow the assigned palette, background, and composition. Do not replace them with a generic dark-blue dashboard theme.
      - Do not reuse the dominant background, camera angle, palette, focal metaphor, or layout described in recent banners above.
      - A pillar must show the broad system/decision landscape. A supporting article must isolate one subproblem and use a visibly different composition from its pillar and sibling.
      - The altText must be professional, accurately describe the visual/topic, and include the words "Muhyo Tech" naturally.
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
        maxOutputTokens: 1536,
        thinkingBudget: 0,
        timeoutMs: Number(process.env.AI_IMAGE_PROMPT_TIMEOUT_MS || 10000),
      },
    );

    const parsed = JSON.parse(
      response.replace(/```json/gi, "").replace(/```/g, "").trim(),
    );

    const normalized = {
      prompt: parsed.prompt || fallback.prompt,
      altText: ensureBlogImageAlt(parsed.altText, blog.title),
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

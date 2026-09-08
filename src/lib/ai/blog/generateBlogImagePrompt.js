import { generateGeminiResponse } from "@/lib/geminiService";
import { ensureBlogImageAlt } from "@/lib/blogImageAlt";
import { Blog } from "@/models/Portfolio";

const FALLBACK_NEGATIVE_PROMPT =
  "No blurry text, no unreadable sticky notes, no smeared labels, no motion blur, no out-of-focus artifacts, no noisy compression artifacts, no fake logos, no watermarks, no gibberish text, no neon cyberpunk cliches, no floating code clouds, no plastic AI gloss, no generic blue dashboard templates, no distorted laptop screens, no chaotic wireframes.";

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
  const articleType = blog.articleType === "pillar" ? "pillar" : ["standalone_authority", "verified_trend"].includes(blog.articleType) ? "authority" : "supporting";
  return {
    articleType,
    palette: VISUAL_PALETTES[paletteIndex],
    background: BACKGROUND_DIRECTIONS[backgroundIndex],
    composition: articleType === "pillar" || articleType === "authority"
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
  const hasUltraHdQuality = /(?:ultra[- ]?hd|4k|3840\s*[x×]\s*2160)/i.test(prompt);

  return prompt.length >= 650 && visualDirection.length >= 80 && hasProfessionalDetail && hasUltraHdQuality;
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
    prompt: `Create a premium 16:9 technical editorial ${visualIdentity.articleType} cover for the Muhyo Tech article "${blog.title}". Render in ultra-HD 4K resolution (3840 x 2160), with pin-sharp focal clarity, clean geometric edges, and zero motion blur. Dynamically reflect the authentic brand color DNA and visual identity of the subject technology. Any sticky notes, architecture cards, flowchart nodes, and metric labels must be crystal-clear, high-contrast, and effortlessly legible. Laptop screens and system graphs must feature structured, anti-aliased precision. Composition: ${visualIdentity.composition}. Environment: ${visualIdentity.background}. Palette: ${visualIdentity.palette}. Photorealistic lighting with high micro-contrast and realistic physical textures. No blurry text, no unreadable sticky notes, no motion blur, no neon cyberpunk, no floating code clouds, no plastic AI gloss, no fake logos, no watermarks.`,
    altText: ensureBlogImageAlt("", blog.title),
    visualDirection:
      `${visualIdentity.articleType} cover; ${visualIdentity.composition}; ${visualIdentity.background}; palette: ${visualIdentity.palette}; 4K zero-blur clarity.`,
    negativePrompt: FALLBACK_NEGATIVE_PROMPT,
  };

  // The manual-email path already follows a full AI content-generation run.
  if (options.useAI === false) {
    return fallback;
  }

  try {
    const response = await generateGeminiResponse(
      `
      Create an elite, production-ready AI image-generation prompt for a Muhyo Tech blog featured cover.

      BLOG CONTEXT:
      Title: ${blog.title}
      Summary: ${blog.summary || ""}
      Category: ${blog.category || "Technology"}
      Article Type: ${visualIdentity.articleType}
      Cluster: ${blog.clusterTitle || blog.clusterKey || "Standalone editorial topic"}
      Tags: ${Array.isArray(blog.tags) ? blog.tags.join(", ") : ""}
      Keywords: ${Array.isArray(blog.keywords) ? blog.keywords.join(", ") : ""}
      Content Excerpt: ${contentExcerpt}

      RECENT BANNERS TO DIFFERENTIATE FROM:
      ${recentAvoidance}

      CORE INTELLIGENCE & VISUAL DIRECTIVES:
      1. DYNAMIC TECHNOLOGY & BRAND COLOR DNA:
         - Analyze the core technology, database, framework, language, or system discussed in this article.
         - Dynamically identify and apply its signature authentic color theme and official brand ecosystem into the lighting, architecture cards, and focal elements (e.g., MongoDB -> leaf green & slate; React -> electric cyan & navy; Next.js -> obsidian black & pure white; Node.js -> emerald & graphite; Python -> steel blue & amber; PostgreSQL -> classic ocean blue & silver; Rust -> industrial rust-orange & steel; Docker/Kubernetes -> container blue & white; Supabase -> emerald & dark mode; etc.).
         - Never use mismatched generic colors that contradict the subject technology.

      2. CRYSTAL-CLEAR LEGIBILITY & ZERO BLUR:
         - Any visible sticky notes, UI cards, architectural nodes, status chips, workflow steps, or annotations MUST be rendered with pin-sharp clarity, high contrast, and crisp legible typography.
         - Absolutely zero blurred text, zero smeared labels, zero messy artifacts, and zero unreadable scribbles.
         - The visual structure must be immediately intuitive and clean.

      3. PRECISE LAPTOP & TECHNICAL DISPLAYS:
         - If laptops, monitors, code editors, database query panels, latency graphs, or system flowcharts are shown, they must feature clean anti-aliased geometry, crisp lines, and structured visual hierarchy without chaotic AI noise.

      4. 4K ULTRA-HD CINEMATIC SPECS:
         - Resolution: Ultra-HD 4K (3840 x 2160).
         - Aspect Ratio: 16:9.
         - Lighting & Optics: Studio practical lighting, balanced focal depth, realistic material textures, razor-sharp focus, and zero motion blur.
         - Clean negative space suitable for responsive mobile and social card cropping.

      5. NEGATIVE RESTRICTIONS:
         - No fake logos, no watermarks, no unreadable gibberish, no childish cartoon robots.
         - Avoid neon cyberpunk, floating code clouds, magical glowing orbs, plastic AI gloss, and generic stock-photo corporate handshakes.

      OUTPUT STRICT JSON:
      {
        "prompt": "Full production-ready image generation prompt in English, 850-1350 characters, containing dynamic tech colors, 4K resolution, 16:9 aspect ratio, crystal-clear legible sticky notes/cards, and pin-sharp technical displays",
        "altText": "Descriptive SEO alt text including 'Muhyo Tech' and the core topic",
        "visualDirection": "Concise art direction and dynamic color palette summary, 120-220 characters",
        "negativePrompt": "Comprehensive negative prompt string"
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
    console.warn("[BlogImagePrompt] Falling back to deterministic prompt:", error?.message || error);
    return fallback;
  }
}

import { generateGeminiResponse } from "@/lib/geminiService";
import { ensureBlogImageAlt } from "@/lib/blogImageAlt";
import { Blog } from "@/models/Portfolio";

export const FALLBACK_NEGATIVE_PROMPT =
  "blurry text, unreadable sticky notes, smeared labels, motion blur, out-of-focus artifacts, noisy compression artifacts, fake corporate logos, commercial watermarks, gibberish lettering, neon cyberpunk cliches, floating code clouds, plastic AI gloss, generic blue dashboard templates, distorted laptop displays, chaotic wireframes, childish cartoon characters, deformed human hands, crowded stock-photo crowds";

// 60% Core Brand Foundation: Muhyo Tech signature slate & obsidian architectural depth
const BRAND_CORE_FOUNDATION = "60% Muhyo Tech architectural foundation: deep obsidian slate, titanium dark-mode surfaces, and restrained warm ivory highlights";

// 30% Industry Atmosphere & Vocabulary Matrix
const INDUSTRY_VISUAL_MATRIX = {
  fintech: {
    palette: "30% FinTech atmosphere: institutional deep navy, polished platinum, and subtle amber status indicators",
    objects: "cryptographic hardware tokens, payment gateway telemetry modules, transaction ledger cards, and latency metrics",
    avoid: "cash piles, cartoon piggy banks, random credit cards, glowing bitcoin coins",
  },
  ecommerce: {
    palette: "30% E-Commerce atmosphere: warm terracotta, refined sandstone, matte charcoal, and ambient ivory",
    objects: "checkout funnel telemetry, order fulfillment manifests, dispatch flowcharts, and payment verification stages",
    avoid: "grocery shopping carts, cheap discount percent tags, random barcode chaos, fake brand retail bags",
  },
  saas: {
    palette: "30% SaaS atmosphere: cool graphite, frosted slate, brushed aluminum, and ambient indigo",
    objects: "modular system hierarchy cards, multi-tenant database topologies, real-time query metrics, and API gateway nodes",
    avoid: "chaotic wireframe scribbles, generic blue laptop screens, cheesy smiling office workers",
  },
  healthcare: {
    palette: "30% Healthcare atmosphere: clean clinical white, sanitized titanium, muted sage, and pure glass",
    objects: "biometric data pipelines, HIPAA-compliant access verification nodes, structured clinical telemetry displays",
    avoid: "stethoscopes on keyboards, cheesy doctor stock photos, sci-fi glowing human silhouettes",
  },
  logistics: {
    palette: "30% Logistics atmosphere: industrial carbon, freight steel, tarmac gray, and restrained amber warning indicators",
    objects: "routing topology matrix, supply-chain dispatch manifests, containerized tracking displays, fleet optimization cards",
    avoid: "toy toy delivery trucks, generic world map arrows, miniature plastic packages",
  },
  cybersecurity: {
    palette: "30% CyberSecurity atmosphere: deep obsidian, cold steel, cryptographic cobalt, and focused crimson alert chips",
    objects: "zero-trust identity boundaries, intrusion detection telemetry, firewall rule hierarchy cards, encrypted tunnel topologies",
    avoid: "hooded hackers in the dark, skull-and-crossbones graphics, neon green matrix rain",
  },
  ai_data: {
    palette: "30% AI/Data atmosphere: dark obsidian, neural indigo, quantum silver, and diffused coherent light paths",
    objects: "tensor pipeline flowcharts, inference latency telemetry displays, model weight quantization architectures, vector index topologies",
    avoid: "glowing human brains, chrome robot faces, magical swirling spark dust",
  },
  cloud_devops: {
    palette: "30% Cloud & DevOps atmosphere: high-altitude server slate, container graphite, structured zinc, and clean white accents",
    objects: "Kubernetes pod orchestration topologies, CI/CD pipeline stage artifacts, load balancer telemetry, distributed trace nodes",
    avoid: "cartoon clouds with lightning, floating glowing servers, tangled cable messes",
  },
  devtools: {
    palette: "30% DevTools atmosphere: matte charcoal, raw aluminum, dark terminal slate, and subtle compiler status amber",
    objects: "compiler AST visualization boards, memory profiler telemetry, build-step artifacts, structured modular architecture tiles",
    avoid: "random green code walls, shattered glass effects, neon hacker keyboards",
  },
};

// 10% Technology Color DNA Accents
const TECH_COLOR_ACCENTS = [
  { keywords: ["react", "next.js", "nextjs", "typescript", "tailwind"], accent: "10% technology accent: electric cyan (#00f0ff) and pure white glow" },
  { keywords: ["node", "nodejs", "express", "supabase", "mongo", "mongodb"], accent: "10% technology accent: emerald green (#10b981) and dark graphite" },
  { keywords: ["python", "rust", "redis", "fastapi"], accent: "10% technology accent: industrial rust-orange (#f97316) and amber telemetry" },
  { keywords: ["postgres", "postgresql", "sql", "docker", "kubernetes", "go", "golang"], accent: "10% technology accent: cobalt blue (#3b82f6) and cool platinum" },
  { keywords: ["aws", "cloud", "cloudflare", "gcp", "azure"], accent: "10% technology accent: high-altitude cloud amber and structured azure" },
];

function stableHash(value = "") {
  return [...String(value)].reduce((hash, character) => ((hash * 31) + character.charCodeAt(0)) >>> 0, 2166136261);
}

function resolveIndustry(blog = {}) {
  const raw = String(
    blog.industry?.slug ||
    blog.industry?.name ||
    (typeof blog.industry === "string" ? blog.industry : "") ||
    blog.category ||
    blog.topicFamily ||
    ""
  ).toLowerCase();

  for (const key of Object.keys(INDUSTRY_VISUAL_MATRIX)) {
    if (raw.includes(key) || (key === "ai_data" && (raw.includes("ai") || raw.includes("data") || raw.includes("intelligence")))) {
      return key;
    }
  }
  return "saas"; // Premium default engineering atmosphere
}

function resolveTechAccent(blog = {}) {
  const text = `${blog.title || ""} ${blog.focusKeyword || ""} ${Array.isArray(blog.tags) ? blog.tags.join(" ") : ""} ${blog.category || ""}`.toLowerCase();
  for (const item of TECH_COLOR_ACCENTS) {
    if (item.keywords.some((k) => text.includes(k))) {
      return item.accent;
    }
  }
  return "10% technology accent: restrained electric cyan (#00f0ff) and cool white ambient edge glow";
}

function getDynamicCameraAndComposition(searchIntent = "informational", articleType = "supporting") {
  const normalizedIntent = String(searchIntent || "").toLowerCase();

  if (articleType === "pillar" || normalizedIntent === "informational") {
    return {
      camera: "28-35mm architectural wide lens, elevated three-quarter isometric perspective with sweeping multi-tier depth",
      composition: "broad system-level architecture overview displaying connected infrastructure stages, clear visual hierarchy, and balanced negative space on top for editorial banner readability",
    };
  }

  if (normalizedIntent === "commercial" || normalizedIntent === "comparison") {
    return {
      camera: "45-50mm prime studio lens, eye-level executive perspective with structured parallel framing",
      composition: "balanced comparative evaluation layout contrasting legacy friction against streamlined enterprise architecture, featuring premium physical materials and crisp structural alignment",
    };
  }

  // Implementation, troubleshooting, or deep-dive supporting posts
  return {
    camera: "55-85mm close technical lens, shallow focal depth with crisp foreground focus and softly diffused background depth",
    composition: "tightly focused engineering scene capturing the specific system bottleneck transitioning into an optimized data flow, anchored by one distinct physical telemetry artifact",
  };
}

export function getBrandVisualIdentity(blog = {}, recentDirections = []) {
  const industryKey = resolveIndustry(blog);
  const industrySpec = INDUSTRY_VISUAL_MATRIX[industryKey] || INDUSTRY_VISUAL_MATRIX.saas;
  const techAccent = resolveTechAccent(blog);
  const articleType = blog.articleType === "pillar" ? "pillar" : ["standalone_authority", "verified_trend"].includes(blog.articleType) ? "authority" : "supporting";
  const searchIntent = blog.searchIntent || "informational";
  const cameraComp = getDynamicCameraAndComposition(searchIntent, articleType);

  return {
    articleType,
    industryKey,
    brandFoundation: BRAND_CORE_FOUNDATION,
    industryPalette: industrySpec.palette,
    industryObjects: industrySpec.objects,
    industryAvoid: industrySpec.avoid,
    techAccent,
    camera: cameraComp.camera,
    composition: cameraComp.composition,
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
    /(composition|foreground|background|lighting|camera|editorial|cover|aspect ratio|16:9|style|palette|depth|materials)/i.test(
      prompt,
    );
  const hasHighFidelitySpec = /(?:ultra[- ]?hd|4k|3840\s*[x×]\s*2160|1200\s*[x×]\s*675|16:9|high fidelity|cinematic|studio lighting)/i.test(prompt);

  return prompt.length >= 650 && visualDirection.length >= 70 && hasProfessionalDetail && hasHighFidelitySpec;
}

function excerptHtml(value = "", maxLength = 1600) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function resolveContextField(field, fallback = "") {
  if (!field) return fallback;
  if (typeof field === "string") return field.trim();
  if (typeof field === "object") {
    return field.title || field.name || field.slug || field.description || fallback;
  }
  return fallback;
}

export async function generateBlogImagePrompt(blog, options = {}) {
  const contentExcerpt = excerptHtml(blog.content || "");
  const recentVisualDirections = await getRecentVisualDirections(blog);
  const brandVisual = getBrandVisualIdentity(blog, recentVisualDirections);
  const recentAvoidance = recentVisualDirections.length
    ? recentVisualDirections.map((item, index) => `${index + 1}. ${item}`).join("\n")
    : "No recent visual directions available.";

  const industry = resolveContextField(blog.industry, brandVisual.industryKey);
  const businessProblem = resolveContextField(blog.businessProblem, "System latency bottleneck and architectural friction");
  const solutionType = resolveContextField(blog.solutionType, "Scalable architectural optimization and automated pipeline resolution");
  const audienceProfile = resolveContextField(blog.audienceProfile, "Senior software engineers, CTOs, and technical engineering leaders");
  const searchIntent = blog.searchIntent || "informational";
  const focusKeyword = blog.focusKeyword || (Array.isArray(blog.keywords) ? blog.keywords[0] : "") || "modern web architecture";

  const fallback = {
    prompt: `Create a cinematic 16:9 technical editorial cover for the Muhyo Tech article "${blog.title}". Set in a refined ${brandVisual.industryKey} technical environment. Visual storytelling: depict the transition from the business problem (${businessProblem}) into the high-performance architectural solution (${solutionType}). Spatial structure: Foreground features precision physical engineering artifacts (${brandVisual.industryObjects}); Midground displays structured system flowcharts and telemetry topology with anti-aliased geometry; Background offers subtle architectural depth with ambient workstation contrast. Color hierarchy: ${brandVisual.brandFoundation}; ${brandVisual.industryPalette}; ${brandVisual.techAccent}. Camera & Optics: ${brandVisual.camera}; Composition: ${brandVisual.composition}. Illumination: precision volumetric studio lighting, balanced micro-contrast, realistic physical textures (matte aluminum, slate, dark glass), razor-sharp focal clarity, and zero motion blur. Clean negative space along the upper plane for responsive viewport readability.`,
    altText: ensureBlogImageAlt("", blog.title),
    visualDirection:
      `16:9 editorial ${brandVisual.articleType} cover; ${brandVisual.industryKey} narrative (${businessProblem} -> ${solutionType}); ${brandVisual.camera}; 60/30/10 brand color balance.`,
    negativePrompt: `${FALLBACK_NEGATIVE_PROMPT}, ${brandVisual.industryAvoid}`,
  };

  if (options.useAI === false) {
    return fallback;
  }

  try {
    const response = await generateGeminiResponse(
      `
      You are the Principal Editorial Art Director and Visual Systems Architect for Muhyo Tech.
      Create an elite, production-ready AI image-generation prompt for a featured blog cover that visually narrates the article's engineering story.

      ARTICLE CONTENT & BUSINESS INTELLIGENCE:
      - Title: ${blog.title}
      - Core Thesis (Summary): ${blog.summary || ""}
      - Target Industry: ${industry}
      - Real-World Business Problem: ${businessProblem}
      - Engineering Solution: ${solutionType}
      - Target Audience Profile: ${audienceProfile}
      - Search Intent: ${searchIntent}
      - SEO Focus Keyword: ${focusKeyword}
      - Article Type: ${brandVisual.articleType}
      - Topic Cluster: ${blog.clusterTitle || blog.clusterKey || "Core Engineering"}
      - Tags: ${Array.isArray(blog.tags) ? blog.tags.join(", ") : ""}
      - Content Excerpt: ${contentExcerpt}

      RECENT VISUAL DIRECTIONS TO DIFFERENTIATE FROM (AVOID REPEATING THESE):
      ${recentAvoidance}

      EDITORIAL & BRAND VISUAL DIRECTIVES:
      1. VISUAL STORYTELLING (PROBLEM -> SOLUTION):
         - Do NOT merely create a generic laptop desk with a logo.
         - Visually depict the engineering narrative: show the friction or bottleneck (${businessProblem}) being systematically solved by the high-throughput architecture (${solutionType}).
         - Use spatial relationships, data pipelines, and telemetry funnels as visual metaphors.

      2. STRICT 60 / 30 / 10 BRAND COLOR HARMONY:
         - 60% Foundation: ${brandVisual.brandFoundation} (enforces brand consistency across all 100+ articles).
         - 30% Industry Mood: ${brandVisual.industryPalette}.
         - 10% Technology Accent: ${brandVisual.techAccent}.
         - Maintain cohesive editorial luxury, eliminating garish neon or random clashing hues.

      3. SPATIAL COMPOSITION & OPTICS:
         - Camera & Lens: ${brandVisual.camera}.
         - Composition: ${brandVisual.composition}.
         - Aspect Ratio: True 16:9 widescreen with dedicated negative space for responsive banner cropping.
         - Materials & Lighting: Photorealistic studio lighting, matte dark glass, brushed titanium, soft edge glows, razor-sharp focal clarity, zero motion blur.

      4. ZERO-GIBBERISH & CLEAN GEOMETRY:
         - Diffusion models cannot render complex micro-paragraphs.
         - Do NOT request legible code snippets or readable text paragraphs.
         - Instead, use clean abstract telemetry indicators, structured flowchart nodes, geometric pipeline routes, and minimal status chips.

      5. INDUSTRY ACCURACY & CLICHE AVOIDANCE:
         - Recommended Physical Elements: ${brandVisual.industryObjects}.
         - Strictly Avoid: ${brandVisual.industryAvoid}.

      OUTPUT STRICT JSON:
      {
        "prompt": "Full production-ready image generation prompt in English, 850-1350 characters, describing foreground, midground, background, lighting, 60/30/10 brand colors, 16:9 widescreen composition, and specific architectural materials",
        "altText": "Descriptive SEO alt text in English describing the visible physical scene and citing Muhyo Tech",
        "visualDirection": "Concise art direction summary (100-220 characters) highlighting industry narrative and color hierarchy for visual memory tracking",
        "negativePrompt": "Comprehensive negative prompt string"
      }
      `,
      {
        temperature: 0.4,
        responseMimeType: "application/json",
        maxOutputTokens: 1536,
        thinkingBudget: 0,
        timeoutMs: Number(process.env.AI_IMAGE_PROMPT_TIMEOUT_MS || 12000),
      },
    );

    const parsed = JSON.parse(
      response.replace(/```json/gi, "").replace(/```/g, "").trim(),
    );

    const normalized = {
      prompt: parsed.prompt || fallback.prompt,
      altText: ensureBlogImageAlt(parsed.altText, blog.title),
      visualDirection: parsed.visualDirection || fallback.visualDirection,
      negativePrompt: parsed.negativePrompt || fallback.negativePrompt,
    };

    if (!isProfessionalImagePromptReady(normalized)) {
      console.warn("[BlogImagePrompt] Prompt failed calibration check, using deterministic fallback.");
      return fallback;
    }

    return normalized;
  } catch (error) {
    console.warn("[BlogImagePrompt] Falling back to deterministic brand prompt:", error?.message || error);
    return fallback;
  }
}

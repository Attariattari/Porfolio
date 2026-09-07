import { generateGeminiResponse } from "../../../geminiService.js";

const FALLBACK_NEGATIVE_PROMPT =
  "No blurry text, no unreadable sticky notes, no smeared labels, no motion blur, no out-of-focus artifacts, no noisy compression artifacts, no fake logos, no watermarks, no gibberish text, no neon cyberpunk cliches, no floating code clouds, no plastic AI gloss, no generic blue dashboard templates, no distorted laptop screens, no chaotic wireframes, no childish 3D cartoon characters.";

const SERVICE_VISUAL_PALETTES = [
  "obsidian black, pure white, cool platinum, and vivid cyan accents (Next.js App Router & Modern Web)",
  "deep slate, electric emerald, graphite, and clean bone white (Node.js & Resilient Backend)",
  "dark navy, vibrant cyan, ice white, and cobalt blue (React, MERN & Full-Stack Cloud)",
  "charcoal, leaf green, polished aluminum, and off-white (MongoDB & High-Scale Databases)",
  "rich royal indigo, amber gold, pale mist, and dark walnut (Technical SEO & Organic Growth)",
  "midnight carbon, rust copper, clean titanium steel, and warm ivory (Website Speed Optimization & Performance)",
  "matte black, vibrant violet, ultra-violet neon, and crisp white (AI SaaS, Automation & Digital Products)",
  "deep teal, warm cream, burnt terracotta, and graphite (E-Commerce & High-Conversion Stores)",
  "champagne gold, dark graphite, warm alabaster, and bronze (Premium Portfolio & Personal Branding)",
  "coral red, deep charcoal, icy silver, and crisp white (UI/UX Redesign & Design Systems)",
  "electric azure, cobalt, clean glass, and off-white (API Integration & Microservices Architecture)",
  "forest emerald, soft clay, dark timber, and platinum (Cloud Infrastructure, DevOps & Security)",
  "amethyst purple, midnight navy, rose gold, and pure white (Mobile Apps & Cross-Platform Development)",
  "cyber cyan, deep sapphire, brushed nickel, and chalk white (Custom Web Solutions & Enterprise Software)",
];

const SERVICE_BACKGROUND_DIRECTIONS = [
  "a premium architectural tech studio with physical modular cards, wireframes, and high-resolution interface screens",
  "a clean, modern engineering workspace showcasing dual 4K monitors with structured system architectures and clean code",
  "a high-end product design lab with tangible workflow boards, tactile physical swatches, and live staging dashboards",
  "a sleek enterprise developer operations environment lit by practical ambient studio lighting and crisp displays",
  "an elevated three-quarter isometric viewpoint of a production software stack rendered in realistic tactile materials",
  "a minimalist technical strategy desk with organized system deliverables, performance metric readouts, and clean negative space",
  "a bright collaborative software lab with layered physical system flows and precision hardware artifacts",
  "a daylight technical studio table arranged with modular components, architecture diagrams, and one hero device",
];

function stableHash(value = "") {
  return [...String(value)].reduce((hash, char) => ((hash * 31) + char.charCodeAt(0)) >>> 0, 2166136261);
}

function excerptHtml(value = "", maxLength = 1500) {
  return String(value || "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

async function getRecentServiceVisualDirections(service = {}) {
  try {
    const Service = (await import("@/models/Service")).default;
    const recent = await Service.find({
      _id: { $ne: service._id },
      $or: [
        { imagePrompt: { $type: "string", $ne: "" } },
        { imagePromptEnhanced: { $type: "string", $ne: "" } },
      ],
    })
      .sort({ updatedAt: -1 })
      .limit(8)
      .select("title category imagePrompt imagePromptEnhanced")
      .lean();
    return recent.map((item) =>
      `${item.title} (${item.category}): ${String(item.imagePromptEnhanced || item.imagePrompt || "").replace(/\s+/g, " ").slice(0, 240)}`,
    );
  } catch {
    return [];
  }
}

function getServiceVisualIdentity(service = {}, recentDirections = []) {
  const seed = stableHash(`${service.slug || service.title}:${service.category || ""}`);
  const recentText = recentDirections.join(" ").toLowerCase();
  const paletteStart = seed % SERVICE_VISUAL_PALETTES.length;
  const backgroundStart = (seed * 3) % SERVICE_BACKGROUND_DIRECTIONS.length;

  const paletteIndex = Array.from(
    { length: SERVICE_VISUAL_PALETTES.length },
    (_, offset) => (paletteStart + offset) % SERVICE_VISUAL_PALETTES.length,
  ).find((index) => !recentText.includes(SERVICE_VISUAL_PALETTES[index].toLowerCase())) ?? paletteStart;

  const backgroundIndex = Array.from(
    { length: SERVICE_BACKGROUND_DIRECTIONS.length },
    (_, offset) => (backgroundStart + offset) % SERVICE_BACKGROUND_DIRECTIONS.length,
  ).find((index) => !recentText.includes(SERVICE_BACKGROUND_DIRECTIONS[index].toLowerCase())) ?? backgroundStart;

  return {
    palette: SERVICE_VISUAL_PALETTES[paletteIndex],
    background: SERVICE_BACKGROUND_DIRECTIONS[backgroundIndex],
    composition: "a cinematic 16:9 commercial agency hero visual with crisp visual hierarchy, one authoritative central technical artifact, and high micro-contrast depth",
  };
}

export function isProfessionalServiceImagePromptReady(imagePrompt = {}) {
  const prompt = String(imagePrompt.prompt || "").trim();
  const visualDirection = String(imagePrompt.visualDirection || "").trim();
  const hasProfessionalDetail =
    /(composition|foreground|background|lighting|camera|editorial|cover|aspect ratio|16:9|style|palette|depth)/i.test(
      prompt,
    );
  const hasUltraHdQuality = /(?:ultra[- ]?hd|4k|3840\s*[x×]\s*2160)/i.test(prompt);

  return prompt.length >= 700 && visualDirection.length >= 70 && hasProfessionalDetail && hasUltraHdQuality;
}

export async function generateServiceImagePrompt(service = {}, options = {}) {
  const title = service.title || "Custom Technology Solution";
  const category = service.category || "Full-Stack Web Development";
  const shortDesc = service.shortDescription || service.overview || service.description || "";
  const contentExcerpt = excerptHtml(service.fullDescription || service.overview || service.description || "");

  const techNames = Array.isArray(service.technologies)
    ? service.technologies.map((t) => (typeof t === "string" ? t : t?.name)).filter(Boolean).join(", ")
    : Array.isArray(service.techStack)
      ? service.techStack.join(", ")
      : "Next.js, React, Node.js, MongoDB, Tailwind CSS";

  const problemsText = Array.isArray(service.problemsSolved)
    ? service.problemsSolved.map((p) => (typeof p === "string" ? p : p?.title || p?.description)).filter(Boolean).slice(0, 3).join("; ")
    : service.problemSolved || "";

  const deliverablesText = Array.isArray(service.deliverables)
    ? service.deliverables.map((d) => (typeof d === "string" ? d : d?.title || d?.description)).filter(Boolean).slice(0, 4).join("; ")
    : "";

  const featuresText = Array.isArray(service.features)
    ? service.features.map((f) => (typeof f === "string" ? f : f?.title || f?.description)).filter(Boolean).slice(0, 4).join("; ")
    : "";

  const benefitsText = Array.isArray(service.benefits)
    ? service.benefits.map((b) => (typeof b === "string" ? b : b?.title || b?.description)).filter(Boolean).slice(0, 4).join("; ")
    : "";

  const processStepsText = Array.isArray(service.processSteps)
    ? service.processSteps.map((p) => (typeof p === "string" ? p : p?.title || p?.description)).filter(Boolean).slice(0, 4).join(" -> ")
    : Array.isArray(service.process)
      ? service.process.map((p) => (typeof p === "string" ? p : p?.title || p?.description)).filter(Boolean).slice(0, 4).join(" -> ")
      : "";

  const keywordsText = Array.isArray(service.targetKeywords) && service.targetKeywords.length
    ? service.targetKeywords.join(", ")
    : Array.isArray(service.keywords)
      ? service.keywords.join(", ")
      : "";

  const targetAudience = Array.isArray(service.targetAudienceProfiles) && service.targetAudienceProfiles.length
    ? service.targetAudienceProfiles.map((a) => (typeof a === "string" ? a : a?.title || a?.persona || a?.name)).filter(Boolean).join(", ")
    : "High-growth startups, scale-up CTOs, enterprise product managers, and modern businesses";

  const recentVisualDirections = await getRecentServiceVisualDirections(service);
  const visualIdentity = getServiceVisualIdentity(service, recentVisualDirections);
  const recentAvoidance = recentVisualDirections.length
    ? recentVisualDirections.map((item, idx) => `${idx + 1}. ${item}`).join("\n")
    : "No recent service directions recorded yet.";

  const fallback = {
    prompt: `Create a cinematic 16:9 commercial tech service hero visual for Muhyo Tech's "${title}" (${category}). Render in ultra-HD 4K resolution (3840 x 2160), shot on an 85mm medium-format lens at f/2.8 with pin-sharp focal clarity, clean geometric edges, and zero motion blur. Dynamically integrate authentic tech brand ecosystem colors and materials representing ${techNames}. Foreground: a tactile architectural workstation with clean physical modular UI cards and tangible workflow deliverables (${deliverablesText || "Production Code, Scalable APIs, Core Web Vitals"}). Midground: high-contrast 4K dual displays showcasing clean, anti-aliased system architecture topology, legible code snippets, and crisp performance metric chips. Any visible labels, nodes, and code syntax must be crystal-clear, high-contrast, and effortlessly legible with pin-sharp typography. Background: ${visualIdentity.background} lit by practical diffused studio softboxes with high micro-contrast, elegant optical depth of field, and balanced negative space for responsive cropping. Palette: ${visualIdentity.palette}. Materials: brushed aluminum, dark glass, and matte obsidian textures. No blurry text, no unreadable sticky notes, no smeared labels, no motion blur, no out-of-focus artifacts, no noisy compression artifacts, no fake logos, no watermarks, no gibberish text, no neon cyberpunk cliches, no floating code clouds, no plastic AI gloss, no distorted laptop screens, no childish cartoon characters.`,
    altText: `${title} - Professional ${category} by Muhyo Tech`,
    visualDirection: `Commercial Service Hero Cover; ${visualIdentity.composition}; ${visualIdentity.background}; Palette: ${visualIdentity.palette}; 4K zero-blur clarity.`,
    negativePrompt: FALLBACK_NEGATIVE_PROMPT,
  };

  if (options.useAI === false) {
    return fallback;
  }

  try {
    const promptText = `
      Create an elite, production-ready AI image-generation prompt for a Muhyo Tech commercial service hero cover.

      SERVICE CONTEXT:
      - Title: ${title}
      - Category: ${category}
      - Short Overview: ${shortDesc}
      - Detailed Scope: ${contentExcerpt || "High-performance enterprise technology solution with scalable architecture, secure backend, and responsive UI."}
      - Core Problem Solved: ${problemsText || "Technical debt, sluggish legacy architectures, and low conversion rates."}
      - Key Deliverables: ${deliverablesText || "Production-ready codebase, automated CI/CD pipeline, and 100/100 performance scores."}
      - Core Features: ${featuresText || "Custom modular architecture, responsive design system, and sub-second response times."}
      - Business Benefits: ${benefitsText || "High conversion, effortless scaling, and robust reliability."}
      - Engineering Workflow: ${processStepsText || "Architecture Planning -> Development -> Code Review & QA -> Production Deployment"}
      - Tech Stack: ${techNames}
      - Target Audience: ${targetAudience}
      - Keywords: ${keywordsText || "Scalable Web Architecture, Modern Full-Stack Development, High Performance"}

      RECENT SERVICE VISUALS TO DIFFERENTIATE FROM (Ensure unique distinct colors, materials & composition):
      ${recentAvoidance}

      CORE INTELLIGENCE & VISUAL DIRECTIVES:
      1. DYNAMIC TECHNOLOGY & BRAND COLOR DNA:
         - Analyze the specific technology stack, framework, and business domain (${techNames}).
         - Dynamically assign its authentic signature brand color palette and material ecosystem into the studio lighting, architectural accents, UI components, and focal elements:
           * Next.js App Router -> Obsidian black, pure white, cool platinum, and electric cyan accents
           * Node.js & Resilient Backend -> Deep slate, electric emerald, graphite, and clean bone white
           * React, MERN & Full-Stack Cloud -> Dark navy, vibrant cyan, ice white, and cobalt blue
           * MongoDB & Scalable Databases -> Charcoal, leaf green, polished aluminum, and off-white
           * Technical SEO & Organic Growth -> Rich royal indigo, amber gold, pale mist, and dark walnut
           * Website Speed & Performance -> Midnight carbon, rust copper, clean titanium steel, and warm ivory
           * AI SaaS & Product Automation -> Matte black, vibrant violet, ultra-violet neon, and crisp white
           * E-Commerce & High-Conversion Stores -> Deep teal, warm cream, burnt terracotta, and graphite
           * UI/UX Redesign & Design Systems -> Coral red, deep charcoal, icy silver, and crisp white
           * API Integration & Microservices -> Electric azure, cobalt, clean glass, and off-white
           * Cloud DevOps & Security -> Forest emerald, soft clay, dark timber, and platinum
           * Custom Web Solutions & Enterprise -> Cyber cyan, deep sapphire, brushed nickel, and chalk white
         - Never use generic or duplicated color themes that clash with the tech stack.

      2. THREE-LAYER ARCHITECTURAL COMPOSITION (COMMERCIAL HERO COVER):
         - Layer 1 (Foreground): Tangible, physical focal point — an architectural device (e.g. MacBook Pro, iPad Pro, or precision physical system card) showcasing clean legible code, live architecture node, or tactile UI design swatch.
         - Layer 2 (Midground): High-end engineering workstation with dual ultra-crisp displays showing structured architecture diagrams, real system topology, or readable performance metrics (e.g., 'LCP: 0.8s', 'Core Web Vitals: 100/100', 'API Latency: 14ms', 'TypeScript App Router').
         - Layer 3 (Background): Modern architectural tech agency studio with ambient acoustic slat wood panels, subtle softbox lighting, and clean negative space on the left or top for responsive hero layout and typography.

      3. CRYSTAL-CLEAR LEGIBILITY & ZERO BLUR (MANDATORY):
         - Any visible sticky notes, UI cards, flowchart nodes, workflow steps, code cards, or metric labels MUST be rendered with pin-sharp clarity, high contrast, and crisp legible typography.
         - Absolutely zero blurred text, zero smeared labels, zero noisy compression artifacts, and zero unreadable scribbles.
         - Anti-aliased precision on all monitors and technical readouts.

      4. 4K ULTRA-HD CINEMATIC SPECS:
         - Resolution: Ultra-HD 4K (3840 x 2160).
         - Aspect Ratio: 16:9.
         - Optics: 50mm or 85mm medium format lens, f/2.8 aperture, studio practical diffused softbox illumination, balanced focal depth, realistic material textures (brushed aluminum, etched glass, matte polymers), razor-sharp focus, and zero motion blur.
         - Balanced negative space suitable for desktop web hero banners and mobile card cropping.

      5. STRICT NEGATIVE RESTRICTIONS:
         - No fake logos, no watermarks, no unreadable gibberish, no cartoon 3D robots.
         - Avoid neon cyberpunk cliches, floating code clouds, magical glowing orbs, plastic AI gloss, and cheesy corporate handshake stock photos.

      OUTPUT STRICT JSON FORMAT:
      {
        "prompt": "Full production-ready image generation prompt in English, 950-1450 characters, detailing the three-layer architectural composition, dynamic tech colors, specific legible metrics/labels, 4K resolution (3840 x 2160), 16:9 aspect ratio, 50mm medium-format optics, and zero motion blur",
        "altText": "Descriptive SEO alt text including 'Muhyo Tech' and the service title",
        "visualDirection": "Concise art direction and dynamic color palette summary, 120-220 characters",
        "negativePrompt": "Comprehensive negative prompt string including zero blur and no blurry text restrictions"
      }
    `;

    const response = await generateGeminiResponse(promptText, {
      temperature: 0.45,
      responseMimeType: "application/json",
      maxOutputTokens: 2048,
      thinkingBudget: 0,
      timeoutMs: Number(process.env.AI_IMAGE_PROMPT_TIMEOUT_MS || 15000),
    });

    const parsed = JSON.parse(
      response.replace(/```json/gi, "").replace(/```/g, "").trim(),
    );

    const normalized = {
      prompt: parsed.prompt || fallback.prompt,
      altText: parsed.altText || fallback.altText,
      visualDirection: parsed.visualDirection || fallback.visualDirection,
      negativePrompt: parsed.negativePrompt || FALLBACK_NEGATIVE_PROMPT,
    };

    // Guarantee that 16:9 aspect ratio is explicitly mentioned in prompt
    if (!/16:9/i.test(normalized.prompt)) {
      normalized.prompt = `${normalized.prompt}, 16:9 aspect ratio`;
    }

    // Guarantee that negative prompt always contains zero blur & no blurry text protection
    if (!/(?:no blurry text|no blur|zero blur)/i.test(normalized.negativePrompt)) {
      normalized.negativePrompt = `${FALLBACK_NEGATIVE_PROMPT}, ${normalized.negativePrompt}`;
    }

    if (!isProfessionalServiceImagePromptReady(normalized)) {
      return fallback;
    }

    return normalized;
  } catch (error) {
    console.warn("[generateServiceImagePrompt] Falling back to deterministic prompt:", error?.message || error);
    return fallback;
  }
}

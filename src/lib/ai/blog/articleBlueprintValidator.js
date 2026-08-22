/**
 * Article Blueprint Deterministic Validator
 * 
 * Validates a generated Article Blueprint object against Muhyo Tech editorial,
 * SEO, structural, service, and safety constraints.
 * 
 * Errors prevent the blueprint from being passed to the AI Writer.
 * Warnings log potential quality issues without blocking execution.
 */

const ALLOWED_SERVICE_SLUGS = new Set([
  "custom-website-development",
  "mern-stack-web-development",
  "nextjs-website-development",
  "full-stack-web-app-development",
  "admin-dashboard-development",
  "e-commerce-website-development",
  "portfolio-website-development",
  "landing-page-design",
  "website-redesign",
  "api-integration",
  "database-integration",
  "seo-friendly-website-setup",
  "website-speed-optimization",
  "maintenance-support",
]);

const VALID_ARTICLE_TYPES = new Set(["pillar", "supporting", "standalone_authority", "verified_trend"]);
const VALID_SEARCH_INTENTS = new Set(["informational", "commercial", "transactional", "navigational"]);

/**
 * Validates an Article Blueprint object.
 * 
 * @param {Object} blueprint - The generated article blueprint object
 * @param {Object} options - Optional validation configuration
 * @returns {{ valid: boolean, errors: string[], warnings: string[], metrics: Object }} Validation result
 */
export function validateArticleBlueprint(blueprint = {}, options = {}) {
  const errors = [];
  const warnings = [];

  if (!blueprint || typeof blueprint !== "object") {
    return {
      valid: false,
      errors: ["Blueprint object is null or not a valid JSON object."],
      warnings: [],
      metrics: { sectionCount: 0, h2Count: 0, entityCount: 0 },
    };
  }

  // 1. Article Type validation
  const articleType = String(blueprint.articleType || "").toLowerCase().trim();
  if (!VALID_ARTICLE_TYPES.has(articleType)) {
    errors.push(`Invalid articleType '${blueprint.articleType}'. Must be one of: pillar, supporting, standalone_authority, verified_trend.`);
  }

  // 2. Search Intent validation
  const primaryIntent = String(blueprint.primaryIntent || "").toLowerCase().trim();
  if (!VALID_SEARCH_INTENTS.has(primaryIntent)) {
    errors.push(`Invalid primaryIntent '${blueprint.primaryIntent}'. Must be one of: informational, commercial, transactional, navigational.`);
  }

  // 3. Title Direction & Primary Query
  if (!blueprint.titleDirection || !String(blueprint.titleDirection).trim()) {
    errors.push("Missing required field 'titleDirection'.");
  }

  const primaryQuery = blueprint.searchCoverage?.primaryQuery;
  if (!primaryQuery || !String(primaryQuery).trim()) {
    errors.push("Missing primary search query in 'searchCoverage.primaryQuery'.");
  }

  // 4. Audience definition
  if (!blueprint.audience || !blueprint.audience.primary || !String(blueprint.audience.primary).trim()) {
    errors.push("Missing primary audience definition in 'audience.primary'.");
  }

  // 5. Structure validation
  const structure = Array.isArray(blueprint.structure) ? blueprint.structure : [];
  if (!structure.length) {
    errors.push("Blueprint 'structure' array is empty.");
  } else {
    const isAuthority = articleType === "pillar" || articleType === "standalone_authority" || articleType === "verified_trend";
    const minH2Count = isAuthority ? 6 : 4;
    const h2Sections = structure.filter((s) => String(s.headingLevel || "h2").toLowerCase() === "h2");

    if (h2Sections.length < minH2Count) {
      errors.push(`Blueprint has only ${h2Sections.length} H2 sections; minimum required for ${articleType} is ${minH2Count}.`);
    }

    // Check headings non-empty and unique
    const seenHeadings = new Set();
    structure.forEach((sec, idx) => {
      const headingText = String(sec.heading || "").trim();
      if (!headingText) {
        errors.push(`Section #${idx + 1} is missing a heading string.`);
      } else {
        const normalized = headingText.toLowerCase();
        if (seenHeadings.has(normalized)) {
          warnings.push(`Duplicate section heading detected: '${headingText}'.`);
        }
        seenHeadings.add(normalized);
      }

      if (sec.headingLevel && !["h2", "h3"].includes(String(sec.headingLevel).toLowerCase())) {
        warnings.push(`Section #${idx + 1} ('${headingText}') has unusual headingLevel '${sec.headingLevel}'.`);
      }
    });

    // Check FAQ requirement for authority / pillar articles
    if (isAuthority) {
      const hasFaqSection = structure.some((s) => /faq|frequently asked/i.test(s.heading || ""));
      if (!hasFaqSection) {
        warnings.push("Authority/Pillar blueprint lacks an explicit FAQ section in the structure array.");
      }
    }
  }

  // 6. Service Alignment validation
  const serviceSlug = blueprint.serviceAlignment?.serviceSlug;
  if (serviceSlug && String(serviceSlug).trim()) {
    const normalizedSlug = String(serviceSlug).trim().toLowerCase();
    if (!ALLOWED_SERVICE_SLUGS.has(normalizedSlug)) {
      errors.push(`Service alignment slug '${serviceSlug}' is not in the allowed service catalog.`);
    }
  }

  // 7. Internal Link Plan validation
  const internalLinkPlan = Array.isArray(blueprint.internalLinkPlan) ? blueprint.internalLinkPlan : [];
  internalLinkPlan.forEach((link, idx) => {
    if (link.targetType === "service" && link.targetSlug) {
      if (!ALLOWED_SERVICE_SLUGS.has(String(link.targetSlug).trim().toLowerCase())) {
        warnings.push(`Internal link plan item #${idx + 1} specifies invalid service slug '${link.targetSlug}'.`);
      }
    }
  });

  // 8. Differentiation & Cannibalization Risk
  const uniqueAngle = blueprint.uniqueAngle;
  if (!uniqueAngle || !String(uniqueAngle).trim()) {
    warnings.push("Missing explicit 'uniqueAngle' in blueprint.");
  }

  const uniqueCoverage = blueprint.differentiation?.uniqueCoverage;
  const competitiveGap = blueprint.differentiation?.competitiveGap;
  if ((!uniqueCoverage || !uniqueCoverage.length) && !competitiveGap) {
    warnings.push("Blueprint provides minimal explicit differentiation / competitive gap notes.");
  }

  // Calculate summary metrics
  const h2Count = structure.filter((s) => String(s.headingLevel || "h2").toLowerCase() === "h2").length;
  const entityCount = Array.isArray(blueprint.searchCoverage?.entities) ? blueprint.searchCoverage.entities.length : 0;
  const researchItemCount = Array.isArray(blueprint.researchMap) ? blueprint.researchMap.length : 0;

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    metrics: {
      sectionCount: structure.length,
      h2Count,
      entityCount,
      researchItemCount,
      cannibalizationRisk: blueprint.differentiation?.cannibalizationRisk || "low",
    },
  };
}

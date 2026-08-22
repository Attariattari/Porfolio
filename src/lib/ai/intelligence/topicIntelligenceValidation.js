/**
 * Topic Intelligence Validation & Fallback Engine (Phase 4)
 * 
 * Ensures all structured Phase 4 intelligence metadata adheres to strict schema & bounds.
 * If malformed or invalid metadata is detected:
 * - Logs a structured warning [TopicIntelligenceValidation]
 * - Safely falls back to valid null/default values
 * - NEVER halts or crashes topic queue processing.
 */

export function validateTopicIntelligence(metadata = {}, topicTitle = "Unknown Topic") {
  const result = {
    valid: true,
    warnings: [],
    cleaned: {
      audienceProfile: null,
      industry: null,
      businessProblem: null,
      solutionType: null,
      serviceIntent: { relevant: false, serviceKey: null, confidence: 0 },
      geoContext: { type: "global" },
    },
  };

  try {
    // 1. Audience Profile Validation
    if (metadata.audienceProfile && typeof metadata.audienceProfile === "object") {
      const type = String(metadata.audienceProfile.type || "").trim();
      const label = String(metadata.audienceProfile.label || type || "").trim();
      if (type) {
        result.cleaned.audienceProfile = { type, label };
      }
    } else if (typeof metadata.audienceProfile === "string" && metadata.audienceProfile.trim()) {
      result.cleaned.audienceProfile = {
        type: metadata.audienceProfile.trim().toLowerCase().replace(/\s+/g, "_"),
        label: metadata.audienceProfile.trim(),
      };
    }

    // 2. Industry Validation
    if (metadata.industry) {
      if (typeof metadata.industry === "object" && metadata.industry.key && typeof metadata.industry.key === "string") {
        result.cleaned.industry = {
          key: metadata.industry.key.trim().toLowerCase().replace(/[\s-]+/g, "_"),
          label: String(metadata.industry.label || metadata.industry.key).trim(),
        };
      } else if (typeof metadata.industry === "string" && metadata.industry.trim() && metadata.industry !== "general_technology") {
        result.cleaned.industry = {
          key: metadata.industry.trim().toLowerCase().replace(/[\s-]+/g, "_"),
          label: metadata.industry.trim(),
        };
      }
    }

    // 3. Business Problem Validation
    if (metadata.businessProblem) {
      if (typeof metadata.businessProblem === "object" && metadata.businessProblem.key && typeof metadata.businessProblem.key === "string") {
        result.cleaned.businessProblem = {
          key: metadata.businessProblem.key.trim().toLowerCase().replace(/[\s-]+/g, "_"),
          label: String(metadata.businessProblem.label || metadata.businessProblem.key).trim(),
        };
      } else if (typeof metadata.businessProblem === "string" && metadata.businessProblem.trim()) {
        result.cleaned.businessProblem = {
          key: metadata.businessProblem.trim().toLowerCase().replace(/[\s-]+/g, "_"),
          label: metadata.businessProblem.trim(),
        };
      }
    }

    // 4. Solution Type Validation
    if (metadata.solutionType && typeof metadata.solutionType === "string") {
      result.cleaned.solutionType = metadata.solutionType.trim();
    }

    // 5. Service Intent Validation
    if (metadata.serviceIntent && typeof metadata.serviceIntent === "object") {
      let relevant = Boolean(metadata.serviceIntent.relevant);
      let serviceKey = metadata.serviceIntent.serviceKey ? String(metadata.serviceIntent.serviceKey).trim() : null;
      let confidence = Number(metadata.serviceIntent.confidence);

      if (isNaN(confidence) || confidence < 0 || confidence > 1) {
        result.warnings.push(`Invalid confidence score '${metadata.serviceIntent.confidence}'. Clamping to bounds [0, 1].`);
        confidence = isNaN(confidence) ? 0 : Math.min(1, Math.max(0, confidence));
      }

      if (typeof metadata.serviceIntent.relevant !== "boolean") {
        result.warnings.push(`serviceIntent.relevant was not boolean (got ${typeof metadata.serviceIntent.relevant}). Cast to ${relevant}.`);
      }

      result.cleaned.serviceIntent = {
        relevant,
        serviceKey: relevant ? serviceKey : null,
        confidence: relevant ? (confidence || 0.8) : 0,
      };
    }

    // 6. Geo Context Validation
    if (metadata.geoContext && typeof metadata.geoContext === "object") {
      result.cleaned.geoContext = {
        type: String(metadata.geoContext.type || "global").trim(),
        ...(metadata.geoContext.region ? { region: String(metadata.geoContext.region).trim() } : {}),
      };
    }

    if (result.warnings.length > 0) {
      result.valid = false;
      console.warn(`[TopicIntelligenceValidation] Warnings for '${topicTitle}':`, result.warnings.join(" | "));
    }
  } catch (error) {
    result.valid = false;
    console.error(`[TopicIntelligenceValidation] Error validating metadata for '${topicTitle}'. Falling back to safe defaults:`, error.message);
  }

  return result.cleaned;
}

/**
 * Deterministically sanitizes and refines topic and blog titles.
 * Eliminates repetitive AI stock openers like "Beyond...", "Engineering...", "Architecting...",
 * "Mastering...", "Demystifying...", and robotic subtitle clauses.
 *
 * @param {string} rawTitle - Raw title from Gemini AI or user input
 * @param {Object} [plan={}] - Topic plan metadata (for smart fallback)
 * @returns {string} - Clean, dynamic, human-crafted title
 */
export function sanitizeTopicTitle(rawTitle = "", plan = {}) {
  let title = String(rawTitle || "").trim();
  if (!title) return "Modern Web Architecture & Engineering Guide";

  // 1. Repetitive stock openers to strip from title start
  const repetitivePrefixPatterns = [
    // Beyond variations (e.g., "Beyond Booksy:", "Beyond the Spreadsheet:", "Beyond:")
    /^beyond(?:\s+the|\s+a|\s+an|\s+green|\s+manual)?(?:\s+[^:]+)?:\s*/i,
    /^beyond\s+/i,
    // Engineering variations at start
    /^(?:an?\s+)?engineering\s+(?:guide\s+to\s+|playbook\s+for\s+|for\s+)/i,
    /^engineering\s+the\s+/i,
    /^engineering\s+/i,
    // Architecting variations at start
    /^(?:an?\s+)?architecting\s+(?:guide\s+to\s+|playbook\s+for\s+|for\s+)/i,
    /^architecting\s+the\s+/i,
    /^architecting\s+/i,
    // Other formulaic stock openers
    /^mastering\s+/i,
    /^(?:the\s+)?complete\s+guide\s+to\s+/i,
    /^(?:the\s+)?ultimate\s+guide\s+to\s+/i,
    /^a\s+comprehensive\s+guide\s+to\s+/i,
    /^(?:the\s+)?definitive\s+guide\s+to\s+/i,
    /^demystifying\s+/i,
    /^unlocking\s+/i,
    /^navigating\s+/i,
    /^(?:a\s+)?deep\s+dive\s+into\s+/i,
    /^(?:the\s+)?hidden\s+costs?\s+of\s+/i,
  ];

  let cleaned = true;
  let passes = 0;
  while (cleaned && passes < 4) {
    cleaned = false;
    passes += 1;
    for (const pattern of repetitivePrefixPatterns) {
      if (pattern.test(title)) {
        title = title.replace(pattern, "").trim();
        title = title.charAt(0).toUpperCase() + title.slice(1);
        title = title.replace(/^[:\-–—\s]+|[:\-–—\s]+$/g, "").trim();
        cleaned = true;
        break;
      }
    }
  }

  // 2. Clean robotic subtitle clichés like ": Engineering an? ..." or ": An Engineering Guide for ..."
  title = title
    .replace(/:\s*an?\s+engineering\s+guide\s+(?:to|for)\s+/i, ": Practical Guide for ")
    .replace(/:\s*engineering\s+an?\s+/i, ": Building a ")
    .replace(/:\s*engineering\s+/i, ": Systems for ")
    .replace(/:\s*architecting\s+an?\s+/i, ": Designing a ")
    .replace(/:\s*architecting\s+/i, ": Systems for ")
    .replace(/:\s*beyond\s+/i, ": Replacing ")
    .trim();

  // 3. Fix grammar and dangling punctuation
  title = title
    .replace(/\s*::+\s*/g, ": ")
    .replace(/^[:\-–—\s]+|[:\-–—\s]+$/g, "")
    .trim();

  if (/^(?:a|an|the)\s+/i.test(title)) {
    title = title.charAt(0).toUpperCase() + title.slice(1);
  }

  // 4. Ensure non-trivial length & semantic fallback
  if (title.length < 15) {
    if (plan.solutionAngle) {
      const angle = String(plan.solutionAngle).trim();
      title = `${title ? title + ": " : ""}${angle.charAt(0).toUpperCase() + angle.slice(1)}`;
      if (title.length > 80) title = title.slice(0, 77) + "...";
    } else {
      title = title || "Modern Web Architecture & Engineering Guide";
    }
  }

  return title;
}

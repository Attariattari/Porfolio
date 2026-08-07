import { BlogTopicPlan } from "@/models/BlogTopicPlan";

const TECHNOLOGIES = [
  ["nextjs", /\bnext\.?js\b/i],
  ["react", /\breact(?:\.?js)?\b/i],
  ["nodejs", /\bnode(?:\.?js)?\b/i],
  ["mongodb", /\bmongo(?:db)?\b/i],
  ["mern", /\bmern\b/i],
  ["apis", /\bapi(?:s)?\b|webhook/i],
  ["ai", /\bai\b|\bllm\b|artificial intelligence/i],
  ["technical-seo", /technical seo|indexation|crawlability|schema markup/i],
  ["devops", /\bdevops\b|deployment|observability|ci\/cd/i],
  ["security", /security|authentication|authorization|vulnerability/i],
  ["uiux", /\bui\b|\bux\b|accessibility|design system/i],
];

const normalize = (value = "") => String(value).toLowerCase().replace(/[^a-z0-9+#.\s-]/g, " ").replace(/\s+/g, " ").trim();
const DAY = 86400000;

export function derivePrimaryTechnology(topic = {}) {
  if (topic.primaryTechnology) return normalize(topic.primaryTechnology).replace(/\s+/g, "-");
  const text = [topic.title, topic.topicFamily, topic.pillar, topic.subtopic, topic.focusKeyword, topic.problem].filter(Boolean).join(" ");
  return TECHNOLOGIES.find(([, pattern]) => pattern.test(text))?.[0] || normalize(topic.contentCategory || "general-technology").replace(/\s+/g, "-");
}

function familyKey(topic = {}) {
  return normalize(topic.topicFamily || topic.focusKeyword || topic.subtopic).replace(/\s+/g, "-");
}

function completedAt(plan) {
  const date = new Date(plan.usedAt || plan.updatedAt || plan.createdAt || 0);
  return Number.isFinite(date.getTime()) ? date : new Date(0);
}

export async function evaluateTopicCooldown(candidate, now = new Date()) {
  const primaryTechnology = derivePrimaryTechnology(candidate);
  if (candidate.articleType === "supporting") return { eligible: true, primaryTechnology, reason: "Core Supporting sequence exception." };
  if (candidate.articleType === "verified_trend" && ["high", "critical"].includes(candidate.trendPriority)) {
    return { eligible: true, primaryTechnology, reason: "Verified urgent trend override." };
  }

  const history = await BlogTopicPlan.find({ status: "used", _id: { $ne: candidate._id } })
    .sort({ usedAt: -1, updatedAt: -1 })
    .limit(120)
    .select("title articleType primaryTechnology topicFamily focusKeyword subtopic format audience relatedServiceSlugs usedAt updatedAt createdAt")
    .lean();
  const technologyMatch = history.find((plan) => derivePrimaryTechnology(plan) === primaryTechnology && now - completedAt(plan) < 7 * DAY);
  if (technologyMatch) {
    const until = new Date(completedAt(technologyMatch).getTime() + 7 * DAY);
    return { eligible: false, primaryTechnology, until, reason: `Primary technology ${primaryTechnology} was covered within the last 7 days.` };
  }

  const candidateFamily = familyKey(candidate);
  const familyMatch = candidateFamily && history.find((plan) => familyKey(plan) === candidateFamily && now - completedAt(plan) < 30 * DAY);
  if (familyMatch) {
    const until = new Date(completedAt(familyMatch).getTime() + 30 * DAY);
    return { eligible: false, primaryTechnology, until, reason: `Topic family ${candidateFamily} is inside its 30-day cooldown.` };
  }

  const services = new Set(candidate.relatedServiceSlugs || []);
  if (services.size && history.slice(0, 4).some((plan) => (plan.relatedServiceSlugs || []).some((slug) => services.has(slug)))) {
    return { eligible: false, primaryTechnology, until: new Date(now.getTime() + DAY), reason: "A related service focus appears in the last 4 completed topics." };
  }
  if (candidate.format && normalize(history[0]?.format) === normalize(candidate.format)) {
    return { eligible: false, primaryTechnology, until: new Date(now.getTime() + DAY), reason: "The same article format cannot run back-to-back." };
  }
  if (candidate.audience && history.length >= 2 && history.slice(0, 2).every((plan) => normalize(plan.audience) === normalize(candidate.audience))) {
    return { eligible: false, primaryTechnology, until: new Date(now.getTime() + DAY), reason: "The same audience has already received two consecutive articles." };
  }
  return { eligible: true, primaryTechnology, reason: "Cooldown checks passed." };
}

export async function recordCooldownDecision(topicId, decision) {
  if (!topicId || !decision) return;
  await BlogTopicPlan.updateOne(
    { _id: topicId, status: { $in: ["planned", "ready"] } },
    decision.eligible
      ? { $set: { primaryTechnology: decision.primaryTechnology }, $unset: { cooldownUntil: 1, cooldownReason: 1 } }
      : { $set: { primaryTechnology: decision.primaryTechnology, cooldownUntil: decision.until, cooldownReason: decision.reason } },
  );
}

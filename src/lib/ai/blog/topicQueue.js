import dbConnect from "@/lib/dbConnect";
import { generateGeminiResponse } from "@/lib/geminiService";
import { findNearDuplicateBlog } from "@/lib/blogSeo";
import { Blog } from "@/models/Portfolio";
import { BlogTopicPlan } from "@/models/BlogTopicPlan";

const PILLARS = [
  "Web Development",
  "Next.js",
  "React",
  "MERN",
  "Node.js",
  "MongoDB",
  "APIs",
  "Performance",
  "Technical SEO",
  "Security",
  "Deployment",
  "UI/UX",
  "Website cost/planning",
  "AI for web development",
];

const FALLBACK_BLUEPRINTS = [
  { pillar: "Next.js & React", value: "faster, more reliable frontend releases", items: [["cache revalidation", "stale production content", "designing explicit revalidation and invalidation boundaries", "Next.js cache revalidation"], ["server component boundaries", "unnecessary client-side JavaScript", "separating server data work from interactive client islands", "React server component architecture"], ["hydration stability", "interfaces that break after deployment", "eliminating browser/server rendering mismatches", "Next.js hydration errors"], ["route-level loading", "slow pages with poor feedback", "using streaming, loading boundaries and progressive rendering", "Next.js loading states"]] },
  { pillar: "Backend & APIs", value: "safer integrations and easier system growth", items: [["webhook reliability", "lost or duplicated business events", "adding signatures, idempotency and retry-safe processing", "reliable webhook processing"], ["API error contracts", "frontends that cannot recover from backend failures", "standardizing errors, validation and recovery metadata", "API error handling"], ["rate limiting", "public endpoints exposed to abuse", "designing identity-aware limits and useful retry behavior", "API rate limiting"], ["background jobs", "slow requests blocked by heavy work", "moving durable work into observable asynchronous queues", "Node.js background jobs"]] },
  { pillar: "Databases", value: "cleaner data, faster queries and lower maintenance risk", items: [["MongoDB indexing", "queries that become slow as data grows", "matching compound indexes to real access patterns", "MongoDB indexing strategy"], ["schema evolution", "production data breaking after feature changes", "using backward-compatible migrations and validation", "MongoDB schema migration"], ["aggregation design", "analytics queries consuming excessive resources", "reducing pipeline work and grouping at the right stage", "MongoDB aggregation performance"], ["data consistency", "duplicate or conflicting business records", "enforcing unique identities and atomic updates", "database data consistency"]] },
  { pillar: "Performance", value: "faster experiences and stronger conversion confidence", items: [["image delivery", "large media slowing otherwise good websites", "combining responsive formats, sizing and caching", "website image optimization"], ["JavaScript budgets", "interactive pages shipping too much code", "measuring route bundles and removing avoidable client work", "reduce website JavaScript"], ["Core Web Vitals", "good-looking pages that feel slow", "diagnosing LCP, INP and layout instability from field data", "Core Web Vitals optimization"], ["third-party scripts", "analytics and widgets damaging responsiveness", "loading external scripts by priority and consent", "third party script performance"]] },
  { pillar: "Technical SEO", value: "better crawlability and qualified organic discovery", items: [["canonical architecture", "duplicate URLs competing in search", "creating one intentional canonical identity per page", "canonical URL strategy"], ["structured data", "search engines missing important business context", "adding accurate schema tied to visible content", "structured data for websites"], ["programmatic metadata", "large sites publishing weak repeated metadata", "generating page-specific titles and descriptions safely", "dynamic SEO metadata"], ["indexation control", "private or low-value routes appearing in search", "coordinating robots rules, sitemaps and page status", "website indexation control"]] },
  { pillar: "DevOps & Deployment", value: "more predictable releases with less operational stress", items: [["deployment previews", "changes reaching production without realistic review", "using isolated previews with production-like checks", "deployment preview workflow"], ["environment configuration", "secrets and settings drifting between environments", "validating configuration before application startup", "environment variable validation"], ["rollback design", "failed releases taking too long to recover", "keeping deployments reversible and data changes compatible", "safe deployment rollback"], ["CI quality gates", "broken code passing through automated deployment", "running focused tests, lint and build checks before release", "CI quality gates"]] },
  { pillar: "AI Workflows & Automation", value: "useful automation without sacrificing control or trust", items: [["structured AI output", "automation breaking on unpredictable model responses", "combining JSON schemas, validation and retry boundaries", "structured AI output validation"], ["human approval loops", "AI publishing decisions without enough oversight", "designing review states and safe escalation paths", "human in the loop AI workflow"], ["AI fallback design", "model outages stopping business workflows", "adding deterministic fallbacks and resumable processing", "AI workflow fallback"], ["prompt versioning", "AI behavior changing without traceability", "tracking prompt versions, inputs and evaluated outcomes", "AI prompt versioning"]] },
  { pillar: "Security", value: "lower exposure while keeping legitimate users productive", items: [["session security", "long-lived sessions increasing account risk", "rotating credentials and enforcing bounded session lifetimes", "secure session management"], ["role permissions", "admin users receiving unnecessary access", "modeling least-privilege roles and action-level permissions", "admin role permissions"], ["file upload safety", "user uploads becoming an attack path", "validating file identity, storage and delivery boundaries", "secure file uploads"], ["security headers", "modern websites missing browser protections", "applying CSP and response headers without breaking features", "website security headers"]] },
  { pillar: "UI/UX Engineering", value: "clearer products that users can understand and trust", items: [["dashboard hierarchy", "important actions disappearing inside dense admin screens", "organizing information around decisions and urgency", "admin dashboard information hierarchy"], ["form recovery", "users losing work after validation errors", "preserving input and explaining actionable corrections", "professional form validation UX"], ["responsive data views", "desktop tables becoming unusable on mobile", "switching layouts while preserving task context", "responsive dashboard tables"], ["accessible interactions", "keyboard and assistive technology users blocked", "building focus, labels and states into components", "accessible web interactions"]] },
];

const ALLOWED_SERVICES = new Set([
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

const normalize = (value = "") => String(value).toLowerCase().replace(/[^a-z0-9+#.\s-]/g, " ").replace(/\s+/g, " ").trim();
export const buildTopicFingerprint = (plan = {}) => [plan.articleType, plan.clusterKey, plan.pillar, plan.subtopic, plan.problem, plan.solutionAngle, plan.focusKeyword].map(normalize).filter(Boolean).join("::");

function planAsBlog(plan) {
  return { slug: plan.fingerprint || buildTopicFingerprint(plan), title: plan.title, summary: [plan.problem, plan.solutionAngle, plan.businessValue].filter(Boolean).join(" "), category: plan.pillar, focusKeyword: plan.focusKeyword, tags: [plan.subtopic, plan.audience, plan.format].filter(Boolean) };
}

function cleanPlan(plan, source = "ai") {
  const cleaned = {
    title: String(plan.title || "").trim(),
    articleType: plan.articleType === "pillar" ? "pillar" : "supporting",
    clusterKey: String(plan.clusterKey || "").trim(),
    clusterTitle: String(plan.clusterTitle || "").trim(),
    clusterOrder: Math.min(2, Math.max(0, Number(plan.clusterOrder) || 0)),
    parentTopicId: plan.parentTopicId || null,
    pillar: String(plan.pillar || "Web Development").trim(),
    subtopic: String(plan.subtopic || "").trim(),
    problem: String(plan.problem || "").trim(),
    solutionAngle: String(plan.solutionAngle || "").trim(),
    businessValue: String(plan.businessValue || "").trim(),
    audience: String(plan.audience || "Founders and developers").trim(),
    focusKeyword: String(plan.focusKeyword || "").trim(),
    searchIntent: ["informational", "commercial", "transactional", "navigational"].includes(plan.searchIntent) ? plan.searchIntent : "informational",
    format: String(plan.format || "Problem-solution guide").trim(),
    relatedServiceSlugs: Array.isArray(plan.relatedServiceSlugs) ? [...new Set(plan.relatedServiceSlugs)].filter((slug) => ALLOWED_SERVICES.has(slug)).slice(0, 3) : [],
    priority: Math.min(100, Math.max(0, Number(plan.priority) || 50)),
    scheduledFor: plan.scheduledFor ? new Date(plan.scheduledFor) : null,
    notes: String(plan.notes || "").trim(),
    source,
    status: plan.status,
  };
  cleaned.fingerprint = buildTopicFingerprint(cleaned);
  return cleaned;
}

function buildFallbackClusterPacks() {
  return FALLBACK_BLUEPRINTS.map((group) => {
    const clusterKey = normalize(group.pillar).replace(/\s+/g, "-");
    const [first, second] = group.items;
    return {
      clusterKey,
      clusterTitle: group.pillar,
      pillar: {
        articleType: "pillar",
        clusterKey,
        clusterTitle: group.pillar,
        clusterOrder: 0,
        title: `The Complete ${group.pillar} Guide for Production Web Systems`,
        pillar: group.pillar,
        subtopic: `complete ${group.pillar.toLowerCase()} strategy`,
        problem: `teams need one reliable framework for making ${group.pillar.toLowerCase()} decisions without fragmented advice`,
        solutionAngle: `connect foundations, architecture decisions, tradeoffs, implementation guidance, mistakes, checklists and measurable business outcomes`,
        businessValue: group.value,
        audience: "Founders, technical leads and web development teams",
        focusKeyword: `${group.pillar.toLowerCase()} guide`,
        searchIntent: "informational",
        format: "Premium pillar guide",
        relatedServiceSlugs: [],
        priority: 40,
      },
      supporting: [first, second].map(([subtopic, problem, solutionAngle, focusKeyword], index) => ({
        articleType: "supporting",
        clusterKey,
        clusterTitle: group.pillar,
        clusterOrder: index + 1,
        title: `How to Fix ${problem}: ${subtopic} in Practice`,
        pillar: group.pillar,
        subtopic,
        problem,
        solutionAngle,
        businessValue: group.value,
        audience: "Founders, product teams and developers",
        focusKeyword,
        searchIntent: "informational",
        format: "Focused supporting guide",
        relatedServiceSlugs: [],
        priority: 35 - index,
      })),
    };
  });
}

function flattenClusterPack(pack, source, status) {
  const pillar = cleanPlan({ ...pack.pillar, clusterKey: pack.clusterKey, clusterTitle: pack.clusterTitle, articleType: "pillar", clusterOrder: 0, status }, source);
  const supportingStatus = source === "ai" && status === "planned" ? "ready" : status;
  const supporting = (pack.supporting || []).slice(0, 2).map((topic, index) => cleanPlan({ ...topic, clusterKey: pack.clusterKey, clusterTitle: pack.clusterTitle, articleType: "supporting", clusterOrder: index + 1, status: supportingStatus }, source));
  return { pillar, supporting };
}

async function insertClusterPacks(packs, source, status, existingBlogs, historicalPlans, maxClusters = Number.POSITIVE_INFINITY) {
  const acceptedPlans = [...historicalPlans];
  const knownClusterKeys = new Set(historicalPlans.map((plan) => normalize(plan.clusterKey)).filter(Boolean));
  const insertedTopicIds = [];
  let clusters = 0;
  let topics = 0;
  for (const rawPack of packs) {
    if (clusters >= maxClusters) break;
    const pack = flattenClusterPack(rawPack, source, status);
    const all = [pack.pillar, ...pack.supporting];
    const normalizedClusterKey = normalize(pack.pillar.clusterKey);
    if (!normalizedClusterKey || knownClusterKeys.has(normalizedClusterKey)) continue;
    if (all.length !== 3 || all.some((plan) => !plan.title || !plan.focusKeyword || !plan.problem || !plan.solutionAngle || normalize(plan.clusterKey) !== normalizedClusterKey)) continue;
    const conflicts = all.some((plan, index) =>
      findNearDuplicateBlog(planAsBlog(plan), existingBlogs) ||
      findNearDuplicateBlog(planAsBlog(plan), acceptedPlans.map(planAsBlog)) ||
      findNearDuplicateBlog(planAsBlog(plan), all.slice(0, index).map(planAsBlog)),
    );
    if (conflicts) continue;
    let pillar = null;
    try {
      pillar = await BlogTopicPlan.create(pack.pillar);
      const supporting = pack.supporting.map((plan) => ({ ...plan, parentTopicId: pillar._id }));
      const insertedSupporting = await BlogTopicPlan.insertMany(supporting, { ordered: true });
      insertedTopicIds.push(pillar._id, ...insertedSupporting.map((plan) => plan._id));
      acceptedPlans.push(pack.pillar, ...supporting);
      knownClusterKeys.add(normalizedClusterKey);
      clusters += 1;
      topics += 3;
    } catch (error) {
      if (pillar?._id) {
        await BlogTopicPlan.deleteMany({
          $or: [{ _id: pillar._id }, { parentTopicId: pillar._id }],
          status: { $ne: "used" },
        });
      }
      if (error?.code !== 11000) throw error;
    }
  }
  return { clusters, topics, insertedTopicIds };
}

/**
 * Initial AI topic generation: Exactly 10 complete content clusters (10 Pillars + 20 Supporting = 30 topics).
 * Topics are strictly restricted to Muhyo Tech's professional web development niche.
 * Existing used topics are preserved.
 */
export async function rebuildClusterTopicCatalog({ targetClusters = 10 } = {}) {
  await dbConnect();
  const processing = await BlogTopicPlan.countDocuments({ status: "processing" });
  if (processing) throw new Error("A topic is currently processing. Finish that blog run before rebuilding the catalog.");

  const [blogs, usedPlans, unusedPlans] = await Promise.all([
    Blog.find().sort({ createdAt: -1 }).limit(500).select("title summary category tags focusKeyword slug").lean(),
    BlogTopicPlan.find({ status: "used" }).select("title pillar subtopic problem solutionAngle businessValue audience focusKeyword format fingerprint articleType clusterKey").lean(),
    BlogTopicPlan.find({ status: { $ne: "used" } }).lean(),
  ]);

  const avoid = [...blogs.map((item) => `${item.title} | ${item.focusKeyword || ""}`), ...usedPlans.map((item) => `${item.title} | ${item.focusKeyword || ""}`)].join("\n");
  const candidateTarget = Math.min(16, targetClusters + 4);
  const prompt = `Create ${candidateTarget} unique topical-authority cluster candidates for Muhyo Tech. Muhyo Tech is a professional web engineering and software brand.

STRICT NICHE MANDATE: ALL generated topics MUST be strictly in these web development niches:
- Web Development
- Next.js
- React
- MERN
- Node.js
- MongoDB
- APIs
- Performance
- Technical SEO
- Security
- Deployment
- UI/UX
- Website cost/planning
- AI for web development

STRICT NEGATIVE CONSTRAINT: Absolutely DO NOT generate technology news, mobile phone reviews, crypto, gaming, gadget reviews, or unrelated topics.

The system will accept the best ${targetClusters} complete content clusters after duplicate validation.
Each cluster MUST contain:
- Exactly 1 Pillar topic: articleType "pillar", clusterOrder 0, suitable for a detailed 2,000-3,500 word authority guide, status "planned".
- Exactly 2 Supporting topics: articleType "supporting", clusterOrder 1 and 2, suitable for focused 900-1,200 word practical guides, status "ready".

Do not repeat or closely overlap any existing blog or used topic. Rotate across: ${PILLARS.join(", ")}.

EXISTING BLOGS AND USED TOPICS TO AVOID:
${avoid}

Return strict JSON: {"clusters":[{"clusterKey":"","clusterTitle":"","pillar":{"title":"","pillar":"","subtopic":"","problem":"","solutionAngle":"","businessValue":"","audience":"","focusKeyword":"","searchIntent":"informational","format":"Premium pillar guide","relatedServiceSlugs":[],"priority":80},"supporting":[{"title":"","pillar":"","subtopic":"","problem":"","solutionAngle":"","businessValue":"","audience":"","focusKeyword":"","searchIntent":"informational","format":"Focused supporting guide","relatedServiceSlugs":[],"priority":70},{"title":"","pillar":"","subtopic":"","problem":"","solutionAngle":"","businessValue":"","audience":"","focusKeyword":"","searchIntent":"informational","format":"Focused supporting guide","relatedServiceSlugs":[],"priority":69}]}]}`;

  let aiPacks = [];
  try {
    const raw = await generateGeminiResponse(prompt, {
      temperature: 0.75,
      responseMimeType: "application/json",
      maxOutputTokens: 16384,
      thinkingBudget: 0,
      timeoutMs: Math.max(90000, Number(process.env.AI_TOPIC_QUEUE_TIMEOUT_MS) || 120000),
    });
    const parsed = JSON.parse(raw.replace(/```json/gi, "").replace(/```/g, "").trim());
    aiPacks = Array.isArray(parsed.clusters) ? parsed.clusters.slice(0, candidateTarget) : [];
  } catch (error) {
    throw new Error(`Gemini could not prepare the initial 10-cluster queue: ${error.message}`);
  }

  await BlogTopicPlan.deleteMany({ status: { $ne: "used" } });
  try {
    const ai = await insertClusterPacks(aiPacks, "ai", "planned", blogs, usedPlans, targetClusters);
    if (ai.clusters !== targetClusters || ai.topics !== targetClusters * 3) {
      throw new Error(`Gemini produced only ${ai.clusters} duplicate-safe complete clusters; exactly ${targetClusters} are required. Previous queue will be restored.`);
    }
    return {
      success: true,
      removedUnused: unusedPlans.length,
      ai: { clusters: ai.clusters, pillarCount: ai.clusters, supportingCount: ai.topics - ai.clusters, topics: ai.topics },
      preservedUsed: usedPlans.length,
    };
  } catch (error) {
    await BlogTopicPlan.deleteMany({ status: { $ne: "used" } });
    if (unusedPlans.length) {
      await BlogTopicPlan.insertMany(unusedPlans, { ordered: false });
    }
    throw error;
  }
}

/**
 * Refill Rule: Automatically appends 5 new complete content clusters (5 Pillars + 10 Supporting = 15 topics) via Gemini AI when 5 clusters are consumed.
 */
export async function appendAiClusters({ targetClusters = 5 } = {}) {
  await dbConnect();
  const [blogs, queuedPlans] = await Promise.all([
    Blog.find().sort({ createdAt: -1 }).limit(500).select("title summary category tags focusKeyword slug").lean(),
    BlogTopicPlan.find().select("title pillar subtopic problem solutionAngle businessValue audience focusKeyword format fingerprint articleType clusterKey").lean(),
  ]);

  const avoid = [...blogs.map((item) => `${item.title} | ${item.focusKeyword || ""}`), ...queuedPlans.map((item) => `${item.title} | ${item.focusKeyword || ""}`)].join("\n");
  const candidateTarget = targetClusters + 3;
  const prompt = `Create ${candidateTarget} unique topical-authority cluster candidates for Muhyo Tech. Muhyo Tech is a professional web engineering and software brand.

STRICT NICHE MANDATE: ALL topics MUST be strictly in these web development niches: Web Development, Next.js, React, MERN, Node.js, MongoDB, APIs, Performance, Technical SEO, Security, Deployment, UI/UX, Website cost/planning, AI for web development.
STRICT NEGATIVE CONSTRAINT: Absolutely DO NOT generate tech news, mobile phone reviews, crypto, gaming, or non-web development topics.

Each cluster MUST contain:
- 1 Pillar topic: articleType "pillar", clusterOrder 0, 2,000-3,500 word authority guide, status "planned".
- 2 Supporting topics: articleType "supporting", clusterOrder 1 and 2, 900-1,200 word practical guides, status "ready".

Rotate across: ${PILLARS.join(", ")}.

EXISTING BLOGS AND QUEUED TOPICS TO AVOID:
${avoid}

Return strict JSON: {"clusters":[{"clusterKey":"","clusterTitle":"","pillar":{"title":"","pillar":"","subtopic":"","problem":"","solutionAngle":"","businessValue":"","audience":"","focusKeyword":"","searchIntent":"informational","format":"Premium pillar guide","relatedServiceSlugs":[],"priority":80},"supporting":[{"title":"","pillar":"","subtopic":"","problem":"","solutionAngle":"","businessValue":"","audience":"","focusKeyword":"","searchIntent":"informational","format":"Focused supporting guide","relatedServiceSlugs":[],"priority":70},{"title":"","pillar":"","subtopic":"","problem":"","solutionAngle":"","businessValue":"","audience":"","focusKeyword":"","searchIntent":"informational","format":"Focused supporting guide","relatedServiceSlugs":[],"priority":69}]}]}`;

  let aiPacks = [];
  try {
    const raw = await generateGeminiResponse(prompt, {
      temperature: 0.75,
      responseMimeType: "application/json",
      maxOutputTokens: 16384,
      thinkingBudget: 0,
      timeoutMs: Math.max(90000, Number(process.env.AI_TOPIC_QUEUE_TIMEOUT_MS) || 120000),
    });
    const parsed = JSON.parse(raw.replace(/```json/gi, "").replace(/```/g, "").trim());
    aiPacks = Array.isArray(parsed.clusters) ? parsed.clusters.slice(0, candidateTarget) : [];
  } catch (error) {
    console.warn("[TopicQueue] Gemini cluster refill failed:", error.message);
    throw new Error(`Gemini could not prepare the 5-cluster refill: ${error.message}`);
  }

  const result = await insertClusterPacks(aiPacks, "ai", "planned", blogs, queuedPlans, targetClusters);
  if (result.clusters !== targetClusters || result.topics !== targetClusters * 3) {
    if (result.insertedTopicIds.length) {
      await BlogTopicPlan.deleteMany({ _id: { $in: result.insertedTopicIds }, status: { $ne: "used" } });
    }
    throw new Error(`Gemini refill produced only ${result.clusters} duplicate-safe complete clusters; exactly ${targetClusters} are required. No partial refill was kept.`);
  }
  return { success: true, clusters: result.clusters, topics: result.topics, pillarCount: result.clusters, supportingCount: result.topics - result.clusters };
}
async function countCompletedAiClusters() {
  const completed = await BlogTopicPlan.aggregate([
    { $match: { source: "ai", status: "used", clusterKey: { $nin: [null, ""] } } },
    { $group: {
      _id: "$clusterKey",
      pillarCount: { $sum: { $cond: [{ $and: [{ $eq: ["$articleType", "pillar"] }, { $eq: ["$clusterOrder", 0] }] }, 1, 0] } },
      supportingOrders: { $addToSet: { $cond: [{ $eq: ["$articleType", "supporting"] }, "$clusterOrder", null] } },
    } },
    { $match: { pillarCount: 1, supportingOrders: { $all: [1, 2] } } },
    { $count: "count" },
  ]);
  return completed[0]?.count || 0;
}

export async function reconcileFallbackTopics() {
  await dbConnect();
  return { primaryReady: 0, fallbackReady: 0, commercialSeeded: 0 };
}

export async function createTopicPlan(input, source = "manual") {
  await dbConnect();
  const plan = cleanPlan(input, source);
  if (!plan.title || !plan.subtopic || !plan.problem || !plan.solutionAngle || !plan.focusKeyword || !plan.fingerprint) throw new Error("Title, subtopic, problem, solution angle and focus keyword are required.");
  const existingBlogs = await Blog.find().sort({ createdAt: -1 }).limit(500).select("title summary category tags focusKeyword slug").lean();
  const duplicate = findNearDuplicateBlog(planAsBlog(plan), existingBlogs);
  if (duplicate) throw new Error(`Topic is too similar to existing blog: ${duplicate.title}`);
  return BlogTopicPlan.create(plan);
}

export async function refillTopicQueue({ target = 30, threshold = 15, force = false } = {}) {
  await dbConnect();
  const [activePillarClusters, completedClusters] = await Promise.all([
    BlogTopicPlan.countDocuments({ source: "ai", articleType: "pillar", status: { $in: ["planned", "processing"] } }),
    countCompletedAiClusters(),
  ]);
  if (!force && (completedClusters < 5 || activePillarClusters > 5)) {
    return { success: true, generated: 0, ready: activePillarClusters, completedClusters, skipped: true };
  }
  const refillResult = await appendAiClusters({ targetClusters: 5 });
  const newActivePillars = await BlogTopicPlan.countDocuments({ source: "ai", articleType: "pillar", status: { $in: ["planned", "processing"] } });
  return { success: true, generated: refillResult.topics || 0, ready: newActivePillars, completedClusters };
}

export async function activateFallbackTopics(limit = 30) {
  return { activated: 0, reason: "primary_topics_available" };
}

export async function reconcileUsedTopicPlans() {
  await dbConnect();
  const linkedBlogs = await Blog.find({ topicPlanId: { $ne: null } })
    .select("_id topicPlanId createdAt generatedAt")
    .lean();
  if (!linkedBlogs.length) return { reconciled: 0, linkedTopicIds: [] };

  const operations = linkedBlogs.map((blog) => ({
    updateOne: {
      filter: { _id: blog.topicPlanId },
      update: {
        $set: {
          status: "used",
          usedAt: blog.generatedAt || blog.createdAt || new Date(),
          usedByBlogId: blog._id,
        },
        $unset: { processingStartedAt: 1, failureReason: 1 },
      },
    },
  }));
  const result = await BlogTopicPlan.bulkWrite(operations, { ordered: false });
  return {
    reconciled: result.modifiedCount || 0,
    linkedTopicIds: linkedBlogs.map((blog) => blog.topicPlanId),
  };
}

async function recoverStaleTopics() {
  const cutoff = new Date(Date.now() - 30 * 60 * 1000);
  const { linkedTopicIds } = await reconcileUsedTopicPlans();
  const staleBase = {
    status: "processing",
    processingStartedAt: { $lt: cutoff },
    retryCount: { $lt: 3 },
    _id: { $nin: linkedTopicIds },
  };
  const recoveryUpdate = (status) => ({
    $set: {
      status,
      failureReason: "Recovered after interrupted generation.",
    },
    $inc: { retryCount: 1 },
    $unset: { processingStartedAt: 1 },
  });
  await BlogTopicPlan.updateMany(
    { ...staleBase, articleType: "pillar" },
    recoveryUpdate("planned"),
  );
  await BlogTopicPlan.updateMany(
    { ...staleBase, articleType: "supporting" },
    recoveryUpdate("ready"),
  );
}

async function takeTopic(filter, sort) {
  return BlogTopicPlan.findOneAndUpdate(
    filter,
    {
      $set: { status: "processing", processingStartedAt: new Date() },
      $unset: { failureReason: 1 },
    },
    { new: true, sort },
  );
}

async function addParentPillarContext(topic, existingParentBlog = null) {
  if (!topic) return null;
  const result = topic.toObject ? topic.toObject() : topic;
  if (existingParentBlog) {
    return {
      ...result,
      parentPillarBlog: existingParentBlog,
    };
  }
  if (!topic.parentTopicId) return result;
  const parentTopic = await BlogTopicPlan.findById(topic.parentTopicId)
    .select("title usedByBlogId clusterKey")
    .lean();
  if (!parentTopic?.usedByBlogId) return result;
  const parentBlog = await Blog.findById(parentTopic.usedByBlogId)
    .select("_id title slug")
    .lean();
  return {
    ...result,
    parentPillarBlog: parentBlog || null,
  };
}

/**
 * Strict Order & Protection Rule 4:
 * A Supporting topic is NEVER selected unless:
 * 1. Its parent Pillar topic status is 'used'.
 * 2. Its parent topic has usedByBlogId linked to an actual Blog in DB.
 * 3. The actual parent Blog exists in DB AND has articleType: "pillar".
 *
 * Sequence: Pillar Blog -> Supporting Blog 1 -> Supporting Blog 2 -> Next Pillar Blog
 */
async function takeClusterTopic(source = "ai") {
  const completedPillars = await BlogTopicPlan.find({
    source,
    articleType: "pillar",
    status: "used",
    usedByBlogId: { $ne: null },
  })
    .sort({ usedAt: 1, createdAt: 1 })
    .select("_id usedByBlogId")
    .lean();

  for (const pillar of completedPillars) {
    const children = await BlogTopicPlan.find({
      source,
      articleType: "supporting",
      parentTopicId: pillar._id,
    })
      .sort({ clusterOrder: 1 })
      .select("_id status clusterOrder")
      .lean();
    const usedChildOrders = new Set(children.filter((child) => child.status === "used").map((child) => child.clusterOrder));
    if (usedChildOrders.has(1) && usedChildOrders.has(2)) continue;

    // Protection Rule 4: Verify parent blog actually exists in DB AND articleType is 'pillar'
    const parentBlog = await Blog.findOne({
      _id: pillar.usedByBlogId,
      articleType: "pillar",
    })
      .select("_id title slug")
      .lean();

    if (!parentBlog) {
      throw new Error(`Cluster ${pillar._id} is blocked because its used Pillar topic is not linked to an actual Pillar blog.`);
    }

    const nextChildOrder = usedChildOrders.has(1) ? 2 : 1;

    const supporting = await takeTopic(
      {
        source,
        articleType: "supporting",
        parentTopicId: pillar._id,
        clusterOrder: nextChildOrder,
        status: "ready",
      },
      { createdAt: 1 },
    );
    if (supporting) return addParentPillarContext(supporting, parentBlog);
    throw new Error(`Current cluster is waiting for Supporting topic ${nextChildOrder}; the next Pillar will not be selected until this cluster is complete.`);
  }

  // Next planned Pillar topic
  const pillar = await takeTopic(
    { source, articleType: "pillar", status: "planned" },
    { priority: -1, createdAt: 1 },
  );
  return addParentPillarContext(pillar, null);
}

/**
 * Acquire next topic plan in strict sequence.
 * Triggers 5-cluster auto-refill when 5 complete clusters have been consumed (active AI Pillars <= 5).
 * Safely throws an error if no valid Pillar cluster is available (Rule 5).
 */
export async function acquireNextTopicPlan({ refill = true } = {}) {
  await dbConnect();
  await recoverStaleTopics();

  // Refill only after five whole clusters (Pillar + both Supporting topics) are used.
  if (refill) {
    const [activePillarClustersCount, completedClustersCount] = await Promise.all([
      BlogTopicPlan.countDocuments({ source: "ai", articleType: "pillar", status: { $in: ["planned", "processing"] } }),
      countCompletedAiClusters(),
    ]);

    if (completedClustersCount >= 5 && activePillarClustersCount <= 5) {
      try {
        console.log(`[TopicQueue] ${completedClustersCount} complete AI clusters consumed and ${activePillarClustersCount} remain. Refilling exactly 5 complete clusters via Gemini AI.`);
        await appendAiClusters({ targetClusters: 5 });
      } catch (refillErr) {
        console.warn("[TopicQueue] Auto refill attempt failed:", refillErr.message);
      }
    }
  }

  let topic = await takeClusterTopic("ai");
  if (topic) return topic;

  topic = await takeClusterTopic("manual");
  if (topic) return topic;

  topic = await takeClusterTopic("fallback");
  if (topic) return topic;

  // Rule 5: If no duplicate-safe Pillar cluster is available, stop safely with clear error
  throw new Error("No duplicate-safe Pillar topic cluster is currently available in the queue.");
}

export const formatTopicPlanForWriter = (plan) => `Article type: ${plan.articleType || "supporting"}. Content cluster: ${plan.clusterTitle || plan.pillar}. Title direction: ${plan.title}. Pillar: ${plan.pillar}. Specific subtopic: ${plan.subtopic}. Problem: ${plan.problem}. Engineering solution angle: ${plan.solutionAngle}. Business value: ${plan.businessValue}. Audience: ${plan.audience}. Primary search query: ${plan.focusKeyword}. Search intent: ${plan.searchIntent}. Article format: ${plan.format}. Relevant service slugs for contextual internal links: ${(plan.relatedServiceSlugs || []).join(", ") || "none"}.${plan.parentPillarBlog ? ` Parent pillar article: ${plan.parentPillarBlog.title} at /blog/${plan.parentPillarBlog.slug}. Link to it naturally.` : ""}`;

export async function markTopicPlanUsed(id, blogId) {
  if (!id) return null;
  const topic = await BlogTopicPlan.findByIdAndUpdate(
    id,
    {
      $set: { status: "used", usedAt: new Date(), usedByBlogId: blogId },
      $unset: { processingStartedAt: 1, failureReason: 1 },
    },
    { new: true },
  );
  if (!topic) throw new Error(`Topic plan ${id} was not found after blog creation.`);
  return topic;
}

export async function releaseTopicPlan(id, reason, { reject = false } = {}) {
  if (!id) return;
  const plan = await BlogTopicPlan.findById(id);
  if (!plan || plan.status !== "processing") return;
  plan.retryCount += 1;
  plan.failureReason = String(reason || "Generation failed").slice(0, 300);
  if (reject || plan.retryCount >= 3) {
    plan.status = reject ? "rejected" : "failed";
  } else if (plan.articleType === "pillar") {
    plan.status = "planned";
  } else {
    plan.status = "ready";
  }
  plan.processingStartedAt = undefined;
  await plan.save();
  if (reject && plan.articleType === "pillar") {
    await BlogTopicPlan.updateMany(
      { parentTopicId: plan._id, status: { $in: ["planned", "ready"] } },
      { $set: { status: "rejected", failureReason: `Parent pillar rejected: ${plan.failureReason}` } },
    );
  }
}

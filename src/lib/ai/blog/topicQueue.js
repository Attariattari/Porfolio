import dbConnect from "@/lib/dbConnect";
import { generateGeminiResponse } from "@/lib/geminiService";
import { findNearDuplicateBlog } from "@/lib/blogSeo";
import { Blog } from "@/models/Portfolio";
import { BlogTopicPlan } from "@/models/BlogTopicPlan";

const PILLARS = ["Next.js & React", "Backend & APIs", "Databases", "Performance", "Technical SEO", "DevOps & Deployment", "AI Workflows & Automation", "Security", "UI/UX Engineering", "SaaS & Business Systems", "E-commerce", "Website Reliability"];
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
  { pillar: "SaaS & Business Systems", value: "operations that remain manageable as the product grows", items: [["multi-tenant boundaries", "customer data leaking across accounts", "enforcing tenant identity through every data operation", "SaaS multi tenant architecture"], ["audit trails", "teams unable to explain who changed critical data", "recording useful immutable activity context", "application audit log"], ["feature flags", "large releases creating unnecessary business risk", "decoupling deployment from controlled feature exposure", "SaaS feature flags"], ["admin workflows", "manual operations spread across disconnected tools", "centralizing clear states, ownership and automation", "business admin workflow"]] },
  { pillar: "E-commerce", value: "more dependable buying journeys and store operations", items: [["checkout resilience", "customers losing orders during payment uncertainty", "using idempotent order states and payment reconciliation", "reliable ecommerce checkout"], ["inventory consistency", "stock counts drifting across sales channels", "designing one authoritative inventory workflow", "ecommerce inventory consistency"], ["product discovery", "large catalogs becoming difficult to navigate", "combining structured filters, search and useful metadata", "ecommerce product discovery"], ["order operations", "support teams lacking a clear fulfillment view", "building actionable order timelines and exception states", "ecommerce order management"]] },
  { pillar: "Website Reliability", value: "fewer silent failures and more dependable customer journeys", items: [["form delivery", "customer inquiries disappearing silently", "adding server validation, delivery logs and recovery paths", "reliable website forms"], ["error monitoring", "production failures discovered by customers first", "capturing actionable errors with release context", "website error monitoring"], ["health checks", "teams learning about outages too late", "monitoring real dependencies and useful service signals", "application health checks"], ["maintenance planning", "small neglected issues becoming expensive failures", "using scheduled reviews, dependency updates and backups", "website maintenance plan"]] },
];
const ALLOWED_SERVICES = new Set(["custom-website-development", "mern-stack-web-development", "nextjs-website-development", "full-stack-web-app-development", "admin-dashboard-development", "e-commerce-website-development", "portfolio-website-development", "landing-page-design", "website-redesign", "api-integration", "database-integration", "seo-friendly-website-setup", "website-speed-optimization", "maintenance-support"]);

const normalize = (value = "") => String(value).toLowerCase().replace(/[^a-z0-9+#.\s-]/g, " ").replace(/\s+/g, " ").trim();
export const buildTopicFingerprint = (plan = {}) => [plan.pillar, plan.subtopic, plan.problem, plan.solutionAngle, plan.focusKeyword].map(normalize).filter(Boolean).join("::");

function planAsBlog(plan) {
  return { slug: plan.fingerprint || buildTopicFingerprint(plan), title: plan.title, summary: [plan.problem, plan.solutionAngle, plan.businessValue].filter(Boolean).join(" "), category: plan.pillar, focusKeyword: plan.focusKeyword, tags: [plan.subtopic, plan.audience, plan.format].filter(Boolean) };
}

function cleanPlan(plan, source = "ai") {
  const cleaned = {
    title: String(plan.title || "").trim(), pillar: String(plan.pillar || "Technology").trim(), subtopic: String(plan.subtopic || "").trim(), problem: String(plan.problem || "").trim(), solutionAngle: String(plan.solutionAngle || "").trim(), businessValue: String(plan.businessValue || "").trim(), audience: String(plan.audience || "Founders and developers").trim(), focusKeyword: String(plan.focusKeyword || "").trim(), searchIntent: ["informational", "commercial", "transactional", "navigational"].includes(plan.searchIntent) ? plan.searchIntent : "informational", format: String(plan.format || "Problem-solution guide").trim(), relatedServiceSlugs: Array.isArray(plan.relatedServiceSlugs) ? [...new Set(plan.relatedServiceSlugs)].filter((slug) => ALLOWED_SERVICES.has(slug)).slice(0, 3) : [], priority: Math.min(100, Math.max(0, Number(plan.priority) || 50)), scheduledFor: plan.scheduledFor ? new Date(plan.scheduledFor) : null, notes: String(plan.notes || "").trim(), source,
  };
  cleaned.fingerprint = buildTopicFingerprint(cleaned);
  return cleaned;
}

function buildFallbackPlans() {
  return FALLBACK_BLUEPRINTS.flatMap((group) => group.items.map(([subtopic, problem, solutionAngle, focusKeyword], index) => ({
    title: `Fixing ${problem}: a practical ${subtopic} approach`, pillar: group.pillar, subtopic, problem, solutionAngle, businessValue: group.value, audience: index % 2 === 0 ? "Founders, product teams and developers" : "Engineering teams and technical decision-makers", focusKeyword, searchIntent: "informational", format: ["Problem-solution guide", "Architecture guide", "Practical checklist", "Engineering decision guide"][index], relatedServiceSlugs: [], priority: 45 - index,
  })));
}

export async function reconcileFallbackTopics() {
  await dbConnect();
  const fallbackFingerprints = buildFallbackPlans().map((plan) => buildTopicFingerprint(cleanPlan(plan, "fallback")));
  await BlogTopicPlan.updateMany(
    { fingerprint: { $in: fallbackFingerprints }, source: { $ne: "fallback" } },
    { $set: { source: "fallback" } },
  );

  const primaryReady = await BlogTopicPlan.countDocuments({ status: "ready", source: { $ne: "fallback" } });
  if (primaryReady > 0) {
    await BlogTopicPlan.updateMany(
      { source: "fallback", status: "ready" },
      { $set: { status: "reserve" }, $unset: { scheduledFor: 1 } },
    );
    return { primaryReady, fallbackReady: 0 };
  }

  const activeFallbacks = await BlogTopicPlan.find({ source: "fallback", status: "ready" })
    .sort({ priority: -1, createdAt: 1 })
    .select("_id")
    .lean();
  const overflowIds = activeFallbacks.slice(30).map((topic) => topic._id);
  if (overflowIds.length) {
    await BlogTopicPlan.updateMany(
      { _id: { $in: overflowIds } },
      { $set: { status: "reserve" }, $unset: { scheduledFor: 1 } },
    );
  }
  return { primaryReady: 0, fallbackReady: Math.min(activeFallbacks.length, 30) };
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

export async function refillTopicQueue({ target = 45, threshold = 15, force = false } = {}) {
  await dbConnect();
  await reconcileFallbackTopics();
  const activeCount = await BlogTopicPlan.countDocuments({ status: "ready", source: { $ne: "fallback" } });
  if (activeCount > 0) {
    await BlogTopicPlan.updateMany(
      { source: "fallback", status: "ready" },
      { $set: { status: "reserve" }, $unset: { scheduledFor: 1 } },
    );
  }
  if (!force && activeCount >= threshold) return { success: true, generated: 0, ready: activeCount, skipped: true };
  const requested = Math.min(30, Math.max(8, target - activeCount));
  const [blogs, plans] = await Promise.all([
    Blog.find().sort({ createdAt: -1 }).limit(500).select("title summary category tags focusKeyword slug").lean(),
    BlogTopicPlan.find().sort({ createdAt: -1 }).limit(500).select("title pillar subtopic problem solutionAngle businessValue audience focusKeyword format fingerprint").lean(),
  ]);
  const avoid = [...blogs.map((item) => `${item.title} | ${item.focusKeyword || ""}`), ...plans.map((item) => `${item.title} | ${item.focusKeyword}`)].slice(0, 500).join("\n");
  const prompt = `Create ${requested} diverse, unique editorial topic plans for Muhyo Tech, a professional web/software engineering brand. Rotate across these pillars: ${PILLARS.join(", ")}. Every plan must solve a different practical technical or business problem. Do not repeat the same subtopic, problem, solution, focus keyword, or article angle. Avoid unrelated news, health, entertainment, politics, and generic beginner topics. EXISTING/QUEUED TOPICS TO AVOID:\n${avoid || "None"}\nReturn strict JSON: {"topics":[{"title":"","pillar":"","subtopic":"","problem":"","solutionAngle":"","businessValue":"","audience":"","focusKeyword":"","searchIntent":"informational","format":"","relatedServiceSlugs":[],"priority":50}]}`;
  let candidates = [];
  let fallbackUsed = false;
  try {
    const raw = await generateGeminiResponse(prompt, { temperature: 0.85, responseMimeType: "application/json", maxOutputTokens: 8192, thinkingBudget: 0, timeoutMs: Number(process.env.AI_TOPIC_QUEUE_TIMEOUT_MS || 8000) });
    const parsed = JSON.parse(raw.replace(/```json/gi, "").replace(/```/g, "").trim());
    candidates = Array.isArray(parsed.topics) ? parsed.topics : [];
  } catch (error) {
    console.warn("[TopicQueue] Gemini topic refill failed. Using professional local editorial catalog.", error.message);
    candidates = buildFallbackPlans();
    fallbackUsed = true;
  }
  const knownFingerprints = new Set(plans.map((item) => item.fingerprint));
  const accepted = [];
  for (const candidate of candidates) {
    if (accepted.length >= requested) break;
    const plan = cleanPlan(candidate, fallbackUsed ? "fallback" : "ai");
    if (fallbackUsed) plan.status = "reserve";
    if (!plan.title || !plan.subtopic || !plan.problem || !plan.solutionAngle || !plan.focusKeyword || knownFingerprints.has(plan.fingerprint)) continue;
    const duplicateBlog = findNearDuplicateBlog(planAsBlog(plan), blogs);
    const duplicateAccepted = accepted.some((item) => findNearDuplicateBlog(planAsBlog(plan), [planAsBlog(item)]));
    if (duplicateBlog || duplicateAccepted) continue;
    knownFingerprints.add(plan.fingerprint); accepted.push(plan);
  }
  if (accepted.length) await BlogTopicPlan.insertMany(accepted, { ordered: false }).catch((error) => { if (error?.code !== 11000 && !error?.writeErrors?.every((item) => item.code === 11000)) throw error; });
  if (!fallbackUsed && accepted.length) {
    await BlogTopicPlan.updateMany(
      { source: "fallback", status: "ready" },
      { $set: { status: "reserve" }, $unset: { scheduledFor: 1 } },
    );
  }
  const ready = await BlogTopicPlan.countDocuments({ status: "ready", source: { $ne: "fallback" } });
  const reserve = await BlogTopicPlan.countDocuments({ status: "reserve", source: "fallback" });
  return { success: true, generated: fallbackUsed ? 0 : accepted.length, fallbackSeeded: fallbackUsed ? accepted.length : 0, ready, reserve, requested, fallbackUsed };
}

export async function activateFallbackTopics(limit = 30) {
  await dbConnect();
  const existingPrimary = await BlogTopicPlan.countDocuments({ status: "ready", source: { $ne: "fallback" } });
  if (existingPrimary > 0) return { activated: 0, reason: "primary_topics_available" };
  const reserves = await BlogTopicPlan.find({ status: "reserve", source: "fallback" }).sort({ priority: -1, createdAt: 1 }).limit(limit).select("_id").lean();
  if (!reserves.length) return { activated: 0, reason: "no_fallback_reserve" };
  const ids = reserves.map((item) => item._id);
  await BlogTopicPlan.updateMany({ _id: { $in: ids }, status: "reserve" }, { $set: { status: "ready" } });
  return { activated: ids.length, reason: "ai_queue_unavailable" };
}

async function recoverStaleTopics() {
  const cutoff = new Date(Date.now() - 30 * 60 * 1000);
  await BlogTopicPlan.updateMany({ status: "processing", processingStartedAt: { $lt: cutoff }, retryCount: { $lt: 3 } }, { $set: { status: "ready", failureReason: "Recovered after interrupted generation." }, $inc: { retryCount: 1 }, $unset: { processingStartedAt: 1 } });
}

export async function acquireNextTopicPlan({ refill = true } = {}) {
  await dbConnect(); await recoverStaleTopics();
  if (refill) await refillTopicQueue().catch((error) => console.warn("[TopicQueue] Refill unavailable; checking reserved topics.", error.message));
  const now = new Date();
  const scheduled = await BlogTopicPlan.findOneAndUpdate({ status: "ready", source: "manual", scheduledFor: { $ne: null, $lte: now } }, { $set: { status: "processing", processingStartedAt: now }, $unset: { failureReason: 1 } }, { new: true, sort: { scheduledFor: 1, priority: -1, createdAt: 1 } });
  if (scheduled) return scheduled;
  const primary = await BlogTopicPlan.findOneAndUpdate({ status: "ready", scheduledFor: null, source: { $ne: "fallback" } }, { $set: { status: "processing", processingStartedAt: now }, $unset: { failureReason: 1 } }, { new: true, sort: { priority: -1, createdAt: 1 } });
  if (primary) return primary;
  await activateFallbackTopics();
  return BlogTopicPlan.findOneAndUpdate({ status: "ready", scheduledFor: null, source: "fallback" }, { $set: { status: "processing", processingStartedAt: now }, $unset: { failureReason: 1 } }, { new: true, sort: { priority: -1, createdAt: 1 } });
}

export const formatTopicPlanForWriter = (plan) => `Title direction: ${plan.title}. Pillar: ${plan.pillar}. Specific subtopic: ${plan.subtopic}. Problem: ${plan.problem}. Engineering solution angle: ${plan.solutionAngle}. Business value: ${plan.businessValue}. Audience: ${plan.audience}. Primary search query: ${plan.focusKeyword}. Article format: ${plan.format}.`;
export async function markTopicPlanUsed(id, blogId) { if (!id) return; await BlogTopicPlan.findByIdAndUpdate(id, { $set: { status: "used", usedAt: new Date(), usedByBlogId: blogId }, $unset: { processingStartedAt: 1, failureReason: 1 } }); }
export async function releaseTopicPlan(id, reason, { reject = false } = {}) { if (!id) return; const plan = await BlogTopicPlan.findById(id); if (!plan || plan.status !== "processing") return; plan.retryCount += 1; plan.failureReason = String(reason || "Generation failed").slice(0, 300); plan.status = reject ? "rejected" : plan.retryCount >= 3 ? "failed" : "ready"; plan.processingStartedAt = undefined; await plan.save(); }

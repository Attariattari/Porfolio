import dbConnect from "@/lib/dbConnect";
import { generateGeminiResponse } from "@/lib/geminiService";
import { findNearDuplicateBlog } from "@/lib/blogSeo";
import { Blog } from "@/models/Portfolio";
import { BlogTopicPlan } from "@/models/BlogTopicPlan";

const PILLARS = ["Next.js & React", "Backend & APIs", "Databases", "Performance", "Technical SEO", "DevOps & Deployment", "AI Workflows & Automation", "Security", "UI/UX Engineering", "SaaS & Business Systems", "E-commerce", "Website Reliability", "Next.js Development Services", "MERN Development Services", "Website Development Pakistan", "Admin Dashboard Solutions"];
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

const COMMERCIAL_CLUSTER_PLANS = [
  { title: "How to Hire a Next.js Developer in Pakistan: A Practical Buyer Guide", pillar: "Next.js Development Services", subtopic: "hiring a Next.js developer", problem: "businesses struggle to evaluate Next.js developers beyond portfolios and hourly rates", solutionAngle: "compare technical discovery, architecture judgment, SEO knowledge, communication, testing and delivery ownership", businessValue: "choose a reliable Next.js partner and reduce expensive delivery risk", audience: "Founders, agencies and business owners", focusKeyword: "hire Next.js developer Pakistan", searchIntent: "commercial", format: "Buyer guide", relatedServiceSlugs: ["nextjs-website-development", "full-stack-web-app-development"], priority: 96 },
  { title: "Next.js Development Cost in Pakistan: Scope, Features and Real Pricing Factors", pillar: "Next.js Development Services", subtopic: "Next.js project cost", problem: "buyers receive incomparable estimates because project scope and engineering requirements are unclear", solutionAngle: "break pricing into page architecture, backend work, integrations, content, SEO, testing and maintenance", businessValue: "build a realistic budget and compare proposals fairly", audience: "Founders and business decision-makers", focusKeyword: "Next.js development cost Pakistan", searchIntent: "commercial", format: "Cost guide", relatedServiceSlugs: ["nextjs-website-development", "custom-website-development"], priority: 94 },
  { title: "Next.js Agency or Freelance Developer: Which Is Right for Your Project?", pillar: "Next.js Development Services", subtopic: "Next.js delivery partner comparison", problem: "buyers choose a delivery model without matching it to project complexity, ownership and support needs", solutionAngle: "compare accountability, speed, specialist coverage, communication, continuity and total cost", businessValue: "select the delivery model that fits business risk and scope", audience: "Startups, agencies and established businesses", focusKeyword: "Next.js agency vs freelancer", searchIntent: "commercial", format: "Comparison guide", relatedServiceSlugs: ["nextjs-website-development", "maintenance-support"], priority: 88 },
  { title: "What to Include in a Next.js Website Development Brief", pillar: "Next.js Development Services", subtopic: "Next.js project brief", problem: "unclear requirements create inaccurate proposals, missed integrations and avoidable revisions", solutionAngle: "provide a reusable brief structure covering goals, users, pages, workflows, integrations, content, SEO and acceptance criteria", businessValue: "receive clearer estimates and start development with less ambiguity", audience: "Business owners and project managers", focusKeyword: "Next.js website development brief", searchIntent: "informational", format: "Practical checklist", relatedServiceSlugs: ["nextjs-website-development", "custom-website-development"], priority: 84 },

  { title: "How to Hire a MERN Stack Developer in Pakistan", pillar: "MERN Development Services", subtopic: "hiring a MERN developer", problem: "businesses cannot easily verify whether a developer can own frontend, backend, database and deployment decisions", solutionAngle: "evaluate production architecture, API design, MongoDB modeling, security, testing and operational support", businessValue: "hire for complete application delivery instead of isolated coding tasks", audience: "Founders, product teams and agencies", focusKeyword: "hire MERN stack developer Pakistan", searchIntent: "commercial", format: "Buyer guide", relatedServiceSlugs: ["mern-stack-web-development", "full-stack-web-app-development"], priority: 95 },
  { title: "MERN Stack Development Cost in Pakistan for Business Applications", pillar: "MERN Development Services", subtopic: "MERN application pricing", problem: "application estimates vary widely without explaining modules, roles, integrations and infrastructure", solutionAngle: "map cost drivers across UI, APIs, database design, authentication, dashboards, integrations and deployment", businessValue: "plan an achievable application budget and phased roadmap", audience: "Startup founders and business owners", focusKeyword: "MERN stack development cost Pakistan", searchIntent: "commercial", format: "Cost guide", relatedServiceSlugs: ["mern-stack-web-development", "database-integration", "api-integration"], priority: 93 },
  { title: "MERN Stack vs WordPress: Choosing the Right Platform for Business Growth", pillar: "MERN Development Services", subtopic: "MERN versus WordPress", problem: "businesses overbuild simple sites or constrain complex workflows with the wrong platform", solutionAngle: "compare content needs, custom workflows, integrations, ownership, scalability, maintenance and budget", businessValue: "choose a platform aligned with actual business requirements", audience: "Business owners and startup teams", focusKeyword: "MERN stack vs WordPress", searchIntent: "commercial", format: "Decision guide", relatedServiceSlugs: ["mern-stack-web-development", "custom-website-development"], priority: 86 },
  { title: "MERN Application Planning Checklist Before Development Starts", pillar: "MERN Development Services", subtopic: "MERN project planning", problem: "teams begin development before defining users, permissions, data ownership and operational workflows", solutionAngle: "plan roles, modules, data models, APIs, integrations, security and release stages", businessValue: "reduce rework and make application delivery more predictable", audience: "Founders, product managers and technical leads", focusKeyword: "MERN application development checklist", searchIntent: "informational", format: "Planning checklist", relatedServiceSlugs: ["mern-stack-web-development", "full-stack-web-app-development"], priority: 82 },

  { title: "Website Development Cost in Pakistan: A Transparent 2026 Guide", pillar: "Website Development Pakistan", subtopic: "website pricing in Pakistan", problem: "businesses see price quotes without understanding differences in scope, quality, SEO and support", solutionAngle: "explain cost ranges through page count, design depth, CMS needs, integrations, copy, SEO, performance and maintenance", businessValue: "set a realistic budget and avoid misleading quote comparisons", audience: "Pakistani businesses, founders and professionals", focusKeyword: "website development cost Pakistan", searchIntent: "commercial", format: "Cost guide", relatedServiceSlugs: ["custom-website-development", "portfolio-website-development", "landing-page-design"], priority: 97 },
  { title: "How to Choose a Website Developer in Lahore", pillar: "Website Development Pakistan", subtopic: "choosing a local website developer", problem: "local businesses struggle to distinguish professional delivery from attractive demos", solutionAngle: "evaluate discovery, mobile quality, SEO foundations, performance, ownership, communication and after-launch support", businessValue: "select a dependable developer for a business-critical website", audience: "Businesses and professionals in Lahore", focusKeyword: "website developer Lahore", searchIntent: "commercial", format: "Local buyer guide", relatedServiceSlugs: ["custom-website-development", "seo-friendly-website-setup"], priority: 95 },
  { title: "Custom Website vs Template Website: What Should a Growing Business Choose?", pillar: "Website Development Pakistan", subtopic: "custom versus template websites", problem: "businesses choose based on initial price without considering differentiation, workflows and long-term maintenance", solutionAngle: "compare launch speed, brand control, SEO, performance, integrations, scalability and total ownership", businessValue: "invest at the right level for current goals and future growth", audience: "Small businesses, startups and service providers", focusKeyword: "custom website vs template website", searchIntent: "commercial", format: "Comparison guide", relatedServiceSlugs: ["custom-website-development", "website-redesign"], priority: 89 },
  { title: "Website Redesign Checklist for Pakistani Businesses", pillar: "Website Development Pakistan", subtopic: "business website redesign", problem: "redesign projects focus on appearance while preserving weak messaging, SEO and conversion paths", solutionAngle: "audit content, analytics, redirects, mobile UX, speed, forms, trust signals and launch validation", businessValue: "protect existing visibility while improving credibility and conversions", audience: "Business owners and marketing teams", focusKeyword: "website redesign Pakistan", searchIntent: "commercial", format: "Redesign checklist", relatedServiceSlugs: ["website-redesign", "website-speed-optimization", "seo-friendly-website-setup"], priority: 87 },

  { title: "Admin Dashboard Development Cost: Features That Shape the Budget", pillar: "Admin Dashboard Solutions", subtopic: "admin dashboard pricing", problem: "businesses request a dashboard without defining users, workflows, permissions, reports or integrations", solutionAngle: "explain cost drivers through modules, role access, data complexity, automation, analytics and audit requirements", businessValue: "scope a useful dashboard and budget it accurately", audience: "Founders, operations teams and product owners", focusKeyword: "admin dashboard development cost", searchIntent: "commercial", format: "Cost and scope guide", relatedServiceSlugs: ["admin-dashboard-development", "database-integration", "api-integration"], priority: 94 },
  { title: "When Does Your Business Need a Custom Admin Dashboard?", pillar: "Admin Dashboard Solutions", subtopic: "admin dashboard business case", problem: "teams manage critical work across spreadsheets, inboxes and disconnected tools", solutionAngle: "identify workflow, visibility, ownership, approval and reporting signals that justify a central dashboard", businessValue: "reduce manual coordination and improve operational control", audience: "Business owners and operations managers", focusKeyword: "custom admin dashboard for business", searchIntent: "commercial", format: "Decision guide", relatedServiceSlugs: ["admin-dashboard-development", "full-stack-web-app-development"], priority: 91 },
  { title: "Admin Dashboard Requirements Checklist for a Successful Build", pillar: "Admin Dashboard Solutions", subtopic: "dashboard requirements planning", problem: "dashboard projects fail when screens are defined before users, decisions and workflows", solutionAngle: "document roles, actions, states, data sources, permissions, alerts, reports and acceptance criteria", businessValue: "create a dashboard that supports real daily operations", audience: "Project managers, founders and operations teams", focusKeyword: "admin dashboard requirements checklist", searchIntent: "informational", format: "Requirements checklist", relatedServiceSlugs: ["admin-dashboard-development", "database-integration"], priority: 85 },
  { title: "Custom Admin Dashboard vs Off-the-Shelf Software", pillar: "Admin Dashboard Solutions", subtopic: "custom versus packaged operations software", problem: "businesses either force unique workflows into generic tools or overinvest in custom software", solutionAngle: "compare workflow fit, integrations, reporting, ownership, implementation time, maintenance and total cost", businessValue: "choose the most economical operational system for the real workflow", audience: "Growing businesses and operations leaders", focusKeyword: "custom dashboard vs off the shelf software", searchIntent: "commercial", format: "Comparison guide", relatedServiceSlugs: ["admin-dashboard-development", "full-stack-web-app-development"], priority: 86 },
];

const normalize = (value = "") => String(value).toLowerCase().replace(/[^a-z0-9+#.\s-]/g, " ").replace(/\s+/g, " ").trim();
export const buildTopicFingerprint = (plan = {}) => [plan.articleType, plan.clusterKey, plan.pillar, plan.subtopic, plan.problem, plan.solutionAngle, plan.focusKeyword].map(normalize).filter(Boolean).join("::");

function planAsBlog(plan) {
  return { slug: plan.fingerprint || buildTopicFingerprint(plan), title: plan.title, summary: [plan.problem, plan.solutionAngle, plan.businessValue].filter(Boolean).join(" "), category: plan.pillar, focusKeyword: plan.focusKeyword, tags: [plan.subtopic, plan.audience, plan.format].filter(Boolean) };
}

function cleanPlan(plan, source = "ai") {
  const cleaned = {
    title: String(plan.title || "").trim(), articleType: plan.articleType === "pillar" ? "pillar" : "supporting", clusterKey: String(plan.clusterKey || "").trim(), clusterTitle: String(plan.clusterTitle || "").trim(), clusterOrder: Math.min(2, Math.max(0, Number(plan.clusterOrder) || 0)), parentTopicId: plan.parentTopicId || null, pillar: String(plan.pillar || "Technology").trim(), subtopic: String(plan.subtopic || "").trim(), problem: String(plan.problem || "").trim(), solutionAngle: String(plan.solutionAngle || "").trim(), businessValue: String(plan.businessValue || "").trim(), audience: String(plan.audience || "Founders and developers").trim(), focusKeyword: String(plan.focusKeyword || "").trim(), searchIntent: ["informational", "commercial", "transactional", "navigational"].includes(plan.searchIntent) ? plan.searchIntent : "informational", format: String(plan.format || "Problem-solution guide").trim(), relatedServiceSlugs: Array.isArray(plan.relatedServiceSlugs) ? [...new Set(plan.relatedServiceSlugs)].filter((slug) => ALLOWED_SERVICES.has(slug)).slice(0, 3) : [], priority: Math.min(100, Math.max(0, Number(plan.priority) || 50)), scheduledFor: plan.scheduledFor ? new Date(plan.scheduledFor) : null, notes: String(plan.notes || "").trim(), source, status: plan.status,
  };
  cleaned.fingerprint = buildTopicFingerprint(cleaned);
  return cleaned;
}

function buildFallbackPlans() {
  return FALLBACK_BLUEPRINTS.flatMap((group) => group.items.map(([subtopic, problem, solutionAngle, focusKeyword], index) => ({
    title: `Fixing ${problem}: a practical ${subtopic} approach`, pillar: group.pillar, subtopic, problem, solutionAngle, businessValue: group.value, audience: index % 2 === 0 ? "Founders, product teams and developers" : "Engineering teams and technical decision-makers", focusKeyword, searchIntent: "informational", format: ["Problem-solution guide", "Architecture guide", "Practical checklist", "Engineering decision guide"][index], relatedServiceSlugs: [], priority: 45 - index,
  })));
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
  const supportingStatus = source === "ai" && status === "planned"
    ? "ready"
    : status;
  const supporting = (pack.supporting || []).slice(0, 2).map((topic, index) => cleanPlan({ ...topic, clusterKey: pack.clusterKey, clusterTitle: pack.clusterTitle, articleType: "supporting", clusterOrder: index + 1, status: supportingStatus }, source));
  return { pillar, supporting };
}

async function insertClusterPacks(packs, source, status, existingBlogs, historicalPlans, maxClusters = Number.POSITIVE_INFINITY) {
  const acceptedPlans = [...historicalPlans];
  let clusters = 0;
  let topics = 0;
  for (const rawPack of packs) {
    if (clusters >= maxClusters) break;
    const pack = flattenClusterPack(rawPack, source, status);
    const all = [pack.pillar, ...pack.supporting];
    if (all.length !== 3 || all.some((plan) => !plan.title || !plan.focusKeyword || !plan.problem || !plan.solutionAngle)) continue;
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
      await BlogTopicPlan.insertMany(supporting, { ordered: true });
      acceptedPlans.push(pack.pillar, ...supporting);
      clusters += 1;
      topics += 3;
    } catch (error) {
      if (pillar?._id) await BlogTopicPlan.deleteOne({ _id: pillar._id, status: { $ne: "used" } });
      if (error?.code !== 11000) throw error;
    }
  }
  return { clusters, topics };
}

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
  const candidateTarget = Math.min(18, targetClusters + 6);
  const prompt = `Create ${candidateTarget} unique topical-authority cluster candidates for Muhyo Tech, focused only on professional web development. The system will accept the best ${targetClusters} after duplicate validation. Each pack must contain exactly one comprehensive pillar topic and exactly two narrow supporting topics. Do not repeat or closely overlap any existing blog or used topic. Pillars must support a genuinely complete 2,000-3,500 word authority resource; supporting topics must each answer a distinct 900-1,200 word long-tail problem. Rotate across: ${PILLARS.join(", ")}. EXISTING BLOGS AND USED TOPICS TO AVOID:\n${avoid}\nReturn strict JSON: {"clusters":[{"clusterKey":"","clusterTitle":"","pillar":{"title":"","pillar":"","subtopic":"","problem":"","solutionAngle":"","businessValue":"","audience":"","focusKeyword":"","searchIntent":"informational","format":"Premium pillar guide","relatedServiceSlugs":[],"priority":80},"supporting":[{"title":"","pillar":"","subtopic":"","problem":"","solutionAngle":"","businessValue":"","audience":"","focusKeyword":"","searchIntent":"informational","format":"Focused supporting guide","relatedServiceSlugs":[],"priority":70},{"title":"","pillar":"","subtopic":"","problem":"","solutionAngle":"","businessValue":"","audience":"","focusKeyword":"","searchIntent":"informational","format":"Focused supporting guide","relatedServiceSlugs":[],"priority":69}]}]}`;

  let aiPacks = [];
  let aiError = null;
  try {
    const raw = await generateGeminiResponse(prompt, { temperature: 0.75, responseMimeType: "application/json", maxOutputTokens: 16384, thinkingBudget: 0, timeoutMs: Number(process.env.AI_TOPIC_QUEUE_TIMEOUT_MS || 35000) });
    const parsed = JSON.parse(raw.replace(/```json/gi, "").replace(/```/g, "").trim());
    aiPacks = Array.isArray(parsed.clusters) ? parsed.clusters.slice(0, candidateTarget) : [];
  } catch (error) {
    aiError = error.message;
  }

  await BlogTopicPlan.deleteMany({ status: { $ne: "used" } });
  try {
    const ai = await insertClusterPacks(aiPacks, "ai", "planned", blogs, usedPlans, targetClusters);
    const currentPlans = await BlogTopicPlan.find().select("title pillar subtopic problem solutionAngle businessValue audience focusKeyword format fingerprint articleType clusterKey").lean();
    const fallback = await insertClusterPacks(buildFallbackClusterPacks(), "fallback", "reserve", blogs, [...usedPlans, ...currentPlans]);
    if (ai.topics + fallback.topics === 0) throw new Error("No duplicate-safe cluster topics could be prepared; the previous catalog will be restored.");
    return { success: true, removedUnused: unusedPlans.length, ai, fallback, aiError, preservedUsed: usedPlans.length };
  } catch (error) {
    await BlogTopicPlan.deleteMany({ status: { $ne: "used" } });
    if (unusedPlans.length) {
      await BlogTopicPlan.insertMany(unusedPlans, { ordered: false });
    }
    throw error;
  }
}

async function ensureCommercialClusterTopics() {
  const existingBlogs = await Blog.find()
    .sort({ createdAt: -1 })
    .limit(500)
    .select("title summary category tags focusKeyword slug")
    .lean();
  let seeded = 0;

  for (const clusterPlan of COMMERCIAL_CLUSTER_PLANS) {
    const plan = cleanPlan({
      ...clusterPlan,
      notes: "Strategic topical-authority cluster linked to a relevant commercial service.",
    }, "ai");

    if (findNearDuplicateBlog(planAsBlog(plan), existingBlogs)) continue;

    const result = await BlogTopicPlan.updateOne(
      { fingerprint: plan.fingerprint },
      { $setOnInsert: plan },
      { upsert: true },
    );
    if (result.upsertedCount) seeded += 1;
  }

  return seeded;
}

export async function reconcileFallbackTopics() {
  await dbConnect();
  const clusterCatalogExists = await BlogTopicPlan.exists({
    status: "planned",
    clusterKey: { $ne: "" },
  });
  const commercialSeeded = clusterCatalogExists
    ? 0
    : await ensureCommercialClusterTopics();
  const fallbackFingerprints = buildFallbackPlans().map((plan) => buildTopicFingerprint(cleanPlan(plan, "fallback")));
  await BlogTopicPlan.updateMany(
    { fingerprint: { $in: fallbackFingerprints }, source: { $ne: "fallback" } },
    { $set: { source: "fallback" } },
  );

  const primaryReady = await BlogTopicPlan.countDocuments({ status: "ready", source: "ai" });
  if (primaryReady > 0) {
    await BlogTopicPlan.updateMany(
      { source: "fallback", status: "ready" },
      { $set: { status: "reserve" }, $unset: { scheduledFor: 1 } },
    );
    return { primaryReady, fallbackReady: 0, commercialSeeded };
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
  return { primaryReady: 0, fallbackReady: Math.min(activeFallbacks.length, 30), commercialSeeded };
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
  const activeCount = await BlogTopicPlan.countDocuments({ status: "ready", source: "ai" });
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
  const prompt = `Create ${requested} diverse, unique editorial topic plans for Muhyo Tech, a professional web/software engineering brand. Rotate across these pillars: ${PILLARS.join(", ")}. Build connected topical clusters rather than isolated articles. Target an intent mix of approximately 50% informational, 35% commercial and 15% transactional topics. Commercial topics must help a genuine buyer compare approaches, scope a project, understand cost factors, prepare requirements or evaluate a development partner without keyword stuffing or unsupported price claims. Every plan must solve a different practical technical or business problem and link to 1-3 genuinely relevant service slugs. Do not repeat the same subtopic, problem, solution, focus keyword, or article angle. Avoid unrelated news, health, entertainment, politics, generic beginner topics and thin location-page variations. EXISTING/QUEUED TOPICS TO AVOID:\n${avoid || "None"}\nReturn strict JSON: {"topics":[{"title":"","pillar":"","subtopic":"","problem":"","solutionAngle":"","businessValue":"","audience":"","focusKeyword":"","searchIntent":"informational","format":"","relatedServiceSlugs":[],"priority":50}]}`;
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
  const ready = await BlogTopicPlan.countDocuments({ status: "ready", source: "ai" });
  const reserve = await BlogTopicPlan.countDocuments({ status: "reserve", source: "fallback" });
  return { success: true, generated: fallbackUsed ? 0 : accepted.length, fallbackSeeded: fallbackUsed ? accepted.length : 0, ready, reserve, requested, fallbackUsed };
}

export async function activateFallbackTopics(limit = 30) {
  await dbConnect();
  const existingPrimary = await BlogTopicPlan.countDocuments({ status: "ready", source: "ai" });
  if (existingPrimary > 0) return { activated: 0, reason: "primary_topics_available" };
  const reserves = await BlogTopicPlan.find({ status: "reserve", source: "fallback" }).sort({ priority: -1, createdAt: 1 }).limit(limit).select("_id").lean();
  if (!reserves.length) return { activated: 0, reason: "no_fallback_reserve" };
  const ids = reserves.map((item) => item._id);
  await BlogTopicPlan.updateMany({ _id: { $in: ids }, status: "reserve" }, { $set: { status: "ready" } });
  return { activated: ids.length, reason: "ai_queue_unavailable" };
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
    { ...staleBase, source: "ai", articleType: "pillar", clusterKey: { $ne: "" } },
    recoveryUpdate("planned"),
  );
  await BlogTopicPlan.updateMany(
    { ...staleBase, source: "fallback", clusterKey: { $ne: "" } },
    recoveryUpdate("reserve"),
  );
  await BlogTopicPlan.updateMany(
    {
      ...staleBase,
      $nor: [
        { source: "ai", articleType: "pillar", clusterKey: { $ne: "" } },
        { source: "fallback", clusterKey: { $ne: "" } },
      ],
    },
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

async function addParentPillarContext(topic) {
  if (!topic) return null;
  const result = topic.toObject();
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

async function takeClusterTopic(source, pillarStatus, supportingStatus) {
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
    // A supporting article is never allowed ahead of its real parent article.
    // Do not trust the topic status alone: the linked Pillar blog must still
    // exist and must itself be recorded as a Pillar article.
    const parentBlogExists = await Blog.exists({
      _id: pillar.usedByBlogId,
      articleType: "pillar",
    });
    if (!parentBlogExists) continue;

    const supporting = await takeTopic(
      {
        source,
        articleType: "supporting",
        parentTopicId: pillar._id,
        status: supportingStatus,
      },
      { clusterOrder: 1, priority: -1, createdAt: 1 },
    );
    if (supporting) return addParentPillarContext(supporting);
  }

  const pillar = await takeTopic(
    { source, articleType: "pillar", status: pillarStatus },
    { priority: -1, createdAt: 1 },
  );
  return addParentPillarContext(pillar);
}

export async function acquireNextTopicPlan({ refill = true } = {}) {
  await dbConnect();
  await recoverStaleTopics();

  let clusterCatalogExists = await BlogTopicPlan.exists({
    clusterKey: { $ne: "" },
    articleType: "pillar",
  });

  // Never fall through to a standalone supporting-topic queue. If the cluster
  // catalog is empty, seed duplicate-safe Pillar-first fallback clusters so
  // the next run always has a detailed parent topic available.
  if (!clusterCatalogExists) {
    const [blogs, historicalPlans] = await Promise.all([
      Blog.find().sort({ createdAt: -1 }).limit(500).select("title summary category tags focusKeyword slug").lean(),
      BlogTopicPlan.find().select("title pillar subtopic problem solutionAngle businessValue audience focusKeyword format fingerprint articleType clusterKey").lean(),
    ]);
    await insertClusterPacks(
      buildFallbackClusterPacks(),
      "fallback",
      "reserve",
      blogs,
      historicalPlans,
    );
    clusterCatalogExists = await BlogTopicPlan.exists({
      clusterKey: { $ne: "" },
      articleType: "pillar",
    });
  }

  if (clusterCatalogExists) {
    let topic = await takeClusterTopic("ai", "planned", "ready");
    if (topic) return topic;

    topic = await takeClusterTopic("manual", "ready", "ready");
    if (topic) return topic;

    topic = await takeClusterTopic("fallback", "reserve", "reserve");
    if (topic) return topic;
    return null;
  }

  // No cluster means there is no safe topic to generate. Returning null would
  // invoke the legacy strategist as a supporting article, so stop explicitly.
  throw new Error("No duplicate-safe Pillar topic cluster is currently available.");
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
  } else if (plan.source === "fallback" && plan.clusterKey) {
    plan.status = "reserve";
  } else if (plan.source === "ai" && plan.articleType === "pillar" && plan.clusterKey) {
    plan.status = "planned";
  } else {
    plan.status = "ready";
  }
  plan.processingStartedAt = undefined;
  await plan.save();
  if (reject && plan.articleType === "pillar" && plan.clusterKey) {
    await BlogTopicPlan.updateMany(
      { parentTopicId: plan._id, status: { $in: ["planned", "ready", "reserve"] } },
      { $set: { status: "rejected", failureReason: `Parent pillar rejected: ${plan.failureReason}` } },
    );
  }
}

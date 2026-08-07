import crypto from "node:crypto";
import dbConnect from "@/lib/dbConnect";
import { generateGeminiResponse } from "@/lib/geminiService";
import { BlogTopicPlan } from "@/models/BlogTopicPlan";
import { Blog } from "@/models/Portfolio";
import { findNearDuplicateBlog } from "@/lib/blogSeo";

const OFFICIAL_FEEDS = Object.freeze([
  { name: "Next.js", url: "https://github.com/vercel/next.js/releases.atom", domains: ["github.com"] },
  { name: "React", url: "https://github.com/facebook/react/releases.atom", domains: ["github.com"] },
  { name: "Node.js", url: "https://github.com/nodejs/node/releases.atom", domains: ["github.com"] },
  { name: "MongoDB", url: "https://github.com/mongodb/mongo/releases.atom", domains: ["github.com"] },
  { name: "Vercel", url: "https://vercel.com/changelog/rss", domains: ["vercel.com"] },
  { name: "Web Platform", url: "https://web.dev/feed.xml", domains: ["web.dev"] },
  { name: "MDN Web Platform", url: "https://developer.mozilla.org/en-US/blog/rss.xml", domains: ["developer.mozilla.org"] },
  { name: "Node.js Official Blog", url: "https://nodejs.org/en/feed/blog.xml", domains: ["nodejs.org"] },
]);
const ALLOWED_SOURCE_DOMAINS = new Set(["github.com", "nextjs.org", "react.dev", "nodejs.org", "mongodb.com", "developer.mozilla.org", "web.dev", "vercel.com"]);
const TREND_TTL_DAYS = 30;

const stripMarkup = (value = "") => String(value)
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
  .replace(/<[^>]+>/g, " ")
  .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
  .replace(/\s+/g, " ").trim();
const fingerprint = (value = "") => crypto.createHash("sha256").update(String(value)).digest("hex");

function assertOfficialHttpsUrl(value) {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.username || url.password || !ALLOWED_SOURCE_DOMAINS.has(url.hostname.toLowerCase())) {
    throw new Error("Trend source is not an allow-listed official HTTPS URL.");
  }
  return url;
}

async function fetchOfficialText(value, timeoutMs = 9000) {
  const requested = assertOfficialHttpsUrl(value);
  const response = await fetch(requested, {
    redirect: "follow",
    headers: { "user-agent": "MuhyoTech-TrendIntelligence/1.0", accept: "application/atom+xml,text/html,application/xml;q=0.9,*/*;q=0.5" },
    signal: AbortSignal.timeout(timeoutMs),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Official source returned HTTP ${response.status}.`);
  assertOfficialHttpsUrl(response.url);
  return { text: await response.text(), finalUrl: response.url, retrievedAt: new Date() };
}

function parseAtomEntries(xml, source) {
  const atomEntries = [...String(xml).matchAll(/<entry\b[^>]*>([\s\S]*?)<\/entry>/gi)].map((match) => {
    const entry = match[1];
    const title = stripMarkup(entry.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]);
    const href = entry.match(/<link\b[^>]*href=["']([^"']+)["'][^>]*>/i)?.[1];
    const published = entry.match(/<(?:published|updated)\b[^>]*>([\s\S]*?)<\/(?:published|updated)>/i)?.[1];
    const excerpt = stripMarkup(entry.match(/<(?:content|summary)\b[^>]*>([\s\S]*?)<\/(?:content|summary)>/i)?.[1]).slice(0, 1800);
    const publishedAt = published ? new Date(stripMarkup(published)) : null;
    return { sourceName: source.name, title, url: href, publishedAt, excerpt };
  });
  const rssEntries = [...String(xml).matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)].map((match) => {
    const item = match[1];
    const title = stripMarkup(item.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]);
    const href = stripMarkup(item.match(/<link\b[^>]*>([\s\S]*?)<\/link>/i)?.[1]) || item.match(/<link\b[^>]*href=["']([^"']+)["'][^>]*>/i)?.[1];
    const published = item.match(/<(?:pubDate|published|updated)\b[^>]*>([\s\S]*?)<\/(?:pubDate|published|updated)>/i)?.[1];
    const excerpt = stripMarkup(item.match(/<(?:content:encoded|description|summary)\b[^>]*>([\s\S]*?)<\/(?:content:encoded|description|summary)>/i)?.[1]).slice(0, 1800);
    const publishedAt = published ? new Date(stripMarkup(published)) : null;
    return { sourceName: source.name, title, url: href, publishedAt, excerpt };
  });
  return [...atomEntries, ...rssEntries].filter((entry) => entry.title && entry.url && entry.publishedAt instanceof Date && !Number.isNaN(entry.publishedAt.getTime()));
}

function trendPlanAsBlog(plan) {
  return { slug: plan.sourceFingerprint, title: plan.title, summary: `${plan.problem} ${plan.solutionAngle} ${plan.businessValue}`, category: "Verified Technology Trends", focusKeyword: plan.focusKeyword, tags: [plan.topicFamily, plan.audience].filter(Boolean) };
}

async function verifyClaimsAgainstOfficialSource(candidate, entry, officialText) {
  const raw = await generateGeminiResponse(`You are a strict factual verifier. Check every proposed claim only against the official source text below. Do not use outside knowledge or infer features, compatibility, migration requirements, performance, security impact or stability that the text does not explicitly establish.

RELEASE: ${entry.title}
PROPOSED CLAIMS:
${(candidate.verifiedClaims || []).map((claim, index) => `${index + 1}. ${claim}`).join("\n")}

OFFICIAL SOURCE TEXT:
${officialText.slice(0, 18000)}

Return strict JSON only: {"passed":true,"supportedClaims":["exact supported claim"],"unsupportedClaims":[],"reason":""}`,
  { temperature: 0, responseMimeType: "application/json", maxOutputTokens: 1800, thinkingBudget: 0, timeoutMs: 18000 });
  const result = JSON.parse(String(raw).replace(/```json/gi, "").replace(/```/g, "").trim());
  const supportedClaims = Array.isArray(result.supportedClaims) ? result.supportedClaims.map((claim) => String(claim).trim()).filter(Boolean) : [];
  const unsupportedClaims = Array.isArray(result.unsupportedClaims) ? result.unsupportedClaims.filter(Boolean) : [];
  return { passed: result.passed === true && supportedClaims.length > 0 && unsupportedClaims.length === 0, supportedClaims, reason: result.reason };
}

export async function discoverVerifiedTrends({ maxTopics = 2 } = {}) {
  await dbConnect();
  const cutoff = Date.now() - TREND_TTL_DAYS * 86400000;
  const feedResults = await Promise.allSettled(OFFICIAL_FEEDS.map(async (source) => {
    const result = await fetchOfficialText(source.url);
    return parseAtomEntries(result.text, source).filter((entry) => entry.publishedAt.getTime() >= cutoff);
  }));
  // Keep discovery balanced. A noisy release feed must never consume the
  // entire candidate window and hide official browser/cloud/news sources.
  const entries = feedResults.flatMap((result) => result.status === "fulfilled" ? result.value.slice(0, 6) : []).slice(0, 48);
  if (!entries.length) return { success: true, discovered: 0, verified: 0, message: "No recent official release entries were available." };

  const existingSourceUrls = new Set((await BlogTopicPlan.find({ "officialSources.url": { $in: entries.map((entry) => entry.url) } }).select("officialSources.url").lean())
    .flatMap((plan) => plan.officialSources || []).map((source) => source.url));
  const freshEntries = entries.filter((entry) => !existingSourceUrls.has(entry.url));
  if (!freshEntries.length) return { success: true, discovered: entries.length, verified: 0, message: "Recent official releases were already assessed." };

  const raw = await generateGeminiResponse(`Act as a conservative senior technology editor. Assess these entries from verified official project release feeds. Select at most ${maxTopics} genuinely important, stable, professionally useful releases for founders, developers or product teams. Minor patches, routine prereleases, unclear entries and topics without a strong practical impact must be rejected. Never invent a feature, version, date, benchmark, breaking change or migration requirement.

OFFICIAL ENTRIES:
${freshEntries.map((entry, index) => `[${index}] ${entry.sourceName} | ${entry.publishedAt.toISOString()} | ${entry.title} | ${entry.url}\n${entry.excerpt}`).join("\n\n")}

Return strict JSON only:
{"selected":[{"entryIndex":0,"title":"professional impact-analysis title","topicFamily":"","problem":"","solutionAngle":"","businessValue":"","audience":"","focusKeyword":"","searchIntent":"informational","format":"Verified release impact analysis","relatedServiceSlugs":[],"trendPriority":"normal|high|critical","professionalRelevance":0,"claimConsistency":0,"verifiedClaims":["claim directly supported by supplied official entry"],"prohibitedClaims":["claim not established by the source"],"reason":""}]}`,
  { temperature: 0.1, responseMimeType: "application/json", maxOutputTokens: 5000, thinkingBudget: 0, timeoutMs: 30000 });
  const parsed = JSON.parse(String(raw).replace(/```json/gi, "").replace(/```/g, "").trim());
  const selected = Array.isArray(parsed.selected) ? parsed.selected : [];
  const [existingBlogs, existingPlans] = await Promise.all([
    Blog.find().sort({ createdAt: -1 }).limit(500).select("title summary category tags focusKeyword slug").lean(),
    BlogTopicPlan.find().sort({ createdAt: -1 }).limit(500).select("title problem solutionAngle businessValue pillar focusKeyword topicFamily audience fingerprint").lean(),
  ]);
  let verified = 0;
  for (const candidate of selected.slice(0, maxTopics)) {
    const entry = freshEntries[Number(candidate.entryIndex)];
    if (!entry) continue;
    assertOfficialHttpsUrl(entry.url);
    let detail;
    try {
      detail = await fetchOfficialText(entry.url);
    } catch {
      continue;
    }
    if (await BlogTopicPlan.exists({ "officialSources.url": detail.finalUrl })) continue;
    const detailText = stripMarkup(detail.text).slice(0, 24000);
    const releaseTokens = String(entry.title || "").toLowerCase().match(/[a-z0-9][a-z0-9.-]{2,}/g) || [];
    if (!detailText || !releaseTokens.some((token) => detailText.toLowerCase().includes(token))) continue;
    let claimVerification;
    try {
      claimVerification = await verifyClaimsAgainstOfficialSource(candidate, entry, `${entry.excerpt}\n${detailText}`);
    } catch {
      continue;
    }
    if (!claimVerification.passed) continue;
    const relevance = Math.min(100, Math.max(0, Number(candidate.professionalRelevance) || 0));
    const consistency = Math.min(100, Math.max(0, Number(candidate.claimConsistency) || 0));
    const hasVersion = /\bv?\d+\.\d+(?:\.\d+)?\b/i.test(`${entry.title} ${entry.excerpt}`);
    const score = 30 + 10 + (hasVersion ? 15 : 10) + 15 + Math.round(consistency * 0.15) + Math.round(relevance * 0.10) + 5;
    if (score < 90 || relevance < 75 || consistency < 90 || !candidate.verifiedClaims?.length) continue;
    const sourceFingerprint = fingerprint(`${detail.finalUrl}|${entry.title}|${entry.publishedAt.toISOString()}|${detailText}`);
    const plan = {
      ...candidate,
      articleType: "verified_trend",
      contentCategory: "verified_trend",
      pillar: "Verified Technology Trends",
      subtopic: candidate.topicFamily || entry.title,
      isTrend: true,
      trendStatus: "source_verified",
      verificationScore: Math.min(100, score),
      verificationReason: candidate.reason,
      verifiedClaims: claimVerification.supportedClaims,
      professionalScore: relevance,
      sourceFingerprint,
    };
    const candidateAsBlog = trendPlanAsBlog(plan);
    if (findNearDuplicateBlog(candidateAsBlog, existingBlogs) || findNearDuplicateBlog(candidateAsBlog, existingPlans.map(trendPlanAsBlog))) continue;
    await BlogTopicPlan.create({
      ...plan,
      clusterKey: `trend-${sourceFingerprint.slice(0, 18)}`,
      clusterTitle: "Verified Technology Trends",
      clusterOrder: 0,
      parentTopicId: null,
      fingerprint: `verified_trend::${sourceFingerprint}`,
      source: "ai",
      status: "ready",
      priority: candidate.trendPriority === "critical" ? 100 : candidate.trendPriority === "high" ? 95 : 75,
      officialSources: [{ name: entry.sourceName, url: detail.finalUrl, domain: new URL(detail.finalUrl).hostname, sourceType: "official_release", title: entry.title, publishedAt: entry.publishedAt, retrievedAt: detail.retrievedAt, excerpt: detailText.slice(0, 12000), fingerprint: sourceFingerprint }],
      sourceVerifiedAt: new Date(),
      expiresAt: new Date(entry.publishedAt.getTime() + TREND_TTL_DAYS * 86400000),
      preemptRequestedAt: ["critical", "high"].includes(candidate.trendPriority) ? new Date() : undefined,
    });
    existingPlans.push(plan);
    verified += 1;
  }
  return { success: true, discovered: freshEntries.length, verified };
}

export async function reverifyTrendPlan(plan) {
  if (!plan?.isTrend || plan.articleType !== "verified_trend") return { success: true, plan };
  if (!plan.officialSources?.length || Number(plan.verificationScore || 0) < 90) return { success: false, message: "Trend lacks the required verified official evidence." };
  if (plan.expiresAt && new Date(plan.expiresAt) <= new Date()) return { success: false, message: "Verified trend has expired." };
  try {
    const refreshedSources = [];
    for (const source of plan.officialSources) {
      const result = await fetchOfficialText(source.url);
      const plain = stripMarkup(result.text).slice(0, 24000);
      const identityTokens = String(source.title || "").toLowerCase().match(/[a-z0-9][a-z0-9.-]{2,}/g) || [];
      const identityConfirmed = identityTokens.length > 0 && identityTokens.some((token) => plain.toLowerCase().includes(token));
      if (!plain || !identityConfirmed) {
        return { success: false, message: "Official source no longer confirms the stored release identity." };
      }
      refreshedSources.push({
        ...source,
        url: result.finalUrl,
        retrievedAt: result.retrievedAt,
        excerpt: plain.slice(0, 12000),
        fingerprint: fingerprint(`${result.finalUrl}|${plain}`),
      });
    }
    return { success: true, verifiedAt: new Date(), officialSources: refreshedSources };
  } catch (error) {
    return { success: false, message: `Official source re-verification failed: ${error.message}` };
  }
}

export async function auditTrendDraft(plan, draft) {
  if (!plan?.isTrend || plan.articleType !== "verified_trend") return { success: true };
  const evidence = (plan.officialSources || []).map((source) => `${source.title}\n${source.url}\n${source.excerpt}`).join("\n\n");
  const raw = await generateGeminiResponse(`Audit this technology trend article against the supplied official evidence. Extract material version, date, feature, breaking-change, compatibility, migration, security, performance, statistic and quotation claims. Fail if any material claim is unsupported or contradicted. Do not reward plausible outside knowledge; only supplied evidence counts.

VERIFIED CLAIMS:\n${(plan.verifiedClaims || []).join("\n")}
OFFICIAL EVIDENCE:\n${evidence}
ARTICLE:\n${String(draft?.content || "").slice(0, 30000)}

Return strict JSON only: {"passed":true,"unsupportedClaims":[],"contradictedClaims":[],"requiredQualifications":[],"reason":""}`,
  { temperature: 0, responseMimeType: "application/json", maxOutputTokens: 2500, thinkingBudget: 0, timeoutMs: 25000 });
  const audit = JSON.parse(String(raw).replace(/```json/gi, "").replace(/```/g, "").trim());
  const passed = audit.passed === true && !(audit.unsupportedClaims || []).length && !(audit.contradictedClaims || []).length && !(audit.requiredQualifications || []).length;
  return { success: passed, audit, message: passed ? "Trend claims verified." : audit.reason || "Trend draft contains claims not supported by official evidence." };
}

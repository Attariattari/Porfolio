import fs from "node:fs";
import path from "node:path";

const PAGE_FILE_PATTERN = /^page\.(js|jsx|ts|tsx)$/;
const ROUTE_GROUP_PATTERN = /^\([^/]+\)$/;
const PRIVATE_SEGMENT_PATTERN = /^_/;
const DYNAMIC_SEGMENT_PATTERN = /^\[.*\]$/;
const NON_PUBLIC_ROOTS = new Set(["admin", "api", "blog-image-upload"]);
const NON_PUBLIC_ROUTE_GROUPS = new Set(["(admin)"]);

function walkPageFiles(directory) {
  if (!fs.existsSync(directory)) return [];

  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return walkPageFiles(absolutePath);
    return PAGE_FILE_PATTERN.test(entry.name) ? [absolutePath] : [];
  });
}

function routeFromPageFile(appDirectory, pageFile) {
  const relativeDirectory = path.relative(appDirectory, path.dirname(pageFile));
  const rawSegments = relativeDirectory.split(path.sep).filter(Boolean);

  if (rawSegments.some((segment) => NON_PUBLIC_ROUTE_GROUPS.has(segment))) return null;

  const segments = rawSegments
    .filter((segment) => !ROUTE_GROUP_PATTERN.test(segment));

  if (segments.some((segment) => DYNAMIC_SEGMENT_PATTERN.test(segment))) return null;
  if (segments.some((segment) => PRIVATE_SEGMENT_PATTERN.test(segment))) return null;
  if (NON_PUBLIC_ROOTS.has(segments[0])) return null;

  return segments.length ? `/${segments.join("/")}` : "/";
}

function declaresDifferentCanonical(pageFile, route) {
  try {
    const source = fs.readFileSync(pageFile, "utf8");
    const canonicalMatch = source.match(
      /(?:buildCanonical|absoluteUrl)\(\s*["'`]([^"'`]+)["'`]\s*\)/,
    );

    return Boolean(
      canonicalMatch?.[1]?.startsWith("/") && canonicalMatch[1] !== route,
    );
  } catch {
    return false;
  }
}

function declaresNoIndex(pageFile) {
  try {
    const source = fs.readFileSync(pageFile, "utf8");
    return /robots\s*:\s*\{[\s\S]{0,300}?index\s*:\s*false/.test(source);
  } catch {
    return false;
  }
}

export function discoverPublicPageRoutes(appDirectory = path.join(process.cwd(), "src", "app")) {
  return [...new Set(
    walkPageFiles(appDirectory)
      .map((pageFile) => ({
        pageFile,
        route: routeFromPageFile(appDirectory, pageFile),
      }))
      .filter(({ route }) => route)
      .filter(({ pageFile, route }) => !declaresDifferentCanonical(pageFile, route))
      .filter(({ pageFile }) => !declaresNoIndex(pageFile))
      .map(({ route }) => route),
  )].sort((a, b) => a.localeCompare(b));
}

export function getPageSitemapMetadata(route) {
  const depth = route === "/" ? 0 : route.split("/").filter(Boolean).length;

  return {
    changeFrequency: depth === 0 ? "weekly" : depth === 1 ? "weekly" : "monthly",
    priority: depth === 0 ? 1 : depth === 1 ? 0.8 : 0.65,
  };
}

export function isPublishedSitemapItem(item = {}) {
  const status = item.publishStatus ?? item.status ?? "published";
  return status === "published";
}

export function getSafeSitemapSlug(item = {}) {
  const slug = String(item.slug || "").trim();
  if (!slug || slug.includes("/") || slug === "." || slug === "..") return null;
  return encodeURIComponent(slug);
}

export function getValidLastModified(item = {}) {
  const value = item.updatedAt || item.createdAt || item.date;
  if (!value) return undefined;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function uniqueSitemapEntries(entries = []) {
  const byUrl = new Map();

  for (const entry of entries) {
    if (!entry?.url) continue;
    const existing = byUrl.get(entry.url);
    if (!existing || (!existing.lastModified && entry.lastModified)) {
      byUrl.set(entry.url, entry);
    }
  }

  return [...byUrl.values()].sort((a, b) => a.url.localeCompare(b.url));
}

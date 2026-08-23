/**
 * Muhyo Tech - Senior Enterprise Offline-First Service Worker (v1.2.0)
 * 
 * Key Architecture:
 * 1. Fail-Safe Resilient Pre-caching (Never fails installation on missing asset)
 * 2. Instant Control Lifecycle (skipWaiting + clients.claim for zero-wait first loads)
 * 3. Stale-While-Revalidate for Next.js static chunks, JS, CSS, fonts, and images (0ms load time)
 * 4. Resilient Navigation Router for cold-start offline opening (No Dinosaur Page)
 * 5. 100% Security Isolation: Completely bypasses /admin, /api/admin, and auth routes
 * 6. Storage-Optimized Pruning: Automatic cache pruning on version updates
 */

const CACHE_VERSION = "muhyo-v1.2.0";
const STATIC_CACHE = `muhyo-static-${CACHE_VERSION}`;
const PAGES_CACHE = `muhyo-pages-${CACHE_VERSION}`;
const CHUNKS_CACHE = `muhyo-chunks-${CACHE_VERSION}`;
const API_CACHE = `muhyo-api-${CACHE_VERSION}`;

// Foundational assets to pre-cache on install
const CRITICAL_PRECACHE_URLS = [
  "/",
  "/logo.png",
  "/logo.webp",
  "/admin-manifest.json",
];

// Offline Standalone Fallback HTML in case an un-cached route is accessed cold offline
const OFFLINE_FALLBACK_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Offline Mode • Muhyo Tech</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #050811;
      color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
    }
    .card {
      max-width: 460px;
      width: 100%;
      background: radial-gradient(circle at 50% 0%, rgba(14,165,233,0.12), transparent 70%), #0a0f1c;
      border: 1px solid rgba(56,189,248,0.2);
      padding: 36px 28px;
      border-radius: 24px;
      box-shadow: 0 25px 60px rgba(0,0,0,0.85);
      text-align: center;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(245,158,11,0.15);
      border: 1px solid rgba(245,158,11,0.35);
      color: #fbbf24;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      padding: 4px 12px;
      border-radius: 999px;
      margin-bottom: 20px;
    }
    h1 { font-size: 22px; font-weight: 700; color: #ffffff; margin-bottom: 8px; }
    p { font-size: 13px; color: #94a3b8; line-height: 1.6; margin-bottom: 24px; }
    .btn-group { display: flex; gap: 10px; justify-content: center; }
    .btn {
      padding: 10px 20px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .btn-primary {
      background: #0ea5e9;
      color: #050811;
      border: none;
      box-shadow: 0 0 20px rgba(14,165,233,0.4);
    }
    .btn-primary:hover { background: #38bdf8; }
    .btn-secondary {
      background: rgba(255,255,255,0.06);
      color: #e2e8f0;
      border: 1px solid rgba(255,255,255,0.12);
    }
    .btn-secondary:hover { background: rgba(255,255,255,0.1); }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.58 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>
      Offline Mode
    </div>
    <h1>Muhyo Tech Portfolio</h1>
    <p>You are currently browsing offline. Previously viewed sections are ready in your local cache.</p>
    <div class="btn-group">
      <a href="/" class="btn btn-primary">Open Home Page</a>
      <button onclick="window.location.reload()" class="btn btn-secondary">Retry</button>
    </div>
  </div>
</body>
</html>`;

// 1. Install: Resilient fail-safe pre-caching
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const [staticCache, pagesCache] = await Promise.all([
        caches.open(STATIC_CACHE),
        caches.open(PAGES_CACHE),
      ]);

      // Cache fallback offline page
      await pagesCache.put(
        new Request("/__offline_fallback__"),
        new Response(OFFLINE_FALLBACK_HTML, {
          headers: { "Content-Type": "text/html; charset=utf-8" },
          status: 200,
        })
      );

      // Safe resilient caching: Cache each asset individually so one 404 does NOT break others
      await Promise.allSettled(
        CRITICAL_PRECACHE_URLS.map(async (url) => {
          try {
            const response = await fetch(url, { cache: "no-cache" });
            if (response && (response.status === 200 || response.type === "opaque")) {
              if (url === "/") {
                await pagesCache.put(url, response.clone());
              } else {
                await staticCache.put(url, response.clone());
              }
            }
          } catch (err) {
            // Silently suppress non-critical network drops during installation
          }
        })
      );
    })()
  );
  // Force immediate activation
  self.skipWaiting();
});

// 2. Activate: Clean up older cache namespaces and take instant control of all clients
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cacheKeys = await caches.keys();
      const currentCaches = [STATIC_CACHE, PAGES_CACHE, CHUNKS_CACHE, API_CACHE];

      await Promise.all(
        cacheKeys
          .filter((key) => key.startsWith("muhyo-") && !currentCaches.includes(key))
          .map((staleKey) => caches.delete(staleKey))
      );

      await self.clients.claim();
    })()
  );
});

// 3. Message handler: Cache warmup requests from client components
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "MUHYO_WARMUP_CACHE") {
    const targetUrl = event.data.url;
    if (targetUrl) {
      caches.open(PAGES_CACHE).then(async (cache) => {
        const existing = await cache.match(targetUrl);
        if (!existing) {
          try {
            const res = await fetch(targetUrl);
            if (res && res.status === 200) {
              cache.put(targetUrl, res);
            }
          } catch {}
        }
      });
    }
  }
});

// 4. Fetch: High-Performance Multi-Tier Routing Engine
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // A. Only intercept same-origin GET requests
  if (request.method !== "GET" || !url.origin.includes(self.location.origin)) {
    return;
  }

  // B. CRITICAL SECURITY: 100% Isolation for /admin, /api/admin, and analytics/tracking
  if (
    url.pathname.startsWith("/admin") ||
    url.pathname.startsWith("/api/admin") ||
    url.pathname.startsWith("/api/tracking") ||
    url.pathname.startsWith("/api/auth")
  ) {
    return;
  }

  // C. Development Mode Webpack HMR passthrough
  const isDev =
    self.location.hostname === "localhost" ||
    self.location.hostname === "127.0.0.1";

  if (isDev && (url.pathname.includes("/_next/webpack-hmr") || url.pathname.includes("/_next/static/development/"))) {
    return;
  }

  // D. Static Assets (Next.js Chunks, Stylesheets, Web Fonts, Images, Icons)
  // Strategy: Stale-While-Revalidate / Cache-First with Background Sync (0ms latency)
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".webp") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".jpeg") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".ico") ||
    url.pathname.endsWith(".woff2")
  ) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request);
        if (cached) {
          // Stale-While-Revalidate: Serve instant cache, refresh in background if online
          if (navigator.onLine) {
            fetch(request)
              .then((networkRes) => {
                if (networkRes && networkRes.status === 200) {
                  const targetCache = url.pathname.startsWith("/_next/static/") ? CHUNKS_CACHE : STATIC_CACHE;
                  caches.open(targetCache).then((c) => c.put(request, networkRes));
                }
              })
              .catch(() => {});
          }
          return cached;
        }

        // Not in cache: Fetch from network and save
        try {
          const networkRes = await fetch(request);
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            const targetCache = url.pathname.startsWith("/_next/static/") ? CHUNKS_CACHE : STATIC_CACHE;
            caches.open(targetCache).then((c) => c.put(request, clone));
          }
          return networkRes;
        } catch (err) {
          // Graceful fallback if static chunk cannot be fetched offline
          return new Response("", { status: 404, statusText: "Offline Asset Unavailable" });
        }
      })()
    );
    return;
  }

  // E. Public Content API Endpoints (/api/blogs, /api/services, /api/projects, etc.)
  // Strategy: Network-First with Cache Fallback
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      (async () => {
        try {
          const networkRes = await fetch(request);
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(API_CACHE).then((c) => c.put(request, clone));
          }
          return networkRes;
        } catch (err) {
          const cached = await caches.match(request);
          if (cached) return cached;
          return new Response(JSON.stringify({ error: "Offline Mode Active", offline: true }), {
            headers: { "Content-Type": "application/json" },
            status: 200,
          });
        }
      })()
    );
    return;
  }

  // F. HTML Navigation Requests (Home, Services, Blog, Projects, About, Contact, etc.)
  // Strategy: Network-First with Instant Multilayer Cache Fallback (Never show Dinosaur)
  if (
    request.mode === "navigate" ||
    request.headers.get("accept")?.includes("text/html") ||
    url.searchParams.has("_rsc")
  ) {
    event.respondWith(
      (async () => {
        try {
          // 1. Attempt Network Fetch
          const networkRes = await fetch(request);
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            const pagesCache = await caches.open(PAGES_CACHE);
            // Save request by exact URL and also clean pathname
            pagesCache.put(request, clone);
            if (url.pathname === "/") {
              pagesCache.put("/", networkRes.clone());
            }
          }
          return networkRes;
        } catch (err) {
          // 2. Offline / Cold-Start Triggered: Multilayer Cache Recovery
          const pagesCache = await caches.open(PAGES_CACHE);

          // Layer 1: Exact request match
          const exactMatch = await pagesCache.match(request);
          if (exactMatch) return exactMatch;

          // Layer 2: Clean pathname match (e.g. /services, /blog)
          const pathnameMatch = await pagesCache.match(url.pathname);
          if (pathnameMatch) return pathnameMatch;

          // Layer 3: Root Home Page match
          const rootMatch = await pagesCache.match("/");
          if (rootMatch) return rootMatch;

          // Layer 4: Standalone Fallback Offline Shell (Guaranteed 100% response)
          const fallbackShell = await pagesCache.match("/__offline_fallback__");
          if (fallbackShell) return fallbackShell;

          // Ultimate Fallback Response
          return new Response(OFFLINE_FALLBACK_HTML, {
            headers: { "Content-Type": "text/html; charset=utf-8" },
            status: 200,
          });
        }
      })()
    );
    return;
  }
});


/**
 * Muhyo Tech - High Performance Offline-First Service Worker
 * 
 * - Instant offline page rendering & asset delivery
 * - Stale-While-Revalidate for public pages and static chunks
 * - Network-First with Cache Fallback for public content APIs
 * - 100% Security Isolation: Bypasses /admin and /api/admin completely
 * - Dev Mode Protection: Never intercepts localhost Webpack HMR dev chunks
 */

const CACHE_VERSION = "muhyo-v1.0.1";
const STATIC_CACHE = `muhyo-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `muhyo-runtime-${CACHE_VERSION}`;
const API_CACHE = `muhyo-api-${CACHE_VERSION}`;

const CORE_STATIC_ASSETS = [
  "/",
  "/logo.png",
  "/logo.webp",
  "/admin-manifest.json",
  "/favicon.ico",
];

// Install: Pre-cache foundational public assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(CORE_STATIC_ASSETS).catch((err) => {
        console.warn("[ServiceWorker] Static pre-cache partial skip:", err);
      });
    })
  );
  self.skipWaiting();
});

// Activate: Prune stale caches from previous versions
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith("muhyo-") && !name.includes(CACHE_VERSION))
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch: Smart Caching Router
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Only handle same-origin GET requests
  if (request.method !== "GET" || !url.origin.includes(self.location.origin)) {
    return;
  }

  // 2. CRITICAL SECURITY: Never intercept /admin or /api/admin or telemetry
  if (
    url.pathname.startsWith("/admin") ||
    url.pathname.startsWith("/api/admin") ||
    url.pathname.startsWith("/api/tracking")
  ) {
    return;
  }

  // 3. Localhost Development Protection: Do not intercept dynamic dev chunks or Webpack HMR
  const isDevEnvironment =
    self.location.hostname === "localhost" ||
    self.location.hostname === "127.0.0.1";

  if (isDevEnvironment && (url.pathname.includes("/_next/webpack-hmr") || url.pathname.includes("/_next/static/development/"))) {
    return;
  }

  // 4. Production Static Assets (Next.js chunks, images, fonts, icons) -> Cache-First
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".webp") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".woff2")
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;

        return fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const clone = networkResponse.clone();
              caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
            }
            return networkResponse;
          })
          .catch((err) => {
            // Fail gracefully if dynamic chunk is temporarily missing
            return cachedResponse || new Response("", { status: 404 });
          });
      })
    );
    return;
  }

  // 5. Public Content APIs (/api/blogs, /api/services, /api/projects, /api/sync) -> Network-First with Cache Fallback
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(API_CACHE).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }

  // 6. Public HTML Pages (/, /services, /projects, /blog, /about, /contact) -> Network-First with Cache Fallback
  if (request.mode === "navigate" || request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            return caches.match("/").then((rootCached) => {
              return (
                rootCached ||
                new Response(
                  `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Offline • Muhyo Tech</title><style>body{background:#050811;color:#f8fafc;font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:24px;box-sizing:border-box;text-align:center}.card{max-width:440px;border:1px solid rgba(255,255,255,0.1);background:#0a0f1c;padding:36px;border-radius:24px;box-shadow:0 25px 60px rgba(0,0,0,0.8)}h1{font-size:22px;margin:16px 0 8px;color:#fff}p{font-size:13px;color:#94a3b8;line-height:1.6}button{margin-top:20px;padding:10px 24px;border-radius:12px;background:#0ea5e9;color:#050811;font-weight:700;border:none;cursor:pointer;font-size:13px}</style></head><body><div class="card"><svg width="48" height="48" fill="none" stroke="#38bdf8" stroke-width="2" viewBox="0 0 24 24" style="margin:0 auto"><line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.58 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg><h1>Offline Mode Active</h1><p>You are currently browsing offline. Cached sections remain available. Reconnect to sync latest content.</p><button onclick="window.location.reload()">Retry Connection</button></div></body></html>`,
                  {
                    headers: { "Content-Type": "text/html; charset=utf-8" },
                    status: 200,
                  }
                )
              );
            });
          });
        })
    );
    return;
  }
});

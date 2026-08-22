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
  "/manifest.json",
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

  // 6. Public HTML Pages (/, /services, /projects, /blog, /about, /contact) -> Stale-While-Revalidate
  if (request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const clone = networkResponse.clone();
              caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
            }
            return networkResponse;
          })
          .catch(() => {
            return cachedResponse || caches.match("/");
          });

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }
});

/**
 * Sport Mentor – Service Worker
 *
 * Strategy:
 *  - Static Next.js assets (/_next/static/*)  → cache-first (immutable hashed filenames)
 *  - Navigation requests                        → network-first with cached-page fallback
 *  - Everything else (API, images, etc.)        → network-first with cache fallback
 *  - POST requests are never cached             → pass-through
 *
 * Background Sync:
 *  When the SW receives a 'sync' event with tag 'offline-sync' it posts a
 *  SYNC_QUEUED_ITEMS message to all open windows so they can flush the
 *  IndexedDB queue through the /api/sync/* endpoints.
 */

const CACHE_VERSION = "v1";
const STATIC_CACHE = `sport-mentor-static-${CACHE_VERSION}`;
const PAGE_CACHE = `sport-mentor-pages-${CACHE_VERSION}`;
const OFFLINE_CACHE = `sport-mentor-offline-${CACHE_VERSION}`;
const SYNC_TAG = "offline-sync";

// ── Install ──────────────────────────────────────────────────────────────────

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(OFFLINE_CACHE)
      .then((cache) => cache.addAll(["/offline"]))
      .then(() => self.skipWaiting())
  );
});

// ── Activate ─────────────────────────────────────────────────────────────────

self.addEventListener("activate", (event) => {
  const validCaches = [STATIC_CACHE, PAGE_CACHE, OFFLINE_CACHE];
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => !validCaches.includes(k))
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ── Helpers ───────────────────────────────────────────────────────────────────

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return new Response("Fără conexiune", { status: 503 });
  }
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    // Only cache successful non-opaque responses
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;

    // Navigation fallback → offline page
    if (request.mode === "navigate") {
      const offlineCache = await caches.open(OFFLINE_CACHE);
      const offline = await offlineCache.match("/offline");
      if (offline) return offline;
    }
    return new Response("Fără conexiune", { status: 503 });
  }
}

// ── Fetch ─────────────────────────────────────────────────────────────────────

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // Never cache non-GET requests (POST/PUT/DELETE pass through to the network)
  if (event.request.method !== "GET") return;

  // Never cache sync API calls
  if (url.pathname.startsWith("/api/sync/")) return;

  // Cache-first for immutable Next.js static chunks
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(event.request, STATIC_CACHE));
    return;
  }

  // Network-first for everything else (pages, other API GETs, fonts)
  event.respondWith(networkFirst(event.request, PAGE_CACHE));
});

// ── Background Sync ───────────────────────────────────────────────────────────

self.addEventListener("sync", (event) => {
  if (event.tag === SYNC_TAG) {
    event.waitUntil(notifyClientsToSync());
  }
});

async function notifyClientsToSync() {
  const clients = await self.clients.matchAll({ type: "window" });
  for (const client of clients) {
    client.postMessage({ type: "SYNC_QUEUED_ITEMS" });
  }
}

// ── Messages from page ────────────────────────────────────────────────────────

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
  if (event.data?.type === "REGISTER_SYNC") {
    self.registration.sync
      .register(SYNC_TAG)
      .catch(() => {
        // Background Sync API not supported; the page handles sync itself
      });
  }
});

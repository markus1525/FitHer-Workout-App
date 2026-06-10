/**
 * FitHer Service Worker
 * - Offline caching (app shell strategy)
 * - Push notification handler (for future push server integration)
 * - Local scheduled notification via postMessage (no push server needed)
 */

const CACHE_NAME = "fither-v1";
const BASE = "/FitHer-Workout-App";
const OFFLINE_URL = BASE + "/offline.html";
const ICON_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663523605261/3PvwNR8VybWQnjqXPU9foG/fither-icon-79aubkohDz4ENMLsKWHnyj.png";

// App shell pages to pre-cache on install
const PRECACHE_URLS = [
  BASE + "/",
  BASE + "/index.html",
  BASE + "/manifest.json",
  OFFLINE_URL,
];

// ─── Install: pre-cache app shell ────────────────────────────────────────────
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(PRECACHE_URLS).catch(() => {
        // Pre-cache failures are non-fatal; individual pages still get cached on fetch
      })
    )
  );
  self.skipWaiting();
});

// ─── Activate: clear old caches ──────────────────────────────────────────────
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ─── Fetch: network-first, fall back to cache, then offline page ─────────────
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;

  const url = e.request.url;

  // Skip cross-origin requests (CDN assets, YouTube, etc.)
  if (!url.startsWith(self.location.origin)) return;

  e.respondWith(
    fetch(e.request)
      .then((res) => {
        // Cache successful app-shell responses
        if (url.includes(BASE)) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() =>
        caches.match(e.request).then(
          (cached) => cached || caches.match(OFFLINE_URL)
        )
      )
  );
});

// ─── Push: handle server-sent push notifications ─────────────────────────────
// (For future backend/push server integration)
self.addEventListener("push", (e) => {
  let data = { title: "FitHer 💪", body: "Time to work out! You got this." };
  try {
    data = e.data?.json() ?? data;
  } catch {}

  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: ICON_URL,
      badge: ICON_URL,
      tag: "fither-reminder",
      renotify: true,
      vibrate: [200, 100, 200],
      data: { url: BASE + "/" },
    })
  );
});

// ─── Notification click: focus or open the app ───────────────────────────────
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const target = e.notification.data?.url || BASE + "/";
  e.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((cs) => {
        const existing = cs.find((c) => c.url.includes(BASE));
        if (existing) return existing.focus();
        return clients.openWindow(target);
      })
  );
});

// ─── Message: local scheduled notifications (no push server needed) ───────────
// The app posts { type: "SCHEDULE_NOTIFICATION", delay, title, body } to the SW.
// The SW fires a notification after `delay` ms. Works while the browser is alive
// in background (Android Chrome keeps PWA service workers running).
//
// For true offline/closed-browser delivery, integrate a push server (e.g., web-push
// npm package with VAPID keys) and change the push event handler above.
const scheduledTimers = new Map();

self.addEventListener("message", (e) => {
  const msg = e.data;
  if (!msg) return;

  if (msg.type === "SCHEDULE_NOTIFICATION") {
    const { id = "default", delay, title, body } = msg;
    // Clear any existing timer for this id
    if (scheduledTimers.has(id)) clearTimeout(scheduledTimers.get(id));

    if (delay > 0) {
      const timer = setTimeout(() => {
        self.registration.showNotification(title || "FitHer 💪", {
          body: body || "Time to work out! You got this.",
          icon: ICON_URL,
          badge: ICON_URL,
          tag: "fither-reminder",
          renotify: true,
          vibrate: [200, 100, 200],
          data: { url: BASE + "/" },
        });
        scheduledTimers.delete(id);
      }, delay);
      scheduledTimers.set(id, timer);
    }
  }

  if (msg.type === "CANCEL_NOTIFICATION") {
    const { id = "default" } = msg;
    if (scheduledTimers.has(id)) {
      clearTimeout(scheduledTimers.get(id));
      scheduledTimers.delete(id);
    }
  }
});

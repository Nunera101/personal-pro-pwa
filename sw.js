const CACHE_NAME = "personal-pro-pwa-v53";
const CRITICAL_ASSETS = new Set(["/", "/index.html", "/app.js", "/styles.css", "/manifest.json"]);
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css?v=53",
  "./app.js?v=53",
  "./manifest.json",
  "./assets/logo-oficial.svg",
  "./assets/elite-as-wordmark.svg",
  "./assets/favicon.svg",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./assets/icon-maskable-512.png",
  "./assets/apple-touch-icon.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: "window", includeUncontrolled: true }))
      .then((clients) => {
        return Promise.all(
          clients.map((client) => {
          client.postMessage({ type: "ELITE_AS_APP_UPDATED", version: CACHE_NAME });
            if ("navigate" in client) return client.navigate(client.url);
            return Promise.resolve();
          })
        );
      })
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(event.request.url);
  if (requestUrl.pathname.startsWith("/api/") || requestUrl.hostname === "personal-pro-pwa-production.up.railway.app") {
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request, { cache: "no-store" })
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put("./index.html", copy));
          return response;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  const isCriticalAsset = CRITICAL_ASSETS.has(requestUrl.pathname) || requestUrl.pathname.endsWith("/app.js") || requestUrl.pathname.endsWith("/styles.css");

  if (isCriticalAsset) {
    event.respondWith(
      fetch(event.request, { cache: "no-store" })
        .then((response) => {
          if (response && response.status === 200) {
            const responseCopy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseCopy));
          }
          return response;
        })
        .catch(() => caches.match(event.request).then((cachedResponse) => cachedResponse || caches.match("./index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const networkFetch = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseCopy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseCopy));
          }
          return response;
        })
        .catch(() => cachedResponse);

      return cachedResponse || networkFetch;
    })
  );
});


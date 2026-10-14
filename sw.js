// MCDSaveEdit offline cache. The page itself is fetched fresh when online (so updates arrive) and from the cache when offline.
const CACHE = "mcdsaveedit-1792000986";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png", "./apple-touch-icon.png"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith("mcdsaveedit-") && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", (e) => {
  const req = e.request; if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (req.mode === "navigate") {   // network first, cached page offline
    e.respondWith(fetch(req).then((r) => { const copy = r.clone(); caches.open(CACHE).then((c) => c.put("./index.html", copy)); return r; }).catch(() => caches.match("./index.html")));
    return;
  }
  if (url.origin === location.origin || url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {   // cache, refresh in background
    e.respondWith(caches.match(req).then((hit) => { const net = fetch(req).then((r) => { if (r.ok || r.type === "opaque") { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); } return r; }).catch(() => hit); return hit || net; }));
  }
  // everything else (e.g. the GitHub icon download) goes straight to the network
});

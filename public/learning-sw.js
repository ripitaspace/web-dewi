const CACHE = "puspita-learning-v1";
const isLearningRequest = (request) => {
  if (request.method !== "GET") return false;
  const url = new URL(request.url);
  return url.origin === self.location.origin && (url.pathname.startsWith("/belajar") || url.pathname.startsWith("/learning/") || url.pathname.startsWith("/_next/static/"));
};
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (event) => {
  if (!isLearningRequest(event.request)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const response = await fetch(event.request);
      if (response.ok && response.type !== "opaque") cache.put(event.request, response.clone());
      return response;
    } catch {
      const cached = await cache.match(event.request);
      if (cached) return cached;
      throw new Error("Materi belum tersedia secara offline.");
    }
  })());
});

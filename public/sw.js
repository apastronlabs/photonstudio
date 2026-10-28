const CACHE_NAME = 'photonstudio-cache-v8';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);
  if (!url.protocol.startsWith('http')) return;

  // IMPORTANT: Only handle same-origin requests.
  // Cross-origin assets (media.photonstudio.ai, firebasestorage.googleapis.com, Google Fonts/Analytics)
  // must be handled natively by the browser HTTP cache to avoid CORS policy blocks and media streaming issues.
  if (url.origin !== self.location.origin) return;

  // Do not intercept streaming video/audio Range requests in the service worker
  if (event.request.headers.get('Range')) return;

  event.respondWith(handleCacheRequest(event.request));
});

async function handleCacheRequest(request) {
  const url = new URL(request.url);
  const isHtml = request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname === '/' || !url.pathname.includes('.');
  
  const cache = await caches.open(CACHE_NAME);

  if (isHtml) {
    try {
      const response = await fetch(request);
      if (response && response.status === 200) {
        cache.put(request, response.clone()).catch(() => {});
      }
      return response;
    } catch (error) {
      const cachedResponse = await cache.match(request);
      if (cachedResponse) return cachedResponse;
      throw error;
    }
  }

  // Static assets: Cache-first with network fallback
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      cache.put(request, response.clone()).catch(() => {});
    }
    return response;
  } catch (error) {
    return fetch(request);
  }
}

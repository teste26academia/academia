const CACHE_NAME = 'academia-pro-v2';
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.svg', './icon-512.svg'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE_NAME ? caches.delete(k) : null))).then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request).then(fetchResp => {
      const cloned = fetchResp.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, cloned)).catch(()=>{});
      return fetchResp;
    }).catch(() => caches.match('./index.html')))
  );
});

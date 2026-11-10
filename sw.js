/* Trashy offline support.
   The page itself is fetched fresh when online (so updates show up), with the saved copy used offline.
   Everything else (models, libraries, fonts) is saved the first time it loads and then used from the phone.
   Change VERSION whenever a model or library file changes, so phones fetch the new files. */
const VERSION = 'trashy-v1';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/apple-touch-icon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

/* on the first visit the page loads its models before this worker is running, so it sends the list of files to save */
self.addEventListener('message', (e) => {
  const urls = (e.data && e.data.cache || []).filter((u) => new URL(u).origin === location.origin);
  e.waitUntil(caches.open(VERSION).then((c) => Promise.all(urls.map((u) => c.match(u).then((hit) => hit || c.add(u).catch(() => {}))))));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.mode === 'navigate') {
    const u = new URL(req.url); u.search = '';
    e.respondWith(fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(u.href, copy)); }
      return res;
    }).catch(() => caches.match(u.href).then((hit) => hit || caches.match('index.html'))));
    return;
  }
  e.respondWith(caches.match(req, { ignoreSearch: true }).then((hit) => hit || fetch(req).then((res) => {
    if (res.ok && res.type === 'basic') { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
    return res;
  })));
});

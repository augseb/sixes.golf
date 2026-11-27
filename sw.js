// SIXES.golf offline cache. Bump V at every publish.
const V = 'sixes-3.5-1';
const FILES = ['./', 'index.html', 'app.enc', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png', 'icon-1024.png', 'favicon-32.png', 'favicon-64.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const u = new URL(req.url); if (u.origin !== location.origin) return;
  const shell = u.pathname.endsWith('/') || /\/(index\.html|app\.enc|sw\.js|manifest\.webmanifest)$/.test(u.pathname);   // Beta 3.3.2: the manifest too, so a name or icon change lands at once
  if (shell) {   // the page and the locked app: the network first, so a publish lands at once. The cache only with no signal.
    e.respondWith(fetch(req, { cache: 'no-store' }).then(r => { if (r.ok) { const cp = r.clone(); caches.open(V).then(c => c.put(req, cp)); } return r; })
      .catch(() => caches.match(req, { ignoreSearch: true })));
    return;
  }
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(r => { if (r.ok) { const cp = r.clone(); caches.open(V).then(c => c.put(req, cp)); } return r; })));
});

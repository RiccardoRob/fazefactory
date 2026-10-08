/* Fazefactory® service worker
   · the page (navigation): network first, so a new version is seen at once; the cached copy only when offline
   · own static files (i18n.json, icons, manifest): stale-while-revalidate, instant and quietly refreshed
   · the font (Host Grotesk) is local: cached with the other files
   Bump VERSION whenever files change: the old cache is deleted on activation. */
const VERSION = 'ff-astro-6';
const CORE = [
  '/',
  '/i18n.json',
  '/sky.json',
  '/fonts/host-grotesk-latin.woff2',
  '/favicon.svg',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

const put = (req, res) => {
  if (res && (res.ok || res.type === 'opaque')) {
    const copy = res.clone();
    caches.open(VERSION).then(c => c.put(req, copy));
  }
  return res;
};

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // `npm run dev` serves source files (/src, /@vite, /node_modules): never cache those, or edits seem not to work
  if (/^\/(src|@|node_modules)\b/.test(url.pathname)) return;

  // the page itself
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(res => put('/', res)).catch(() => caches.match('/'))
    );
    return;
  }

  // everything else from this site
  if (url.origin === self.location.origin) {
    e.respondWith(
      caches.match(req).then(hit => {
        const net = fetch(req).then(res => put(req, res)).catch(() => hit);
        return hit || net;
      })
    );
  }
});

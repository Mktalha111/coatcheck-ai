/* CoatCheck AI service worker
   - pages: try the network first so updates show up, but use the saved copy when the visitor is
     offline, the host answers with an error, or the host takes too long
   - everything else (fonts, icons): saved copy first
   Only same-origin requests are handled: the app never talks to another server. */
const CACHE = 'cc-v7';
const HOME = new URL('./', self.location).href;
const APP = new URL('./app', self.location).href;
const PATIENCE_MS = 4000;                // a hanging host must not leave a returning visitor on a blank page
const CORE = [
  './', './app', './assets/fonts/fonts.css',
  './assets/fonts/fraunces-latin.woff2', './assets/fonts/instrument-sans-latin.woff2',
  './assets/fonts/jetbrains-mono-latin.woff2', './assets/fonts/caveat-latin.woff2',
  './assets/icon-192.png'
];
const hostTrouble = status => status >= 500 || status === 402 || status === 429;
// A redirected response cannot be replayed for a page load, so it is never saved.
const saveable = res => res.ok && !res.redirected;

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(CORE.map(u =>
        fetch(u, { cache: u === './' || u === './app' ? 'no-cache' : 'default' })
          .then(res => saveable(res) ? c.put(u, res) : undefined)
          .catch(() => {})                // one missing file must not break the install
      )))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

async function loadPage(e, url) {
  const cache = await caches.open(CACHE);
  // "?demo" shares one saved copy, and /app.html and /app are the same page
  const key = url.origin + url.pathname.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
  const saved = (await cache.match(key)) || (await cache.match(APP)) || (await cache.match(HOME));
  let saving = Promise.resolve();
  const network = fetch(e.request).then(res => {
    if (saveable(res)) saving = cache.put(key, res.clone());
    return res;
  });
  e.waitUntil(network.then(() => saving, () => {}));
  if (!saved) return network;             // very first visit: nothing saved yet
  const res = await Promise.race([
    network.catch(() => null),
    new Promise(done => setTimeout(() => done(null), PATIENCE_MS))
  ]);
  return !res || hostTrouble(res.status) ? saved : res;
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (req.mode === 'navigate') { e.respondWith(loadPage(e, url)); return; }

  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (saveable(res)) { const copy = res.clone(); e.waitUntil(caches.open(CACHE).then(c => c.put(req, copy))); }
      return res;
    }))
  );
});

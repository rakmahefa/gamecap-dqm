/* DQM2 Offline Compendium — service worker.
   Precaches the shell and every monster icon, then serves cache-first so the
   whole compendium keeps working with the network switched off. */

/* Bump this whenever the caching strategy changes: `activate` deletes every
   other cache, which also clears the stale shell left by older versions. */
const CACHE = 'dqm2-offline-v3';
const CORE = ['./', './index.html', './offline-assets.json', './img/hero.jpg', './favicon.svg'];

const absolute = (path) => new URL(path, self.registration.scope).toString();

/** Cache the hashed JS/CSS bundles referenced by the built index.html,
 *  so the very first visit is enough to go fully offline. */
async function cacheShell(cache) {
  try {
    const res = await fetch(absolute('./index.html'), { cache: 'no-cache' });
    if (!res.ok) return;
    const html = await res.clone().text();
    await cache.put(absolute('./index.html'), res);
    const refs = new Set();
    const re = /(?:src|href)="\.\/([^"]+)"/g;
    let m;
    while ((m = re.exec(html))) {
      const path = m[1];
      if (/\.(js|css|webmanifest|svg)$/.test(path)) refs.add('./' + path);
    }
    await Promise.all([...refs].map((p) => cache.add(absolute(p)).catch(() => undefined)));
  } catch {
    /* the fetch handler will cache the bundles on demand */
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      await Promise.all(CORE.map((p) => cache.add(absolute(p)).catch(() => undefined)));
      await cacheShell(cache);
      try {
        const res = await fetch(absolute('./offline-assets.json'));
        const data = await res.json();
        const icons = Array.isArray(data.icons) ? data.icons : [];
        for (let i = 0; i < icons.length; i += 60) {
          await Promise.all(
            icons.slice(i, i + 60).map((p) => cache.add(absolute(p)).catch(() => undefined)),
          );
        }
      } catch {
        /* icons will be cached on demand by the fetch handler */
      }
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // The HTML shell is network-first so a new deployment (which references new
  // hashed bundles) is picked up as soon as the app is opened online. The
  // hashed JS/CSS and icons stay cache-first, since their URLs change on every
  // build and can never be stale.
  const isShell =
    req.mode === 'navigate' ||
    url.pathname.endsWith('/index.html') ||
    url.pathname.endsWith('/');

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);

      if (isShell) {
        try {
          const res = await fetch(req, { cache: 'no-cache' });
          if (res && res.ok) {
            await cache.put(req, res.clone());
            await cache.put(absolute('./index.html'), res.clone());
          }
          return res;
        } catch {
          const fallback =
            (await cache.match(req)) || (await cache.match(absolute('./index.html')));
          if (fallback) return fallback;
          throw new Error('Offline and no cached shell available');
        }
      }

      const hit = await cache.match(req);
      if (hit) return hit;
      const res = await fetch(req);
      if (res && res.ok) cache.put(req, res.clone());
      return res;
    })(),
  );
});

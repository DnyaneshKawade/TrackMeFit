// Service worker: lets the app open without a connection and makes it
// installable. Pages and built files are cached as they load; Supabase
// requests (sign-in and data) always go to the network.
const CACHE = 'tmf-v1'

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  const url = new URL(req.url)
  if (req.method !== 'GET' || url.origin !== self.location.origin) return

  // Pages: network first so updates show at once, cached copy when offline.
  // Plain pages such as /privacy.html keep their own copy, not the app's.
  if (req.mode === 'navigate') {
    const key = /\.html$/.test(url.pathname) && url.pathname !== '/index.html' ? url.pathname : '/'
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone()
          caches.open(CACHE).then((c) => c.put(key, copy))
          return res
        })
        .catch(() => caches.match(key)),
    )
    return
  }

  // Built files have content hashes in their names, so a cached copy never goes stale.
  event.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.ok) {
            const copy = res.clone()
            caches.open(CACHE).then((c) => c.put(req, copy))
          }
          return res
        }),
    ),
  )
})

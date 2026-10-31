// Service worker: salvează toate fișierele jocului ca să meargă complet fără internet.
// Lista FILES se reface automat cu: node tools/update-sw.mjs

const VERSION = 'mimi-202610310721';
const FILES = [
  './',
  'index.html',
  'manifest.webmanifest',
  'styles/main.css',
  'src/art/figure.js',
  'src/art/mimiLive.js',
  'src/art/patterns.js',
  'src/art/room.js',
  'src/art/svg.js',
  'src/core/audio.js',
  'src/core/bus.js',
  'src/core/defaults.js',
  'src/core/economy.js',
  'src/core/history.js',
  'src/core/input.js',
  'src/core/pet.js',
  'src/core/quests.js',
  'src/core/save.js',
  'src/core/scenes.js',
  'src/core/ui.js',
  'src/core/util.js',
  'src/core/wardrobe.js',
  'src/data/beauty.js',
  'src/data/catalog.js',
  'src/data/clothes.js',
  'src/data/colors.js',
  'src/data/furniture.js',
  'src/data/photo.js',
  'src/data/quests.js',
  'src/main.js',
  'src/scenes/atelier.js',
  'src/scenes/common.js',
  'src/scenes/games.js',
  'src/scenes/home.js',
  'src/scenes/index.js',
  'src/scenes/menu.js',
  'src/scenes/parents.js',
  'src/scenes/photo.js',
  'src/scenes/quests.js',
  'src/scenes/room.js',
  'src/scenes/runway.js',
  'src/scenes/salon.js',
  'src/scenes/shop.js',
  'src/scenes/tailor.js',
  'src/scenes/wardrobe.js',
  'assets/icons/icon-192.png',
  'assets/icons/icon-512.png',
  'assets/icons/icon-maskable-512.png',
  'assets/icons/icon-maskable.svg',
  'assets/icons/icon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// Întâi din cache (merge offline), apoi din rețea; ce vine din rețea se salvează pentru data viitoare.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match('index.html'))),
  );
});

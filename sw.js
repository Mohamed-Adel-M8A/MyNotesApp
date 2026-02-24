const CACHE_NAME = 'mynotes-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-512.png',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap',
  'https://cdn.jsdelivr.net/gh/Mohamed-Adel-M8A/MyNotesApp/Main.v6.css',
  'https://cdn.jsdelivr.net/gh/Mohamed-Adel-M8A/MyNotesApp/Main.v37.js',
  'https://cdn.jsdelivr.net/gh/Mohamed-Adel-M8A/MyNotesApp/UI.v11.js',
  'https://cdn.jsdelivr.net/gh/Mohamed-Adel-M8A/MyNotesApp/storage.v3.js',
  'https://cdn.jsdelivr.net/gh/Mohamed-Adel-M8A/MyNotesApp/Editor.v3.js',
  'https://cdn.jsdelivr.net/gh/Mohamed-Adel-M8A/MyNotesApp/exporter.js',
  'https://cdn.jsdelivr.net/gh/Mohamed-Adel-M8A/MyNotesApp/timer.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching all assets...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

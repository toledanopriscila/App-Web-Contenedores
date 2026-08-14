self.addEventListener('install', (e) => {
  console.log('Service Worker instalado con éxito');
});

self.addEventListener('fetch', (e) => {
  // Permite que la app funcione correctamente en red
  e.respondWith(fetch(e.request));
});
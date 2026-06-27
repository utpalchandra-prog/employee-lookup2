// Intentionally empty — no caching
self.addEventListener('install', function(){ self.skipWaiting(); });
self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){ return caches.delete(k); }));
    }).then(function(){ 
      self.clients.claim();
      return self.registration.unregister(); 
    })
  );
});
// Pass all requests directly to network — no caching at all
self.addEventListener('fetch', function(e){
  e.respondWith(fetch(e.request));
});

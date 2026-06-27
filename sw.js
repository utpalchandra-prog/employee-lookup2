// This service worker intentionally clears all caches and unregisters itself
// so the app always loads fresh from the network

self.addEventListener('install', function(e){
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    // Delete ALL caches
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){ return caches.delete(k); }));
    }).then(function(){
      return self.clients.claim();
    }).then(function(){
      // Tell all open clients to reload
      return self.clients.matchAll({includeUncontrolled:true});
    }).then(function(clients){
      clients.forEach(function(client){ client.navigate(client.url); });
    })
  );
});

// No caching — pass everything straight to network
self.addEventListener('fetch', function(e){
  e.respondWith(fetch(e.request));
});

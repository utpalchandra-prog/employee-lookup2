var CACHE = 'emp-lookup-v14';
var ASSETS = [
  '/employee-lookup/',
  '/employee-lookup/index.html',
  'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js'
];

self.addEventListener('install', function(e){
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(function(c){ return c.addAll(ASSETS); })
  );
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){ return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

// NEVER serve HTML from cache — always fetch fresh from network
self.addEventListener('fetch', function(e){
  var url = e.request.url;
  var isHTML = url.indexOf('.html') !== -1
    || url.endsWith('/employee-lookup/')
    || url.endsWith('/employee-lookup');

  if(isHTML){
    e.respondWith(
      fetch(e.request, {cache:'no-store'}).then(function(resp){ return resp; })
      .catch(function(){ return caches.match(e.request); })
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(function(cached){
        return cached || fetch(e.request).then(function(resp){
          var r=resp.clone();
          caches.open(CACHE).then(function(c){ c.put(e.request,r); });
          return resp;
        });
      })
    );
  }
});

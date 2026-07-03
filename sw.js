var VERSION = 'v16';
var CACHE = 'ongc-' + VERSION;

self.addEventListener('install', function(e){
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(function(c){
      return c.addAll([
        'index.html',
        'manifest.json',
        'icon-192.png',
        'icon-512.png',
        'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js'
      ]);
    })
  );
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE; })
            .map(function(k){ return caches.delete(k); })
      );
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  var url = e.request.url;
  // Always network first for HTML so updates load — fallback to cache offline
  var isHTML = url.endsWith('.html') || 
               url.endsWith('/employee-lookup2/') || 
               url.endsWith('/employee-lookup2');
  if(isHTML){
    e.respondWith(
      fetch(e.request).then(function(resp){
        var copy = resp.clone();
        caches.open(CACHE).then(function(c){ c.put(e.request, copy); });
        return resp;
      }).catch(function(){
        return caches.match(e.request); // offline fallback
      })
    );
  } else {
    // Cache first for all other assets
    e.respondWith(
      caches.match(e.request).then(function(cached){
        return cached || fetch(e.request).then(function(resp){
          var copy = resp.clone();
          caches.open(CACHE).then(function(c){ c.put(e.request, copy); });
          return resp;
        });
      })
    );
  }
});

var CACHE = 'emp-lookup-v13';
var ASSETS = [
  '/employee-lookup/',
  '/employee-lookup/index.html',
  'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js'
];

// Install — cache assets fresh
self.addEventListener('install', function(e){
  self.skipWaiting(); // activate immediately, don't wait
  e.waitUntil(
    caches.open(CACHE).then(function(c){ return c.addAll(ASSETS); })
  );
});

// Activate — wipe ALL old caches immediately
self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.map(function(k){
          if(k !== CACHE){
            console.log('Deleting old cache:', k);
            return caches.delete(k);
          }
        })
      );
    }).then(function(){
      return self.clients.claim(); // take control of all open tabs immediately
    })
  );
});

// Fetch — ALWAYS network first for HTML so updates reach phone instantly
self.addEventListener('fetch', function(e){
  var url = e.request.url;
  var isHTML = url.indexOf('.html') !== -1 
    || url.endsWith('/employee-lookup/') 
    || url.endsWith('/employee-lookup');

  if(isHTML){
    // Network first — always get latest HTML
    e.respondWith(
      fetch(e.request, {cache: 'no-cache'}).then(function(resp){
        var r = resp.clone();
        caches.open(CACHE).then(function(c){ c.put(e.request, r); });
        return resp;
      }).catch(function(){
        // Offline fallback
        return caches.match(e.request);
      })
    );
  } else {
    // Cache first for JS/assets (they don't change often)
    e.respondWith(
      caches.match(e.request).then(function(cached){
        return cached || fetch(e.request).then(function(resp){
          var r = resp.clone();
          caches.open(CACHE).then(function(c){ c.put(e.request, r); });
          return resp;
        });
      })
    );
  }
});

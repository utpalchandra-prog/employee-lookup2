var CACHE = 'emp-lookup-v10';
var ASSETS = [
  '/employee-lookup/',
  '/employee-lookup/index.html',
  'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js'
];

// Install — cache all assets
self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){ return c.addAll(ASSETS); })
  );
  self.skipWaiting(); // activate immediately
});

// Activate — delete old caches
self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE; })
            .map(function(k){ return caches.delete(k); })
      );
    })
  );
  self.clients.claim(); // take control immediately
});

// Fetch — network first for HTML (always get latest), cache first for assets
self.addEventListener('fetch', function(e){
  var url = e.request.url;
  
  // For HTML pages — always try network first so updates are picked up
  if(url.indexOf('.html') !== -1 || url.endsWith('/employee-lookup/') || url.endsWith('/employee-lookup')){
    e.respondWith(
      fetch(e.request).then(function(resp){
        var r = resp.clone();
        caches.open(CACHE).then(function(c){ c.put(e.request, r); });
        return resp;
      }).catch(function(){
        return caches.match(e.request);
      })
    );
    return;
  }

  // For everything else — cache first, fallback to network
  e.respondWith(
    caches.match(e.request).then(function(cached){
      return cached || fetch(e.request).then(function(resp){
        var r = resp.clone();
        caches.open(CACHE).then(function(c){ c.put(e.request, r); });
        return resp;
      });
    }).catch(function(){
      return caches.match('/employee-lookup/index.html');
    })
  );
});

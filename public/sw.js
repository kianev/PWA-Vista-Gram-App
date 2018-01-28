let CACHE_STATIC_NAME = 'static-v15';
let CACHE_DYNAMIC_NAME = 'dynamic-v2';
let STATIC_FILES = [
  '/',
  '/index.html',
  '/offline.html',
  '/src/js/app.js',
  '/src/js/feed.js',
  '/src/js/promise.js',
  '/src/js/fetch.js',
  '/src/js/material.min.js',
  '/src/css/app.css',
  '/src/css/feed.css',
  'src/images/main-image.jpg',
  'https://fonts.googleapis.com/css?family=Roboto:400,700',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
];

/*function trimCache (cacheName, itemsMax) {
  caches.open(cacheName)
    .then(cache => {
     return cache.keys()
       .then(keys => {
        if (keys.length > itemsMax) {
          cache.delete(keys[0])
            .then(trimCache(cacheName, itemsMax))
        }
       })
    })
}*/

self.addEventListener('install', function (event) {
  console.log('[serviceWorker] installing service worker...', event);
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME)
      .then((cache) => {
        console.log('[serviceWorker] precaching app shell');
        cache.addAll(STATIC_FILES);
      })
  );
});

self.addEventListener('activate', function (event) {
  console.log('[serviceWorker] activating service worker...', event);
  event.waitUntil(
    caches.keys()
      .then(keyList => {
        return Promise.all(keyList.map(key => {
          if(key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
            console.log('[serviceWorker removing old cash]', key);
            return caches.delete(key);
          }
        }));
      })
  );
  return self.clients.claim();
});

function isInArray (string, array) {
  let cachePath;
  if (string.indexOf(self.origin) === 0) {
    console.log('matched ', string);
    cachePath = string.substring(self.origin.length);
  } else {
    cachePath = string;
  }
  return array.indexOf(cachePath) > -1;
}

//Cash then Network strategy with offline support
self.addEventListener('fetch', function (event) {
  let url = 'https://httpbin.org/get';

  if(event.request.url.indexOf(url) > -1) {
    event.respondWith(
      caches.open(CACHE_DYNAMIC_NAME)
        .then(cache => {
          return fetch(event.request)
            .then(res => {
              //trimCache(CACHE_DYNAMIC_NAME, 10);
              cache.put(event.request, res.clone());
              return res;
            })
        })
    );
  } else if(isInArray(event.request.url, STATIC_FILES)) {
    event.respondWith(caches.match(event.request));
  } else {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if(response) {
            return response;
          } else {
            return fetch(event.request)
              .then(res => {
                return caches.open(CACHE_DYNAMIC_NAME)
                  .then(cache => {
                    cache.put(event.request.url, res.clone());
                    return res;
                  })
              })
              .catch(err => {
                return caches.open(CACHE_STATIC_NAME)
                  .then(cache => {
                    if(event.request.headers.get('accept').includes('text/html')){
                      return cache.match('/offline.html');
                    }
                  });
              })
          }
        })
    );
  }
});

/*self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if(response) {
          return response;
        } else {
          return fetch(event.request)
            .then(res => {
              return caches.open(CACHE_DYNAMIC_NAME)
                .then(cache => {
                  cache.put(event.request.url, res.clone());
                  return res;
                })
            })
            .catch(err => {
              return caches.open(CACHE_STATIC_NAME)
                .then(cache => {
                  return cache.match('/offline.html');
                });
            })
        }
      })
  );
});*/

//Network with Cache Fallback strategy and dynamic caching
/*self.addEventListener('fetch', function (event) {
  event.respondWith(
    fetch(event.request)
      .then(res => {
        return caches.open(CACHE_DYNAMIC_NAME)
          .then(cache => {
            cache.put(event.request.url, res.clone());
            return res;
          })
      })
      .catch(err => {
        return caches.match(event.request)
      })
  );
});*/

//cache only strategy
/*self.addEventListener('fetch', function (event) {
  event.respondWith(caches.match(event.request));
});*/

//network only strategy
/*
self.addEventListener('fetch', function (event) {
  fetch(event.request);
});*/

const _CACHE_NAME = "meals@v1_cache";

self.addEventListener("install", (event) => {
  console.log("INSTALL");
  const _FILES = ["index.html", "style.css", "script.js"];

  const _APP_SHELL = caches
    .open(_CACHE_NAME)
    .then((cache) => cache.addAll(_FILES));

  event.waitUntil(_APP_SHELL);
});

self.addEventListener("activate", (event) => {
  console.log("ACTIVATE");
  event.waitUntil(updateCache());
});

function updateCache() {
  caches.keys().then((keys) =>
    Promise.all(
      keys.map((key) => {
        if (!_CACHE_NAME.includes(key)) {
          console.log("CACHE DELETED");
          return caches.delete(key);
        }
      })
    )
  );
}

self.addEventListener("fetch", (event) => {
  /*
    1. Cache Only
    console.log(event.request);
    event.respondWith(caches.match(event.request));
    ________________________________________________
    */
  /*
   EJERCICIO: Limpiar el cache antiguo
   ________________________________________________
   */
  /* 2. Network Only
   event.respondWith(fetch(event.request)) 
   ________________________________________________*/
  /* 3. Cache First
    const _RESULT = caches.match(event.request).then((cacheResponse) => {
        if (cacheResponse) return cacheResponse;
        
        return fetch(event.request).then((newData) => {
            caches.open(_CACHE_NAME).then((cache) => {
                if(!event.request.url.startsWith('chrome')){
                    if ( event.request.url.indexOf( '/images/media/meals/' ) !== -1 ) {
                        return false;
                    }
                  cache.put(event.request, newData);
                  updateCache();
                }
            });
            return newData.clone();
        });
    });
    event.respondWith(_RESULT) 
    ________________________________________________
    */
  /* 3.1 Cache First
  const _RESULT = caches.match(event.request).then((cacheResponse) => {
    return (
      cacheResponse ||
      fetch(event.request).then((newData) => {
        return caches.open(_CACHE_NAME).then((cache) => {
          cache.put(event.request, newData.clone());
          return newData;
        });
      })
    );
  });

  event.respondWith(_RESULT); 
  ________________________________________________
  */

//   4. Network first
  const _RESULT = fetch(event.request)
    .then((networkResponse) => {
      if (!networkResponse) return caches.match(event.request);
      caches.open(_CACHE_NAME).then((cache) => {
        if (!event.request.url.startsWith("chrome")) {
            if ( event.request.url.indexOf( '/images/media/meals/' ) !== -1 ) {
                return false;
            }
          cache.put(event.request, networkResponse);
          updateCache();
        }
      });
      return networkResponse.clone();
    })
    .catch(() => caches.match(event.request));

  event.respondWith(_RESULT);

  
});

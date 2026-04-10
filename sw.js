const CACHE_NAME = "gruzia-trip-v1";

function asset(path) {
  return new URL(path, self.location).href;
}

const PRECACHE = [
  "index.html",
  "razgovornik.html",
  "converter.html",
  "pogoda.html",
  "css/common.css",
  "places-info.js",
  "places-images.js",
  "place-routes.js",
  "phrasebook.js",
  "register-sw.js",
  "places/kutaisi-airport.jpg",
  "places/airport-terminal.jpg",
  "places/road-cafe-georgia.jpg",
  "places/restaurant-interior.jpg",
  "places/tbilisi-houses.jpg",
  "places/tbilisi-panorama.jpg",
  "places/peace-bridge.jpg",
  "places/kartlis-deda.jpg",
  "places/old-tbilisi.jpg",
  "places/breakfast-table.jpg",
  "places/chronicle-georgia.jpg",
  "places/jvari.jpg",
  "places/mtskheta-svetitskhoveli.jpg",
  "places/mountain-pass-road.jpg",
  "places/caucasus-landscape.jpg",
  "places/borjomi-park.jpg",
  "places/borjomi-town.jpg",
  "places/highway-night-lights.jpg",
  "places/batumi-boulevard.jpg",
  "places/batumi-aerial.jpg",
  "places/hotel-resort-pool.jpg",
  "places/waterfall-nature.jpg",
  "places/valley-landscape.jpg",
  "places/cafe-dining.jpg",
  "places/metal-sculpture.jpg",
  "places/batumi-dusk.jpg",
  "places/seaside-ferris.jpg",
  "places/architecture-plaza.jpg",
  "places/coastal-city-view.jpg",
  "places/clothing-bazaar.jpg",
  "places/mall-interior.jpg",
  "places/turkish-spread.jpg",
  "places/botanical-garden.jpg",
  "places/grilled-fish.jpg",
  "places/vegetable-stall.jpg",
  "places/city-tower-modern.jpg",
  "places/borscht-bowl.jpg",
  "places/river-pedestrian-bridge.jpg",
  "places/bar-lights.jpg",
  "places/prometheus-cave.jpg",
  "places/canyon-river.jpg",
  "places/dumplings-plate.jpg",
].map(asset);

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(function (cache) {
        return Promise.all(
          PRECACHE.map(function (url) {
            return cache.add(url).catch(function () {
              return null;
            });
          })
        );
      })
      .then(function () {
        return self.skipWaiting();
      })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches
      .keys()
      .then(function (keys) {
        return Promise.all(
          keys
            .filter(function (k) {
              return k !== CACHE_NAME;
            })
            .map(function (k) {
              return caches.delete(k);
            })
        );
      })
      .then(function () {
        return self.clients.claim();
      })
  );
});

self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then(function (response) {
        if (response && response.status === 200) {
          const ct = response.headers.get("content-type") || "";
          if (
            ct.includes("text/html") ||
            ct.includes("javascript") ||
            ct.includes("text/css") ||
            ct.includes("image/")
          ) {
            try {
              const copy = response.clone();
              caches.open(CACHE_NAME).then(function (cache) {
                cache.put(event.request, copy);
              });
            } catch (e) {
              /* ignore */
            }
          }
        }
        return response;
      })
      .catch(function () {
        return caches.match(event.request).then(function (hit) {
          if (hit) return hit;
          if (event.request.mode === "navigate") {
            return caches.match(asset("index.html"));
          }
          return Promise.reject(new Error("offline"));
        });
      })
  );
});

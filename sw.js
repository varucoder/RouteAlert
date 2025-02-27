self.addEventListener("install", (event) => {
  event.waituntil(
    caches.open("pwa-cache").then((cache) => {
      return caches.addAll(["/", "/index.html"]);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.responseWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

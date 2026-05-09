const CACHE_NAME = "guiwei-v1";

// 安装阶段
self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

// 激活阶段
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  event.waitUntil(self.clients.claim());
});

// 拦截请求
self.addEventListener("fetch", (event) => {
  // 只缓存静态资源，不缓存页面（保证获取最新版本）
  const url = new URL(event.request.url);

  // 跳过本地存储请求、API 请求等
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/_next/") ||
    event.request.method !== "GET"
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((response) => {
          // 只缓存成功的响应
          if (!response || response.status !== 200) {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // 离线时返回缓存的页面
          return caches.match("/");
        });
    })
  );
});

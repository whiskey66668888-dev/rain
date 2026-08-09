/**
 * Service Worker - 缓存静态资源，支持离线访问
 */

// 构建时替换版本号
const CACHE_VERSION = '__VERSION__';
const CACHE_NAME = `static-cache-v${CACHE_VERSION}`;
const STATIC_CACHE_NAME = `static-resources-v${CACHE_VERSION}`;

// 需要预缓存的静态资源（构建时注入，会被替换）
const PRECACHE_ASSETS = [];

function isCacheableResponse(response) {
  return response && (response.status === 200 || response.status === 0);
}

// 网络空闲检测：3 秒内没有新请求才进行预缓存
let lastRequestTime = Date.now();
let idleTimer = null;
let isPrecaching = false;
let hasPrecached = false;

function isStaticResourceRequest(request, url) {
  return (
    request.destination === 'image' ||
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font' ||
    request.destination === 'manifest' ||
    /\.(jpg|jpeg|png|gif|webp|svg|ico|bmp|avif|tiff|tif|json|woff|woff2|ttf|eot|otf|css|js)(\?.*)?$/i.test(
      url.pathname,
    )
  );
}

async function runPrecache() {
  if (PRECACHE_ASSETS.length === 0 || hasPrecached || isPrecaching) return;
  isPrecaching = true;
  const cache = await caches.open(CACHE_NAME);
  try {
    await Promise.all(
      PRECACHE_ASSETS.map(async (asset) => {
        try {
          const response = await fetch(asset, { cache: 'no-store' });
          if (isCacheableResponse(response)) {
            await cache.put(asset, response.clone());
          }
        } catch (error) {
          console.warn('[SW] Precaching asset failed:', asset, error);
        }
      }),
    );
    hasPrecached = true;
  } finally {
    isPrecaching = false;
  }
}

function precacheOnIdle() {
  if (hasPrecached || isPrecaching) return;
  if (idleTimer) return;

  const checkIdle = () => {
    const idleFor = Date.now() - lastRequestTime;
    if (idleFor >= 3000) {
      idleTimer = null;
      void runPrecache();
      return;
    }
    idleTimer = setTimeout(checkIdle, 1000);
  };

  idleTimer = setTimeout(checkIdle, 1000);
}

// 安装 Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  // 立即激活新的 Service Worker；预缓存网络空闲时执行
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// 激活 Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        // 删除旧版本的缓存
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME && name !== STATIC_CACHE_NAME)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            }),
        );
      })
      .then(() => {
        // 立即控制所有客户端
        return self.clients.claim();
      })
      .then(() => {
        // 激活后开始空闲检测预缓存
        precacheOnIdle();
      }),
  );
});

// 拦截网络请求
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;
  lastRequestTime = Date.now();
  precacheOnIdle();

  // 排除 API 请求
  if (url.pathname.startsWith('/api')) {
    return;
  }

  // // HTML 页面：网络优先
  // if (request.mode === 'navigate' || url.pathname.endsWith('.html')) {
  //   event.respondWith(
  //     fetch(request)
  //       .then((response) => {
  //         // 网络请求成功，缓存响应
  //         if (isCacheableResponse(response)) {
  //           const responseClone = response.clone();
  //           caches.open(CACHE_NAME).then((cache) => {
  //             cache.put(request, responseClone);
  //           });
  //         }
  //         return response;
  //       })
  //       .catch(() => {
  //         // 网络失败，尝试从缓存获取
  //         return caches.match(request).then((cachedResponse) => {
  //           if (cachedResponse) {
  //             return cachedResponse;
  //           }
  //           return Response.error();
  //         });
  //       }),
  //   );
  // document 类型页面：仅走网络，不进入缓存
  if (
    request.destination === 'document' ||
    request.mode === 'navigate' ||
    url.pathname.endsWith('.html')
  ) {
    event.respondWith(fetch(request).catch(() => Response.error()));
    return;
  }

  // 静态资源：
  // - 统一缓存优先
  // - 版本更新时通过 CACHE_VERSION 切换新缓存并删除旧缓存
  const isStaticResource = isStaticResourceRequest(request, url);

  if (isStaticResource) {
    event.respondWith(
      caches
        .open(STATIC_CACHE_NAME)
        .then(async (cache) => {
          const cachedResponse = await cache.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }

          try {
            const networkResponse = await fetch(request);
            if (isCacheableResponse(networkResponse)) {
              await cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          } catch {
            return Response.error();
          }
        })
        .catch(() => {
          return fetch(request).catch(() => Response.error());
        }),
    );
    return;
  }

  // 其他同源 GET：网络优先，失败回退缓存
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (isCacheableResponse(response)) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() =>
        caches.match(request).then((cachedResponse) => cachedResponse || Response.error()),
      ),
  );
});

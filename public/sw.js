/**
 * Service Worker - 分桶缓存 + 分级分批预缓存
 *
 * Cache buckets:
 * - scripts / stylesheets / images / fonts / manifest: cache-first + 数量上限
 * - html: network-first + 小上限
 *
 * Precache tiers:
 * 1. install: 仅 app shell
 * 2. HOME_READY: 高概率资源（分批）
 * 3. 空闲: 其余资源分批（每批 4-6），弱网/省流跳过
 */

const CACHE_VERSION = '__VERSION__';

/** @type {{ shell: string[], high: string[], idle: string[] }} */
const PRECACHE_PLAN = { shell: [], high: [], idle: [] };

const BUCKETS = {
  scripts: { name: `sw-scripts-v${CACHE_VERSION}`, maxEntries: 400 },
  stylesheets: { name: `sw-styles-v${CACHE_VERSION}`, maxEntries: 150 },
  images: { name: `sw-images-v${CACHE_VERSION}`, maxEntries: 200 },
  fonts: { name: `sw-fonts-v${CACHE_VERSION}`, maxEntries: 40 },
  html: { name: `sw-html-v${CACHE_VERSION}`, maxEntries: 8 },
  manifest: { name: `sw-manifest-v${CACHE_VERSION}`, maxEntries: 5 },
};

const ALL_BUCKET_NAMES = Object.values(BUCKETS).map((b) => b.name);
const PRECACHE_BATCH_SIZE = 5;
const IDLE_GAP_MS = 3000;
const BATCH_PAUSE_MS = 400;

let lastRequestTime = Date.now();
let idleTimer = null;
let isPrecaching = false;
let shellDone = false;
let highDone = false;
let idleDone = false;
/** @type {{ saveData: boolean, effectiveType: string }} */
let networkHint = { saveData: false, effectiveType: '4g' };
/** @type {string[]} 用户访问过的路由资源，空闲预缓存时优先 */
let visitedPriorityQueue = [];

function isCacheableResponse(response) {
  return Boolean(response && (response.status === 200 || response.type === 'opaque'));
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getBucketKey(request, url) {
  if (
    request.destination === 'document' ||
    request.mode === 'navigate' ||
    url.pathname.endsWith('.html')
  ) {
    return 'html';
  }
  if (request.destination === 'manifest' || /manifest\.json$/i.test(url.pathname)) {
    return 'manifest';
  }
  if (request.destination === 'style' || /\.css(\?.*)?$/i.test(url.pathname)) {
    return 'stylesheets';
  }
  if (request.destination === 'script' || /\.js(\?.*)?$/i.test(url.pathname)) {
    return 'scripts';
  }
  if (request.destination === 'font' || /\.(woff2?|ttf|eot|otf)(\?.*)?$/i.test(url.pathname)) {
    return 'fonts';
  }
  if (
    request.destination === 'image' ||
    /\.(avif|webp|png|jpe?g|gif|svg|ico|bmp)(\?.*)?$/i.test(url.pathname)
  ) {
    return 'images';
  }
  return null;
}

function getBucketByUrl(assetUrl) {
  try {
    const url = new URL(assetUrl, self.location.origin);
    return getBucketKey({ destination: '', mode: 'same-origin' }, url);
  } catch {
    return null;
  }
}

async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= maxEntries) return;
  const overflow = keys.length - maxEntries;
  await Promise.all(keys.slice(0, overflow).map((key) => cache.delete(key)));
}

async function putInBucket(bucketKey, request, response) {
  const bucket = BUCKETS[bucketKey];
  if (!bucket || !isCacheableResponse(response)) return;
  const cache = await caches.open(bucket.name);
  await cache.put(request, response.clone());
  await trimCache(bucket.name, bucket.maxEntries);
}

async function matchInBucket(bucketKey, request) {
  const bucket = BUCKETS[bucketKey];
  if (!bucket) return undefined;
  const cache = await caches.open(bucket.name);
  return cache.match(request);
}

function shouldSkipIdlePrecache() {
  if (networkHint.saveData) return true;
  const t = (networkHint.effectiveType || '').toLowerCase();
  return t === 'slow-2g' || t === '2g' || t === '3g';
}

async function cacheAssetUrl(assetUrl) {
  const bucketKey = getBucketByUrl(assetUrl);
  if (!bucketKey || bucketKey === 'html') return;
  const bucket = BUCKETS[bucketKey];
  const cache = await caches.open(bucket.name);
  const existing = await cache.match(assetUrl);
  if (existing) return;

  try {
    const response = await fetch(assetUrl, { cache: 'no-store', credentials: 'same-origin' });
    if (isCacheableResponse(response)) {
      await cache.put(assetUrl, response.clone());
      await trimCache(bucket.name, bucket.maxEntries);
    }
  } catch (error) {
    console.warn('[SW] Precache failed:', assetUrl, error);
  }
}

async function precacheInBatches(urls) {
  if (!urls.length) return;
  for (let i = 0; i < urls.length; i += PRECACHE_BATCH_SIZE) {
    if (shouldSkipIdlePrecache() && i > 0) break;
    // 用户又开始请求时暂停，避免抢带宽
    if (Date.now() - lastRequestTime < IDLE_GAP_MS / 2 && i > 0) {
      await delay(IDLE_GAP_MS);
    }
    const batch = urls.slice(i, i + PRECACHE_BATCH_SIZE);
    await Promise.all(batch.map((url) => cacheAssetUrl(url)));
    if (i + PRECACHE_BATCH_SIZE < urls.length) {
      await delay(BATCH_PAUSE_MS);
    }
  }
}

async function runShellPrecache() {
  if (shellDone || isPrecaching) return;
  isPrecaching = true;
  try {
    await precacheInBatches(PRECACHE_PLAN.shell || []);
    shellDone = true;
  } finally {
    isPrecaching = false;
  }
}

async function runHighPriorityPrecache() {
  if (highDone || isPrecaching) return;
  if (shouldSkipIdlePrecache()) return;
  isPrecaching = true;
  try {
    await precacheInBatches(PRECACHE_PLAN.high || []);
    highDone = true;
  } finally {
    isPrecaching = false;
  }
}

async function runIdlePrecache() {
  if (idleDone || isPrecaching) return;
  if (shouldSkipIdlePrecache()) return;
  isPrecaching = true;
  try {
    const priority = visitedPriorityQueue.splice(0, visitedPriorityQueue.length);
    const idle = PRECACHE_PLAN.idle || [];
    const merged = [...new Set([...priority, ...idle])];
    await precacheInBatches(merged);
    idleDone = true;
  } finally {
    isPrecaching = false;
  }
}

function scheduleIdlePrecache() {
  if (idleDone || isPrecaching || shouldSkipIdlePrecache()) return;
  if (idleTimer) return;

  const checkIdle = () => {
    const idleFor = Date.now() - lastRequestTime;
    if (idleFor >= IDLE_GAP_MS) {
      idleTimer = null;
      void runIdlePrecache();
      return;
    }
    idleTimer = setTimeout(checkIdle, 1000);
  };

  idleTimer = setTimeout(checkIdle, 1000);
}

async function cacheFirst(request, bucketKey) {
  const cached = await matchInBucket(bucketKey, request);
  if (cached) return cached;

  const networkResponse = await fetch(request);
  if (isCacheableResponse(networkResponse)) {
    await putInBucket(bucketKey, request, networkResponse);
  }
  return networkResponse;
}

async function networkFirst(request, bucketKey) {
  try {
    const networkResponse = await fetch(request);
    if (isCacheableResponse(networkResponse)) {
      await putInBucket(bucketKey, request, networkResponse);
    }
    return networkResponse;
  } catch {
    const cached = await matchInBucket(bucketKey, request);
    return cached || Response.error();
  }
}

/** manifest：cache-first + 后台短周期刷新 */
async function cacheFirstRevalidate(request, bucketKey) {
  const cached = await matchInBucket(bucketKey, request);
  const refresh = fetch(request)
    .then(async (networkResponse) => {
      if (isCacheableResponse(networkResponse)) {
        await putInBucket(bucketKey, request, networkResponse);
      }
      return networkResponse;
    })
    .catch(() => undefined);

  if (cached) {
    void refresh;
    return cached;
  }
  const networkResponse = await refresh;
  return networkResponse || Response.error();
}

self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(self.skipWaiting());
  void runShellPrecache();
});

self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }
  if (data.type === 'NETWORK_HINT') {
    networkHint = {
      saveData: Boolean(data.saveData),
      effectiveType: String(data.effectiveType || '4g'),
    };
    return;
  }
  if (data.type === 'HOME_READY') {
    void (async () => {
      await runHighPriorityPrecache();
      scheduleIdlePrecache();
    })();
    return;
  }
  if (data.type === 'ROUTE_ASSETS' && Array.isArray(data.urls)) {
    const next = data.urls.filter((u) => typeof u === 'string' && u.startsWith('/'));
    visitedPriorityQueue = [...new Set([...next, ...visitedPriorityQueue])];
    scheduleIdlePrecache();
  }
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => !ALL_BUCKET_NAMES.includes(name))
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            }),
        ),
      )
      .then(() => self.clients.claim())
      .then(() => {
        scheduleIdlePrecache();
      }),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;
  if (
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/v2') ||
    url.pathname.startsWith('/v3')
  ) {
    return;
  }

  lastRequestTime = Date.now();
  scheduleIdlePrecache();

  const bucketKey = getBucketKey(request, url);
  if (!bucketKey) {
    // 未分桶资源：不主动缓存，直连网络
    return;
  }

  if (bucketKey === 'html') {
    event.respondWith(networkFirst(request, bucketKey));
    return;
  }

  if (bucketKey === 'manifest') {
    event.respondWith(cacheFirstRevalidate(request, bucketKey));
    return;
  }

  event.respondWith(cacheFirst(request, bucketKey).catch(() => Response.error()));
});

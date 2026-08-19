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

const CACHE_VERSION = '1787062572430';

/** @type {{ shell: string[], high: string[], idle: string[] }} */
const PRECACHE_PLAN = {"shell":["/resource/main-CT5wa23j.js","/resource/main-BIRJWqpg.css"],"high":["/resource/vendor-react-BooNg6yh.js","/resource/sdk-DGDCQnky.js","/resource/sdk-BHHi02eQ.css","/resource/vendor-utils-DWkDgPC3.js","/resource/vendor-ui-D5Jqnnao.js","/resource/vendor-ui-Dgn1Wh5U.css"],"idle":["/resource/vendor-fingerprint-DNTug10-.js","/resource/worker-legacy-CK4cquZN.js","/resource/worker-UXqevJhr.js","/resource/vendor-html2canvas-C_06CvbK.js","/resource/BetPC-4nCwgjRw.css","/resource/BonusReportPage-CPTfumAs.css","/resource/BonusReportPage-DtDs3eJn.js","/resource/vendor-motion-DVzRkteW.js","/resource/bg_top-1yRsyMwy.webp","/resource/bg_top-Byg73lj4.webp","/resource/card-DfFcyBM7.png","/resource/card-DaqH3q4p.png","/resource/home-header-DSqch3nr.webp","/resource/cluo2-KUWcCD-_.webp","/resource/entertainment_bg-BZkywY83.png","/resource/sport_bg-DVFZGT9G.png","/resource/vendor-lottie-CXXvERQM.js","/resource/index-DaNWs7IN.js","/resource/index-DcSmnu1q.css","/resource/bg-DHeFouuc.webp","/resource/bg_dark-C1Y9yE1r.webp","/resource/circle_bg-SA7mAb6Q.webp","/resource/circle_bg_dark-F-G_9kKF.webp","/resource/modal_bg-fO7GqZiU.png","/resource/modal_bg-D1Ej-aiV.png","/resource/HistoryReportPage-cgLHoeYR.js","/resource/HistoryReportPage-DHEZA836.css","/resource/wode-GPNJvnLX.js","/resource/wode-By_5t9MG.css","/resource/InviteSubPage-BveIypaT.css","/resource/InviteSubPage-W67_BPHC.js","/resource/register-f03mYbAg.png","/resource/register-DBCO8qTy.png","/resource/RebateReportPage-8kL-HM3E.js","/resource/RebateReportPage-BOM0sghp.css","/resource/tiyu-CCuYXYxI.js","/resource/tiyu-DZT1mDuX.css","/resource/chatFollowContext-15hy784G.js","/resource/vendor-openim-Bsln6d1-.js","/resource/index-BuuoV-ra.js","/resource/index-D4GAk9pe.css","/resource/index-DPEnp10V.js","/resource/index-Ooy76vBj.css","/resource/topBg-oDdcacVP.webp","/resource/index-DbytaDad.js","/resource/index-G1xX2TNO.css","/resource/index-DzVbf-38.js","/resource/obBetHistoryFormat-DTOo8kye.js","/resource/zhudan-BhXY1tSE.js","/resource/index-DzlWOOdh.css","/resource/index-UG6-rdO-.js","/resource/index-Zyo03JyL.css","/resource/index-yfP85EVd.js","/resource/shareMatchToChatRoom-BVDjfnl-.js","/resource/shareMatchToChatRoom-CLA4__GW.css","/resource/ic_shot_dark.png-Dnmfuxb1.webp","/resource/ic_shot_light.png-CxRyAGrw.webp","/resource/football_bg-BNpGFqcH.webp","/resource/bg-tI_Bknts.png","/resource/vendor-echarts-CliOk7_o.js","/resource/index-R2lBDkZ-.js","/resource/index-BrhGXYEN.css","/resource/ic_emoji-56586a-BCVUGHay.png","/resource/vendor-emoji-BHKX2zKW.js","/resource/index-_206_Vln.js","/resource/index-CJ5fZdUK.css","/resource/GlobalCustomerServiceHost-BGiJHrQG.js","/resource/GlobalCustomerServiceHost-42HLziVp.css","/resource/NotificationWsHost-Bw5FTgBN.js","/resource/kf-CBVj0WJi.png","/resource/adetuo-DneKxsHS.webp","/resource/aidehuazi-B-GpvU6X.webp","/resource/dongqiqi-N7ybw0WO.webp","/resource/duante-CEEKInkT.webp","/resource/kebi-DN4Ceajo.webp","/resource/kelake-Cd4zzO5C.webp","/resource/kuli-CywVHe5c.webp","/resource/liyueru-IK6S8lPG.webp","/resource/yalishanda-DrnBV09A.webp","/resource/yanghansen-DRxyDctI.webp","/resource/yaoming-SYmrnnYb.webp","/resource/zhanmusi-CHhQNvmc.webp","/resource/aitana-D3fng54r.webp","/resource/beilinemu-DfghN0Ty.webp","/resource/cluo1-DtxOPI6h.webp","/resource/dengbeilai-B1F65q75.webp","/resource/halande-CZpQmnPJ.webp","/resource/meixi-DRTlfsld.webp","/resource/mubapei-CVlqHcJR.webp","/resource/muxiyala-CtHM-JwO.webp","/resource/weinixiusi-CuoIgSWZ.webp","/resource/yamaer-CNr6V4sG.webp","/resource/aerkalasi-CwMd-tpC.webp","/resource/alina-D3268l7H.webp","/resource/alongsuo-betI0mnW.webp","/resource/andelieyewa-DHsQHBqu.webp","/resource/biergaizi-BbF8kpnR.webp","/resource/chuanpu-D8-5zejH.webp","/resource/daguxiangping-BZH9CJXM.webp","/resource/guailing-DgWA2UNI.webp","/resource/liming-inWe-pgf.webp","/resource/lindan-CzYijc7F.webp","/resource/liudehua-CgxmSFZW.webp","/resource/luoyonghao-Bccbwv4y.webp","/resource/mahuateng-R1iH2iin.webp","/resource/masike-qpW_QPTk.webp","/resource/mayun-gjNWILGf.webp","/resource/muliniao-CptdIwkD.webp","/resource/sunyang-DTz2HunL.webp","/resource/sunyingsha-2WJ5EX6L.webp","/resource/sunyuchen-Dtc-LRUu.webp","/resource/wangchuqin-Bc7wlCPw.webp","/resource/wuyanni--TH1cgEr.webp","/resource/xinna-CmFm_OLV.webp","/resource/zhangchangning-C5w_5Cp9.webp","/resource/zhangjiahui-CDC-Nhag.webp","/resource/zhangyufei-D09WF4W3.webp","/resource/zhaochangpeng-aSakMUOo.webp","/resource/zhengqinwen-DAa8l4tE.webp","/resource/zhourunfa-BeCg-qG6.webp","/resource/zhouxingchi-B-KKvIml.webp","/resource/mine_balance_bg-ZTeio3jS.png","/resource/img_qa-DXfZ4UnK.png","/resource/wenjuan-CnDzCwEq.png","/resource/gesture_bg-zd1LBjUX.png","/resource/banner-CxC7ggox.webp","/resource/banner_h5-BxYCp-iF.webp","/resource/mine_top-BrXvJAmr.png","/resource/gesture_bg-xYUg0gRy.png","/resource/info-bg--BShrN2d.png","/resource/banner-CKPglyaj.webp","/resource/banner_h5-DshX_6S_.webp","/resource/mine_top-COnY7dGi.png","/resource/BetShareSheetHost-BLwfPnHG.js","/resource/index-DAj9nDTr.js","/resource/index-CReATxZT.css","/resource/index-BbJbx7fN.js","/resource/index-BM8mN5PJ.css","/resource/index-Cplsms7A.js","/resource/index-BdD7RJrI.css","/resource/index-B2FmLrLg.js","/resource/index-CGTBicy3.css","/resource/index-B4WZoXC1.js","/resource/index-FyNLEAEA.js","/resource/index-B1FIkuaW.css","/resource/index-BS42UFRT.js","/resource/index-D7uIDf5P.css","/resource/index-BcIf2_VV.js","/resource/index-heu-FA38.js","/resource/index-4YuO8sUi.css","/resource/index--u8IKtYX.js","/resource/index-MgA7pNVm.css","/resource/index-6U2Xz0HQ.js","/resource/index-B7376LWD.css","/resource/HomePage-DNYJ5uv3.js","/resource/HomePage-BSW-JTPm.css","/resource/index-KDaDAvp6.js","/resource/index-BNuDgwqa.css","/resource/index-D-q00Ojd.js","/resource/index-DmIWijfQ.css","/resource/DetailPage-CN0XBlGS.js","/resource/index-DfHz55WS.js","/resource/index-ClTQOjcD.css","/resource/index-CdyY2QG-.js","/resource/index-CGbGGNqc.css"]};

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

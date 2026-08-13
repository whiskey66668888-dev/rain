const SW_PATH = '/sw.js';

type NetworkInformationLike = {
  saveData?: boolean;
  effectiveType?: string;
  addEventListener?: (type: string, listener: () => void) => void;
};

function getConnection(): NetworkInformationLike | undefined {
  const nav = navigator as Navigator & { connection?: NetworkInformationLike };
  return nav.connection;
}

function postToServiceWorker(message: Record<string, unknown>): void {
  const controller = navigator.serviceWorker?.controller;
  if (!controller) return;
  controller.postMessage(message);
}

function postNetworkHint(): void {
  const connection = getConnection();
  postToServiceWorker({
    type: 'NETWORK_HINT',
    saveData: Boolean(connection?.saveData),
    effectiveType: connection?.effectiveType || '4g',
  });
}

/** 首页/首屏就绪后通知 SW：开始高优先级分批预缓存 */
export function notifySwHomeReady(): void {
  if (!('serviceWorker' in navigator) || __NODE_ENV__ === 'development') return;
  postNetworkHint();
  postToServiceWorker({ type: 'HOME_READY' });
}

/** 将当前页已加载的同源静态资源加入 SW 优先预缓存队列 */
export function notifySwRouteAssets(): void {
  if (!('serviceWorker' in navigator) || __NODE_ENV__ === 'development') return;

  const urls = performance
    .getEntriesByType('resource')
    .map((entry) => {
      try {
        const url = new URL(entry.name);
        if (url.origin !== window.location.origin) return null;
        if (!/\.(js|css|woff2?|png|jpe?g|webp|svg|avif)(\?|$)/i.test(url.pathname)) {
          return null;
        }
        return `${url.pathname}${url.search}`;
      } catch {
        return null;
      }
    })
    .filter((item): item is string => Boolean(item));

  if (urls.length === 0) return;
  postToServiceWorker({ type: 'ROUTE_ASSETS', urls });
}

/**
 * Service Worker 注册工具
 */
export function registerServiceWorker(): void {
  if (
    __NODE_ENV__ === 'development' ||
    typeof window === 'undefined' ||
    !('serviceWorker' in navigator)
  ) {
    return;
  }

  window.addEventListener('load', () => {
    let isControllerRefreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (isControllerRefreshing) return;
      isControllerRefreshing = true;
      // 新 SW 接管当前页面后，刷新一次以加载同版本资源，避免首刷白屏
      // window.location.reload();
    });

    navigator.serviceWorker
      .register(`${SW_PATH}?v=${__VERSION__}`)
      .then((registration) => {
        console.log(`✅ Service Worker 已注册: ${__VERSION__}`);

        const forceActivateWaitingWorker = () => {
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
        };

        forceActivateWaitingWorker();
        postNetworkHint();

        const connection = getConnection();
        connection?.addEventListener?.('change', () => {
          postNetworkHint();
        });

        // 路由切换后收集本页资源，优先空闲预缓存
        window.addEventListener('popstate', () => {
          window.setTimeout(() => notifySwRouteAssets(), 800);
        });
        const originalPushState = history.pushState.bind(history);
        history.pushState = (...args) => {
          originalPushState(...args);
          window.setTimeout(() => notifySwRouteAssets(), 800);
        };

        // 检查更新
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('🔄 发现新版本，Service Worker 已更新');
                console.log(`📦 新版本号: ${__VERSION__}`);
                forceActivateWaitingWorker();
              }
            });
          }
        });

        // 定期检查更新（每小时）
        setInterval(
          () => {
            registration.update();
          },
          60 * 60 * 1000,
        );
      })
      .catch((error) => {
        console.error('❌ Service Worker 注册失败:', error);
      });
  });
}

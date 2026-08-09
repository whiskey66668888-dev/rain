const SW_PATH = '/sw.js';

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

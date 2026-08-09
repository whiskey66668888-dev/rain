import {
  hideNotificationPermissionPrompt,
  showNotificationPermissionPrompt,
} from '@/common/components/NotificationPermissionPrompt';

const TEST_NOTIFICATION_TAG = 'op7-pwa-notification-test';

function isStandalonePwa(): boolean {
  if (typeof window === 'undefined') return false;
  const isDisplayModeStandalone =
    window.matchMedia?.('(display-mode: standalone)').matches ?? false;
  const isIosStandalone =
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  return isDisplayModeStandalone || isIosStandalone;
}

async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied';
  if (Notification.permission !== 'default') {
    return Notification.permission;
  }
  try {
    return await Notification.requestPermission();
  } catch {
    return 'denied';
  }
}

async function showTestNotification(): Promise<void> {
  const title = 'OP7 测试通知';
  const options: NotificationOptions = {
    body: '页面已完成加载，通知能力可用!',
    icon: '/images/common/favicon.png',
    badge: '/images/common/favicon.png',
    tag: TEST_NOTIFICATION_TAG,
  };

  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, options);
      return;
    } catch {
      // ignore and fallback
    }
  }

  new Notification(title, options);
}

/**
 * 仅用于测试：
 * 用户以桌面安装态打开应用时，申请通知权限；
 * 页面完全加载后若授权成功，发送一条测试通知。
 */
export function initPwaNotificationTest(): void {
  if (typeof window === 'undefined' || !isStandalonePwa()) return;
  if (!('Notification' in window)) return;

  const run = async (): Promise<void> => {
    if (Notification.permission === 'granted') {
      hideNotificationPermissionPrompt();
      await showTestNotification();
      return;
    }

    if (Notification.permission === 'default') {
      showNotificationPermissionPrompt({
        onEnable: () => {
          void (async () => {
            const permission = await requestNotificationPermission();
            if (permission === 'granted') {
              hideNotificationPermissionPrompt();
              await showTestNotification();
            }
          })();
        },
      });
    }
  };

  if (document.readyState === 'complete') {
    void run();
    return;
  }

  window.addEventListener(
    'load',
    () => {
      void run();
    },
    { once: true },
  );
}

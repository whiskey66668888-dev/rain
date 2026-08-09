const BOOT_SHIELD_ID = 'boot-shield';
const BOOT_SHIELD_STYLE_ID = 'boot-shield-style';
const APP_READY_CLASS = 'app-ready';
const LEAVING_CLASS = 'boot-shield--leaving';
const FADE_MS = 280;

/** 开屏 loading 至少展示时长 */
export const BOOT_SPLASH_MIN_MS = 1200;

let bootAppReady = false;
let bootMinTimeReached = false;
let bootDismissScheduled = false;

function getBootStartMs(): number {
  const w = window as Window & { __op7BootStart?: number };
  return typeof w.__op7BootStart === 'number' ? w.__op7BootStart : performance.now();
}

function tryDismissBootShieldWhenReady(): void {
  if (bootDismissScheduled || !bootAppReady || !bootMinTimeReached) return;

  const elapsed = performance.now() - getBootStartMs();
  const waitMs = Math.max(0, BOOT_SPLASH_MIN_MS - elapsed);

  bootDismissScheduled = true;
  window.setTimeout(() => {
    scheduleDismissBootShield();
  }, waitMs);
}

/** 开屏动画已满 1s（由 initBootSplashDismiss 触发） */
function markBootMinTimeReached(): void {
  bootMinTimeReached = true;
  tryDismissBootShieldWhenReady();
}

/** 注册 1s 最短展示计时（自 HTML 写入 __op7BootStart 起算） */
export function initBootSplashDismiss(): void {
  if (typeof window === 'undefined') return;

  const elapsed = performance.now() - getBootStartMs();
  const remain = Math.max(0, BOOT_SPLASH_MIN_MS - elapsed);
  window.setTimeout(markBootMinTimeReached, remain);
}

/** 主应用首屏 hydrate/render 完成 */
export function markBootAppReady(): void {
  bootAppReady = true;
  tryDismissBootShieldWhenReady();
}

function removeBootShieldNodes(): void {
  document.documentElement.classList.add(APP_READY_CLASS);
  document.getElementById(BOOT_SHIELD_ID)?.remove();
  document.getElementById(BOOT_SHIELD_STYLE_ID)?.remove();
}

export function dismissBootShield(): void {
  if (typeof document === 'undefined') return;

  const shield = document.getElementById(BOOT_SHIELD_ID);
  if (!shield) {
    removeBootShieldNodes();
    return;
  }

  if (shield.classList.contains(LEAVING_CLASS)) return;

  shield.classList.add(LEAVING_CLASS);
  shield.setAttribute('aria-hidden', 'true');

  const finish = (): void => {
    removeBootShieldNodes();
  };

  const timer = window.setTimeout(finish, FADE_MS + 40);

  shield.addEventListener(
    'transitionend',
    (event) => {
      if (event.target !== shield || event.propertyName !== 'opacity') return;
      window.clearTimeout(timer);
      finish();
    },
    { once: true },
  );
}

export function scheduleDismissBootShield(): void {
  if (typeof window === 'undefined') return;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      dismissBootShield();
    });
  });
}

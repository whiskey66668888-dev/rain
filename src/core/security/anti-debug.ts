// const WARNING_TEXT = '- -!!';
// const DEVTOOLS_SIZE_THRESHOLD = 160;

let protectionActive = false;

function shouldEnableAntiDebug(): boolean {
  return __NODE_ENV__ === 'production' && (__BUILD_ENV__ === 'main' || __BUILD_ENV__ === 'release');
}

/** 构建时会 drop 字面量 debugger，用动态执行绕过 */
function invokeDebugger(): void {
  (0, eval)('debugger');
}

// function showWarningOverlay(): void {
//   if (document.getElementById('__anti_debug_overlay__')) return;

//   const overlay = document.createElement('div');
//   overlay.id = '__anti_debug_overlay__';
//   overlay.setAttribute(
//     'style',
//     [
//       'position:fixed',
//       'inset:0',
//       'z-index:2147483647',
//       'display:flex',
//       'align-items:center',
//       'justify-content:center',
//       'background:rgba(0,0,0,0.94)',
//       'pointer-events:all',
//     ].join(';'),
//   );

//   const text = document.createElement('div');
//   text.textContent = WARNING_TEXT;
//   text.setAttribute(
//     'style',
//     [
//       'color:#ff1a1a',
//       'font-size:clamp(30px,9vw,80px)',
//       'font-weight:700',
//       'text-align:center',
//       'padding:32px',
//       'line-height:1.5',
//       'user-select:none',
//       'letter-spacing:0.05em',
//     ].join(';'),
//   );

//   overlay.appendChild(text);
//   document.body.appendChild(overlay);
// }

function startDebuggerLoop(): void {
  const loop = () => invokeDebugger();
  window.setInterval(loop, 50);
  loop();
}

// function isDevToolsOpenByTiming(): boolean {
//   const start = performance.now();
//   invokeDebugger();
//   return performance.now() - start > 1000;
// }

function triggerProtection(): void {
  if (protectionActive) return;
  protectionActive = true;
  // showWarningOverlay();
  startDebuggerLoop();
}

function isTouchPrimaryDevice(): boolean {
  return (
    navigator.maxTouchPoints > 0 &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(pointer: coarse)').matches
  );
}

function isMobileRuntime(): boolean {
  if (typeof navigator === 'undefined') return false;

  const userAgent = navigator.userAgent || '';
  const isMobileUserAgent = /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent);

  return isMobileUserAgent || isTouchPrimaryDevice();
}

function blockContextMenu(event: Event): void {
  // 移动端长按也会触发 contextmenu，需保留（聊天等业务依赖）
  if (isTouchPrimaryDevice()) return;

  const mouseEvent = event as MouseEvent;
  // 仅拦截桌面鼠标右键
  if (mouseEvent.button === 2) {
    event.preventDefault();
  }
}

function blockDevToolsShortcuts(event: KeyboardEvent): void {
  if (isMobileRuntime()) return;

  const key = event.key.toLowerCase();

  const isF12 = event.keyCode === 123 || key === 'f12';
  const isViewSource =
    (event.ctrlKey && key === 'u') || (event.metaKey && event.altKey && key === 'u');
  const isDevToolsHotkey =
    (event.ctrlKey && event.shiftKey && ['i', 'j', 'c', 'k'].includes(key)) ||
    (event.metaKey && event.altKey && ['i', 'j', 'c', 'k'].includes(key));

  if (!isF12 && !isViewSource && !isDevToolsHotkey) return;

  event.preventDefault();
  event.stopPropagation();

  if (isF12 || isDevToolsHotkey) {
    triggerProtection();
  }
}

// function startDevToolsDetection(): void {
//   window.setInterval(() => {
//     if (isDevToolsOpenByTiming()) {
//       triggerProtection();
//     }
//   }, 2000);
// }

/**
 * 生产环境防调试：禁用右键与开发者工具快捷键，检测到强行打开时全屏警示并循环断点
 */
export function initAntiDebug(): void {
  if (typeof window === 'undefined' || !shouldEnableAntiDebug() || isMobileRuntime()) return;

  document.addEventListener('contextmenu', blockContextMenu);
  document.addEventListener('keydown', blockDevToolsShortcuts, true);
  // startDevToolsDetection();
}

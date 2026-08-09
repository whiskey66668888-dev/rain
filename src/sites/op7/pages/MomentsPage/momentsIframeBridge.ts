let iframeWindow: Window | null = null;
let targetOrigin = '*';

/** 赛事分享待唤起发布器的登记状态（等 iframe 内页 momentMounted 后才发得出去） */
let openPublishPending = false;
let openPublishTimer = 0;

/** 朋友圈 iframe 是否已挂载，供全局 postMessage 监听判断消息归属 */
export function hasMomentsIframe(): boolean {
  return !!iframeWindow;
}

/** 注册 / 注销朋友圈 iframe，供父页面 postMessage 使用 */
export function setMomentsIframeTarget(window: Window | null, origin = '*'): void {
  iframeWindow = window;
  targetOrigin = origin;
}

/** 双击 Tab 时通知 iframe 回到顶部 */
export function postMomentsGoTopMessage(): void {
  if (!iframeWindow) return;

  iframeWindow.postMessage(JSON.stringify({ eventName: 'goTop' }), targetOrigin);
}

function stopOpenPublishFallback(): void {
  openPublishPending = false;
  if (openPublishTimer) {
    window.clearInterval(openPublishTimer);
    openPublishTimer = 0;
  }
}

function postOpenPublish(): void {
  if (!iframeWindow) return;
  iframeWindow.postMessage(JSON.stringify({ eventName: 'openPublish' }), targetOrigin);
}

/**
 * 赛事分享「朋友圈」进入时登记：等 momentMounted 到达再唤起发布器。
 * 轮询仅作兜底，防止 H5 未发 momentMounted。
 */
export function requestMomentsOpenPublish(): void {
  if (openPublishPending) return;
  openPublishPending = true;

  let attempts = 0;
  openPublishTimer = window.setInterval(() => {
    attempts += 1;
    if (!openPublishPending || attempts >= 20) {
      stopOpenPublishFallback();
      return;
    }
    postOpenPublish();
  }, 500);
}

/**
 * 离开朋友圈页时取消未消费的登记。
 * 否则残留的兜底定时器会在下一次「正常进入」时把 openPublish 发出去，
 * 且 pending 卡住会吞掉下一次真实的 requestMomentsOpenPublish。
 */
export function cancelMomentsOpenPublish(): void {
  stopOpenPublishFallback();
}

/** 收到 iframe 内页的 momentMounted：此时发消息才不会丢 */
export function notifyMomentsMounted(): void {
  if (!openPublishPending) return;
  stopOpenPublishFallback();
  postOpenPublish();
}

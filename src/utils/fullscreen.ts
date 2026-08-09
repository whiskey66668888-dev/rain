type DocumentWithWebkitFullscreen = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
};

type ElementWithWebkitFullscreen = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};

const afterNextPaint = (cb: () => void) => {
  if (typeof window === 'undefined') {
    cb();
    return;
  }
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(cb);
  });
};

export const isNativeFullscreenActive = (): boolean => {
  if (typeof document === 'undefined') return false;
  const doc = document as DocumentWithWebkitFullscreen;
  return Boolean(document.fullscreenElement || doc.webkitFullscreenElement);
};

export const toggleFullscreenForElement = (element?: HTMLElement | null): boolean => {
  if (typeof document === 'undefined' || !element) return false;
  const doc = document as DocumentWithWebkitFullscreen;
  const el = element as ElementWithWebkitFullscreen;
  const hasNativeApi =
    typeof element.requestFullscreen === 'function' ||
    typeof el.webkitRequestFullscreen === 'function' ||
    typeof document.exitFullscreen === 'function' ||
    typeof doc.webkitExitFullscreen === 'function';
  if (!hasNativeApi) return false;

  if (isNativeFullscreenActive()) {
    if (typeof document.exitFullscreen === 'function') {
      void document.exitFullscreen();
      return true;
    }
    if (typeof doc.webkitExitFullscreen === 'function') {
      void doc.webkitExitFullscreen();
      return true;
    }
    return false;
  }

  if (typeof element.requestFullscreen === 'function') {
    void element.requestFullscreen();
    return true;
  }
  if (typeof el.webkitRequestFullscreen === 'function') {
    void el.webkitRequestFullscreen();
    return true;
  }
  return false;
};

export const runAfterLeaveFullscreen = ({
  requestExit,
  after,
  timeoutMs = 900,
}: {
  requestExit: () => void;
  after: () => void;
  timeoutMs?: number;
}) => {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    requestExit();
    after();
    return;
  }

  if (!isNativeFullscreenActive()) {
    requestExit();
    afterNextPaint(after);
    return;
  }

  let done = false;
  let fallbackTimer = 0;
  const finish = () => {
    if (done) return;
    done = true;
    document.removeEventListener('fullscreenchange', onFullscreenChange);
    document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
    window.clearTimeout(fallbackTimer);
    afterNextPaint(after);
  };

  const onFullscreenChange = () => {
    if (!isNativeFullscreenActive()) {
      finish();
    }
  };

  document.addEventListener('fullscreenchange', onFullscreenChange);
  document.addEventListener('webkitfullscreenchange', onFullscreenChange);
  fallbackTimer = window.setTimeout(finish, timeoutMs);
  requestExit();
};

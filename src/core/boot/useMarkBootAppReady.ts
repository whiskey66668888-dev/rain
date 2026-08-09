import { useEffect } from 'react';

import { markBootAppReady } from './dismissBootShield';

/** 首屏就绪后关闭 index.html 中的 #boot-shield */
export function useMarkBootAppReady(enabled = true): void {
  useEffect(() => {
    if (!enabled) return;

    const rafId = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        markBootAppReady();
      });
    });

    return () => window.cancelAnimationFrame(rafId);
  }, [enabled]);
}

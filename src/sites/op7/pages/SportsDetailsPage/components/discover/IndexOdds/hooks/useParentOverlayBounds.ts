import { useCallback, useEffect, useState, type CSSProperties, type RefObject } from 'react';

import { useAppSelector } from '@/core/store/hooks';

export type ParentOverlayBounds = {
  left: number;
  width: number;
};

/**
 * PC 端 Overlay 挂到 body 后默认铺满视口；测量父容器 rect，
 * 让底部弹层宽度/位置与父级（如右侧栏）对齐。
 */
export const useParentOverlayBounds = (
  containerRef: RefObject<HTMLElement | null>,
  enabled: boolean,
): ParentOverlayBounds | null => {
  const isMobile = useAppSelector((state) => state.config.isMobile);
  const [bounds, setBounds] = useState<ParentOverlayBounds | null>(null);

  const updateBounds = useCallback(() => {
    if (isMobile || !enabled) {
      setBounds(null);
      return;
    }
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setBounds({ left: rect.left, width: rect.width });
  }, [containerRef, enabled, isMobile]);

  useEffect(() => {
    if (isMobile || !enabled) {
      setBounds(null);
      return;
    }

    let rafId: number | null = null;
    const schedule = () => {
      if (rafId != null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateBounds);
    };

    schedule();
    window.addEventListener('resize', schedule);
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => schedule()) : null;
    if (ro && containerRef.current) ro.observe(containerRef.current);

    return () => {
      if (rafId != null) cancelAnimationFrame(rafId);
      window.removeEventListener('resize', schedule);
      ro?.disconnect();
    };
  }, [containerRef, enabled, isMobile, updateBounds]);

  return bounds;
};

export const toOverlayBodyStyle = (
  bounds: ParentOverlayBounds | null,
): CSSProperties | undefined => {
  if (!bounds) return undefined;
  return {
    left: bounds.left,
    width: bounds.width,
    right: 'auto',
    maxWidth: 'none',
  };
};

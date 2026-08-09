import { useEffect, useRef, useState, type CSSProperties, type MutableRefObject } from 'react';

const MIN_HEIGHT = 240;
const KEYBOARD_THRESHOLD = 100;
const HEIGHT_EPSILON = 2;
/** spacer 最小高度，保证 MatchInfo 有可滚空间 */
const MIN_SPACER = 120;

const isEditableElementFocused = () => {
  const activeElement = document.activeElement;
  return (
    activeElement instanceof HTMLInputElement ||
    activeElement instanceof HTMLTextAreaElement ||
    activeElement instanceof HTMLSelectElement ||
    (activeElement instanceof HTMLElement && activeElement.isContentEditable)
  );
};

const findPageScrollEl = (from: HTMLElement | null): HTMLElement | null => {
  const marked = from?.closest<HTMLElement>('[data-sport-detail-page]');
  if (marked) return marked;
  let current = from?.parentElement ?? null;
  while (current) {
    const style = getComputedStyle(current);
    if (/(auto|scroll|overlay)/.test(style.overflowY)) return current;
    current = current.parentElement;
  }
  return null;
};

/** 外层页面滚动；用于筛选栏手势 / 列表顶部下拉 */
export const scrollPageBy = (from: HTMLElement, deltaY: number): boolean => {
  const page = findPageScrollEl(from);
  if (!page || !deltaY) return false;
  const max = page.scrollHeight - page.clientHeight;
  if (max <= 0) return false;
  const next = Math.min(max, Math.max(0, page.scrollTop + deltaY));
  if (next === page.scrollTop) return false;
  page.scrollTop = next;
  return true;
};

export type ChatFixedLayout = {
  /** 文档流占位，让外层能滚走 MatchInfo */
  spacerHeight: number;
  /** fixed 聊天壳样式：始终贴视口底 */
  panelStyle: CSSProperties;
};

/**
 * 聊天区 fixed 贴底 + spacer 撑出外层滚动（对齐 Flutter NestedScroll 隔离）。
 * - 输入栏始终在视口内
 * - 外层滚动只负责收起 MatchInfo / 切换头部，不跟消息列表抢滚动
 * - Web 请传 enabled=false，避免 PC 滚走头部后留下大块空白
 */
export const useChatFixedLayout = <T extends HTMLElement = HTMLDivElement>(
  enabled = true,
): {
  anchorRef: MutableRefObject<T | null>;
  layout: ChatFixedLayout;
} => {
  const anchorRef = useRef<T | null>(null);
  const [layout, setLayout] = useState<ChatFixedLayout>({
    spacerHeight: MIN_SPACER,
    panelStyle: {},
  });

  useEffect(() => {
    if (!enabled) {
      setLayout({ spacerHeight: 0, panelStyle: {} });
      return;
    }

    const anchor = anchorRef.current;
    if (!anchor) return;

    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const vv = window.visualViewport;
        const keyboardOpen =
          isEditableElementFocused() ||
          (vv != null && window.innerHeight - vv.height > KEYBOARD_THRESHOLD);
        if (keyboardOpen) return;

        const viewportHeight = vv?.height ?? window.innerHeight;
        const viewportOffsetTop = vv?.offsetTop ?? 0;
        const rect = anchor.getBoundingClientRect();
        const top = Math.max(0, rect.top - viewportOffsetTop);
        const height = Math.max(
          MIN_HEIGHT,
          Math.min(Math.floor(viewportHeight - top), Math.floor(viewportHeight)),
        );

        // spacer ≈ 壳高 + 仍露出的 MatchInfo（滚动时此消彼长，保持可滚距离稳定）
        const matchInfo = document.querySelector<HTMLElement>('[data-match-info]');
        const matchRect = matchInfo?.getBoundingClientRect();
        const matchVisible = matchRect
          ? Math.max(0, Math.min(matchRect.height, matchRect.bottom - viewportOffsetTop))
          : 0;
        const spacerHeight = Math.max(MIN_SPACER, height + Math.round(matchVisible));

        const nextPanel: CSSProperties = {
          position: 'fixed',
          top: Math.round(top + viewportOffsetTop),
          left: Math.round(rect.left),
          width: Math.round(rect.width),
          height,
          zIndex: 6,
        };

        setLayout((prev) => {
          const sameSpacer = Math.abs(prev.spacerHeight - spacerHeight) < HEIGHT_EPSILON;
          const samePanel =
            prev.panelStyle.top === nextPanel.top &&
            prev.panelStyle.left === nextPanel.left &&
            prev.panelStyle.width === nextPanel.width &&
            Math.abs(Number(prev.panelStyle.height ?? 0) - height) < HEIGHT_EPSILON;
          if (sameSpacer && samePanel) return prev;
          return { spacerHeight, panelStyle: nextPanel };
        });
      });
    };

    update();

    const vv = window.visualViewport;
    const page = findPageScrollEl(anchor);
    page?.addEventListener('scroll', update, { passive: true });
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    vv?.addEventListener('resize', update);
    vv?.addEventListener('scroll', update);

    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    if (anchor.parentElement) ro?.observe(anchor.parentElement);
    const matchInfo = document.querySelector('[data-match-info]');
    if (matchInfo) ro?.observe(matchInfo);

    return () => {
      cancelAnimationFrame(raf);
      page?.removeEventListener('scroll', update);
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      vv?.removeEventListener('resize', update);
      vv?.removeEventListener('scroll', update);
      ro?.disconnect();
    };
  }, [enabled]);

  return { anchorRef, layout };
};

/** @deprecated 保留给其它测量场景；聊天壳请用 useChatFixedLayout */
export const useFillViewportHeight = <T extends HTMLElement = HTMLDivElement>() => {
  const ref = useRef<T | null>(null);
  const [height, setHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const vv = window.visualViewport;
        const keyboardOpen =
          isEditableElementFocused() ||
          (vv != null && window.innerHeight - vv.height > KEYBOARD_THRESHOLD);
        if (keyboardOpen) return;

        const viewportHeight = vv?.height ?? window.innerHeight;
        const viewportOffsetTop = vv?.offsetTop ?? 0;
        const topInVisualViewport = el.getBoundingClientRect().top - viewportOffsetTop;
        const availableHeight = viewportHeight - Math.max(0, topInVisualViewport);
        const next = Math.max(
          MIN_HEIGHT,
          Math.min(Math.floor(availableHeight), Math.floor(viewportHeight)),
        );

        setHeight((prev) => {
          if (prev === undefined) return next;
          if (Math.abs(prev - next) < HEIGHT_EPSILON) return prev;
          return next;
        });
      });
    };

    const handleWindowScroll = () => {
      if (isEditableElementFocused()) return;
      update();
    };

    update();
    const vv = window.visualViewport;
    window.addEventListener('scroll', handleWindowScroll, { passive: true });
    window.addEventListener('resize', update);
    vv?.addEventListener('resize', update);
    vv?.addEventListener('scroll', update);
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    if (el.parentElement) ro?.observe(el.parentElement);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', handleWindowScroll);
      window.removeEventListener('resize', update);
      vv?.removeEventListener('resize', update);
      vv?.removeEventListener('scroll', update);
      ro?.disconnect();
    };
  }, []);

  return { ref, height };
};

export const useElementHeight = <T extends HTMLElement = HTMLDivElement>() => {
  const ref = useRef<T | null>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const next = Math.floor(el.clientHeight);
      setHeight((prev) => (prev === next ? prev : next));
    };

    update();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    ro?.observe(el);
    window.addEventListener('resize', update);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  return { ref, height };
};

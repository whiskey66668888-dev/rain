import { useEffect, useRef } from 'react';

type ScrollContainer = HTMLElement | Window;

function isScrollable(el: HTMLElement): boolean {
  const style = getComputedStyle(el);
  const overflowRegex = /(auto|scroll|overlay)/;

  const scrollY = overflowRegex.test(style.overflowY) && el.scrollHeight > el.clientHeight;

  const scrollX = overflowRegex.test(style.overflowX) && el.scrollWidth > el.clientWidth;

  return scrollX || scrollY;
}

function getScrollContainer(el: HTMLElement | null): ScrollContainer {
  if (!el) return window;

  let current: HTMLElement | null = el;

  while (current) {
    if (isScrollable(current)) {
      return current;
    }

    current = current.parentElement;
  }

  return window;
}

function getScrollTop(container: ScrollContainer): number {
  if (container instanceof Window) {
    return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
  }

  return container.scrollTop;
}

export function useScrollTop(
  ref: React.RefObject<HTMLElement>,
  handler: (scrollTop: number) => void,
  /**
   * 骨架屏等场景下 ref 会晚于 hook 挂载；该值在「可滚动根节点已挂上 DOM」后变化时，应传入以重新绑定监听。
   */
  bindKey?: unknown,
) {
  const containerRef = useRef<ScrollContainer | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        try {
          if (!containerRef.current) return;
          handler(getScrollTop(containerRef.current));
        } finally {
          ticking = false;
        }
      });
    };

    const bindContainer = () => {
      const container = getScrollContainer(ref.current);

      if (containerRef.current === container) return;

      if (containerRef.current) {
        containerRef.current.removeEventListener('scroll', onScroll);
      }

      container.addEventListener('scroll', onScroll, { passive: true });
      containerRef.current = container;
    };

    bindContainer();

    window.addEventListener('resize', bindContainer);

    return () => {
      window.removeEventListener('resize', bindContainer);

      if (containerRef.current) {
        containerRef.current.removeEventListener('scroll', onScroll);
        containerRef.current = null;
      }
    };
  }, [ref, handler, bindKey]);
}

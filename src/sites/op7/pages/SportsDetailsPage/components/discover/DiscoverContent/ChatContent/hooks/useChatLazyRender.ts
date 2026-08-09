import { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';

export const useChatLazyRender = (initialHeight = 80, root: Element | null = null) => {
  const [holderHeight, setHolderHeight] = useState(initialHeight);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const { ref, inView } = useInView({
    threshold: 0,
    root,
    // 预渲染上下各一屏附近，减少贴底后懒加载撑高导致的「最后一条被裁切」
    rootMargin: '120px 0px',
  });

  useEffect(() => {
    if (inView && !hasBeenVisible) {
      setHasBeenVisible(true);
    }
  }, [inView, hasBeenVisible]);

  useEffect(() => {
    if (!contentRef.current) return;
    const measured = contentRef.current.offsetHeight;
    if (measured > 0 && measured !== holderHeight) {
      setHolderHeight(measured);
    }
  }, [holderHeight, hasBeenVisible, inView]);

  return {
    inView,
    hasBeenVisible,
    holderHeight,
    ref,
    contentRef,
  };
};

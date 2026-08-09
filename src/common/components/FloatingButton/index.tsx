import { createPortal } from 'react-dom';
import { useEffect, useState, type RefObject } from 'react';
import { zIndexMap } from '@/utils/constants/zIndex';
import clsx from 'clsx';
import Icon from '@/common/components/Icon';
import { useAppSelector } from '@/core/store/hooks';
const DEFAULT_SHOW_AFTER_VIEWPORT_RATIO = 1.5;

const FloatingButton = ({
  scrollContainerRef,
  /** 变化时重新根据 scrollTop 同步显隐（如路由切换后父级已 scrollTo 顶部） */
  scrollSyncKey,
  showAfterViewportRatio = DEFAULT_SHOW_AFTER_VIEWPORT_RATIO,
}: {
  scrollContainerRef: RefObject<HTMLElement | null>;
  scrollSyncKey?: string | number;
  /** 相对容器 clientHeight，超过该倍数才显示 */
  showAfterViewportRatio?: number;
}) => {
  const [visible, setVisible] = useState(false);
  const isMobile = useAppSelector((state) => state.config.isMobile);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const updateVisible = () => {
      setVisible(el.scrollTop >= el.clientHeight * showAfterViewportRatio);
    };

    updateVisible();
    el.addEventListener('scroll', updateVisible, { passive: true });
    const ro = new ResizeObserver(updateVisible);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', updateVisible);
      ro.disconnect();
    };
  }, [scrollContainerRef, showAfterViewportRatio, scrollSyncKey]);

  const scrollToTopSmooth = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };
  if (!isMobile) return null;

  const content = (
    <>
      <div
        className={clsx(
          'w-52px h-52px rounded-full bg-[var(--Background-100)] shadow-[0_2px_8px_0_var(--Shadow-400)]',
          'cursor-pointer touch-none select-none',
          'flex items-center justify-center',
          'right-[4px] bottom-[calc(100px+env(safe-area-inset-bottom,0px))]',
          'transition-opacity duration-300 ease-in-out',
          visible ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
        onClick={scrollToTopSmooth}
        aria-hidden={!visible}
        style={{
          position: 'fixed',
          zIndex: zIndexMap.betFloatingButton,
        }}
      >
        <div className="flex flex-col items-center gap-[2px] text-[var(--Text-Main-10)]">
          <div className="flex h-16px items-center justify-center">
            <Icon src="/images/common/arrows_up2.svg" size="14px" color="var(--Text-Main-10)" />
          </div>
          <p className="din-pro _tf[14] leading-[12px] font-500 text-[var(--Text-Main-10)]">TOP</p>
        </div>
      </div>
    </>
  );

  return createPortal(content, document.body);
};

export default FloatingButton;

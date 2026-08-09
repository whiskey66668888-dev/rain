import clsx from 'clsx';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
// import 'swiper/css';

import { useAppSelector } from '@/core/store/hooks';
import styles from './index.module.scss';

interface HorizontalScrollSectionProps {
  title: string;
  label?: string;
  labelList?: string[];
  hideHeader?: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  listClassName?: string;
  listItemClassName?: string;
  viewAllText?: string;
  onViewAll?: () => void;
  flushEndOnMobile?: boolean;
  viewNav?: boolean;
}

const HorizontalScrollSection: React.FC<HorizontalScrollSectionProps> = ({
  title,
  label,
  labelList,
  hideHeader = false,
  icon,
  children,
  className,
  listClassName,
  listItemClassName,
  viewAllText,
  onViewAll,
  flushEndOnMobile = false,
  viewNav = true,
}) => {
  const scrollRef = useRef<HTMLUListElement | null>(null);
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);
  const isDesktop = screenBreakpoint !== 'md';
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const items = useMemo(() => React.Children.toArray(children), [children]);
  const mergedLabels = useMemo(() => {
    const fromList = Array.isArray(labelList) ? labelList : [];
    if (fromList.length > 0) return fromList.filter(Boolean);
    return label ? [label] : [];
  }, [labelList, label]);

  const syncScrollState = useCallback(() => {
    const node = scrollRef.current;
    if (!node) return;

    const maxScrollLeft = Math.max(0, node.scrollWidth - node.clientWidth);
    setCanScrollPrev(node.scrollLeft > 4);
    setCanScrollNext(node.scrollLeft < maxScrollLeft - 4);
  }, []);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;

    syncScrollState();

    const handleScroll = () => syncScrollState();
    node.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(handleScroll);
      resizeObserver.observe(node);
    }

    return () => {
      node.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      resizeObserver?.disconnect();
    };
  }, [items.length, syncScrollState]);

  const handleScrollByPage = useCallback((direction: 'prev' | 'next') => {
    const node = scrollRef.current;
    if (!node) return;

    const pageWidth = Math.max(node.clientWidth - 16, 120);
    node.scrollBy({
      left: direction === 'prev' ? -pageWidth : pageWidth,
      behavior: 'smooth',
    });
  }, []);

  const showNav =
    viewNav && (isDesktop && canScrollPrev !== canScrollNext ? true : isDesktop && canScrollNext);

  return (
    <section className={clsx(className || 'mt-12px')}>
      {!hideHeader && (
        <div className="mb-12px flex items-center justify-between gap-12px pl-12px pr-12px h-[25px]">
          <div className="flex items-center gap-10px font-600 text-[var(--Text-Main-10)]">
            {icon}
            <p className="_tf[14] m-0">{title}</p>
            {mergedLabels.length > 0 && (
              <div className={styles.labelTicker}>
                {mergedLabels.length === 1 ? (
                  <p className="_tf[12] m-0 text-[var(--Text-800)] truncate font-weight-400">
                    {mergedLabels[0]}
                  </p>
                ) : (
                  <Swiper
                    key={`${screenBreakpoint}-${mergedLabels.length}`}
                    className={styles.labelSwiper}
                    direction="vertical"
                    modules={[Autoplay]}
                    loop={mergedLabels.length > 1}
                    autoplay={{ delay: 5000, disableOnInteraction: false }}
                    allowTouchMove={false}
                    observer={true}
                    observeParents={true}
                  >
                    {mergedLabels.map((text, index) => (
                      <SwiperSlide key={`${text}-${index}`}>
                        <p className="_tf[12] m-0 text-[var(--Text-800)] truncate font-weight-400">
                          {text}
                        </p>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-8px">
            {onViewAll && viewAllText && (
              <button
                type="button"
                className="_tf[12] border-none p-0 font-600 leading-none text-[var(--Text-800)] cursor-pointer bg-[var(--Background-300)] rounded-4px px-[12px] py-[6px] whitespace-nowrap can-hover:hover:bg-[var(--ThemeColor-20)] can-hover:hover:color-[var(--ThemeColor-Main)]"
                onClick={onViewAll}
              >
                {viewAllText}
              </button>
            )}
            {showNav && (
              <div className={clsx('hidden lg:flex', styles.nav)}>
                <button
                  type="button"
                  className={styles.navButton}
                  disabled={!canScrollPrev}
                  onClick={() => handleScrollByPage('prev')}
                  aria-label="向左滑动"
                >
                  <svg viewBox="0 0 5 10" className="h-10px w-5px" fill="none" aria-hidden="true">
                    <path
                      d="M4 1L1 5L4 9"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  className={styles.navButton}
                  disabled={!canScrollNext}
                  onClick={() => handleScrollByPage('next')}
                  aria-label="向右滑动"
                >
                  <svg viewBox="0 0 5 10" className="h-10px w-5px" fill="none" aria-hidden="true">
                    <path
                      d="M1 1L4 5L1 9"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <ul
        ref={scrollRef}
        className={clsx(
          'm-0 flex list-none gap-8px overflow-x-auto overflow-y-hidden p-0 pl-12px scrollbar-none [scroll-snap-type:x_mandatory] [scroll-padding-left:12px]',
          flushEndOnMobile
            ? clsx(styles.flushEndOnMobile, '[scroll-padding-right:14px]')
            : 'pr-12px [scroll-padding-right:12px]',
          listClassName,
        )}
      >
        {items.map((item, index) => (
          <li key={index} className={clsx('shrink-0 [scroll-snap-align:start]', listItemClassName)}>
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default HorizontalScrollSection;

import React, { useEffect, useRef } from 'react';
import clsx from 'clsx';

import styles from './DiscoverSubTabs.module.scss';

/** 与 App DiscoverSubTabBarDelegate._tabBarHeight 一致 */
const TAB_BAR_HEIGHT = 34;

/** 超过该数量时横向滚动，与 App isScrollable = titles.length > 6 一致 */
const SCROLLABLE_TAB_THRESHOLD = 6;

interface DiscoverSubTabsProps {
  tabs: string[];
  activeIndex: number;
  onChange: (index: number) => void;
  isVideoVisible?: boolean;
  isDataBoardVisible?: boolean;
  embeddedInSidebar?: boolean;
}

/**
 * 发现页二级 Tab（聊天/赛况/阵容等）
 * 对齐 App DiscoverSubTabBarDelegate
 */
const DiscoverSubTabs: React.FC<DiscoverSubTabsProps> = ({
  tabs,
  activeIndex,
  onChange,
  isVideoVisible = false,
  isDataBoardVisible = true,
  embeddedInSidebar = false,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);
  const hasInitializedScrollRef = useRef(false);

  const isScrollable = tabs.length > SCROLLABLE_TAB_THRESHOLD;

  useEffect(() => {
    if (!isScrollable || !activeTabRef.current || !scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const activeElement = activeTabRef.current;

    const firstTabElement = container.querySelector('button');
    const isFirstTabActive = firstTabElement === activeElement;
    if (!hasInitializedScrollRef.current && isFirstTabActive) {
      container.scrollTo({ left: 0, behavior: 'auto' });
      hasInitializedScrollRef.current = true;
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const activeRect = activeElement.getBoundingClientRect();

    const nextScrollLeft =
      activeRect.left -
      containerRect.left +
      container.scrollLeft -
      containerRect.width / 2 +
      activeRect.width / 2;

    const maxScrollLeft = Math.max(0, container.scrollWidth - container.clientWidth);
    container.scrollTo({
      left: Math.min(Math.max(0, nextScrollLeft), maxScrollLeft),
      behavior: 'smooth',
    });
    hasInitializedScrollRef.current = true;
  }, [activeIndex, isScrollable, tabs]);

  // App：仅 discoverSubTabTitles.length > 1 时展示二级 TabBar
  if (tabs.length <= 1) return null;

  return (
    <div
      className={clsx(
        styles.subTabsContainer,
        isVideoVisible && styles.video,
        !isDataBoardVisible && !isVideoVisible && styles.dataBoardCollapsed,
        embeddedInSidebar && styles.embeddedInSidebar,
      )}
      style={{ height: TAB_BAR_HEIGHT }}
    >
      <div
        className={clsx(styles.subTabsWrapper, isScrollable && styles.scrollable)}
        ref={scrollContainerRef}
      >
        {tabs.map((tab, index) => (
          <button
            key={`${tab}-${index}`}
            ref={index === activeIndex ? activeTabRef : null}
            type="button"
            className={clsx(
              styles.subTab,
              '_tf[14]',
              isScrollable && styles.scrollableTab,
              index === activeIndex && styles.active,
            )}
            onClick={() => onChange(index)}
          >
            <span className={styles.labelRow}>
              <span className={styles.label}>{tab}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DiscoverSubTabs;

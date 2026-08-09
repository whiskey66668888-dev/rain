import React, { useEffect, useRef } from 'react';

import styles from './BettingTabs.module.scss';
import Icon from '@/common/components/Icon';
import clsx from 'clsx';
import { useAppSelector } from '@/core/store/hooks';

/** 与 App DetailStickyTab：length < 5 均分，否则横向滚动 */
const EQUAL_WIDTH_TAB_THRESHOLD = 5;

interface BettingTabsProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  onToggleAllCollapse: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  isVideoVisible: boolean;
  isAllCollapsed?: boolean;
  /** 与顶栏数据板收起联动，修正吸顶偏移 */
  isDataBoardVisible?: boolean;
  /** 体育首页右侧栏嵌入：tabs 顶对齐，由外层 flex + 下方列表滚动 */
  embeddedInSidebar?: boolean;
  /** 发现 tab 下隐藏收起按钮，与 App 详情页一致 */
  hideCollapseButton?: boolean;
  /** 发现 tab 的文案，用于定位红点位置（可能为「发现」或「聊天」） */
  discoverTabLabel?: string;
  /** 是否展示发现 tab 的引导红点 */
  showDiscoverBadge?: boolean;
}

/**
 * 投注标签页组件（对齐 App DetailStickyTab + StickyTabBarDelegate）
 */
const BettingTabs: React.FC<BettingTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  onToggleAllCollapse,
  isVideoVisible,
  isAllCollapsed = false,
  isDataBoardVisible = true,
  embeddedInSidebar = false,
  hideCollapseButton = false,
  discoverTabLabel,
  showDiscoverBadge = false,
}) => {
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);
  const isMobile = screenBreakpoint === 'md';
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);
  const hasInitializedScrollRef = useRef(false);

  const isEqualWidth = tabs.length > 0 && tabs.length < EQUAL_WIDTH_TAB_THRESHOLD;

  useEffect(() => {
    if (isEqualWidth || !activeTabRef.current || !scrollContainerRef.current) return;

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
  }, [activeTab, isEqualWidth]);

  return (
    <div
      className={clsx(
        styles.tabsOuter,
        hideCollapseButton && styles.discoverActive,
        embeddedInSidebar && styles.embeddedInSidebar,
        isVideoVisible && styles.video,
        !isMobile && !isDataBoardVisible && !isVideoVisible && styles.dataBoardCollapsed,
      )}
    >
      <div className={styles.tabsContainer}>
        <div
          className={clsx(styles.tabsWrapper, isEqualWidth ? styles.equalWidth : styles.scrollable)}
          ref={scrollContainerRef}
        >
          {tabs.map((tab) => (
            <button
              key={tab}
              ref={tab === activeTab ? activeTabRef : null}
              type="button"
              className={clsx(
                styles.tab,
                '_tf[14]',
                isEqualWidth && styles.equalWidthTab,
                tab === activeTab && styles.active,
              )}
              onClick={() => onTabChange(tab)}
            >
              {tab === discoverTabLabel ? (
                <span className={styles.discoverTabInner}>
                  <span className={styles.tabLabel}>{tab}</span>
                  {showDiscoverBadge && <span className={styles.discoverBadge} aria-hidden />}
                </span>
              ) : (
                <span className={styles.tabLabel}>{tab}</span>
              )}
            </button>
          ))}
        </div>
        {!hideCollapseButton && (
          <div className={styles.collapseAction}>
            <span className={styles.collapseDivider} aria-hidden />
            <button
              type="button"
              className={styles.expandButton}
              onClick={onToggleAllCollapse}
              aria-label="展开收起"
            >
              <Icon
                src="/images/common/sportsDetails/DoubleArrowExpand.svg"
                size="14px"
                color="var(--Text-800)"
                className={clsx(styles.expandIcon, isAllCollapsed && styles.collapsed)}
              />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BettingTabs;

import React, { useEffect, useMemo, useRef, useState } from 'react';

import { HotSportId, PlayType } from '@/apis/commonSports/constants';
import { useAppSelector } from '@/core/store/hooks';

import useSportsMainListControl from '@/common/hooks/useSportsMainListControl';
import { useGetMatchCountQuery } from '@/apis/fbSports/getMatchCount';

import styles from './NavbarMenu.module.scss';
// import Icon from '@/common/components/Icon';
import clsx from 'clsx';
import Icon from '@/common/components/Icon';
import SearchModal from '../SearchModal';
import LeagueTabsPC from '../LeagueTabs/LeagueTabsPC';
import dayjs from 'dayjs';
import { LotterySportId } from '@/apis/commonSports/constants';
import { ClientOnly } from '@/common/components/ClientOnly';

const PcNavBarMenu: Partial<Record<PlayType, { title: string }>> = {
  [PlayType.Champion]: {
    title: '冠军',
  },
  [PlayType.Living]: {
    title: '滚球',
  },
  [PlayType.Follow]: {
    title: '关注',
  },
  [PlayType.Today]: {
    title: '今日',
  },
  [PlayType.Early]: {
    title: '早盘',
  },
};

const TimeStepFor7Days = (() => {
  const list = Array(7)
    .fill(null)
    .map((_, index) => {
      const date = dayjs()
        .locale('zh-cn')
        .add(index + 1, 'day');
      const startTime = date.startOf('day').valueOf();
      const endTime = date.endOf('day').valueOf();
      return { startTime, endTime };
    });
  return list;
})();

/**
 * H5 体育导航栏菜单组件
 * 与 PC 体育侧边栏联动，使用相同的数据源和状态管理
 * 支持自动滚动到当前选中的菜单项
 */
const NavBarMenuPC: React.FC = () => {
  const menus = useAppSelector((state) => state.sport.mainList.datas.menuInfo.menus);
  const {
    orderBy,
    playType: currentPlayType,
    sportId: currentSportId,
    collapsedAll,
    filterTime,
    hasHotList,
  } = useAppSelector((state) => state.sport.mainList.settings);
  const { changeCollapsedAll, changeOrderBy, changeFilterTime, switchSportId } =
    useSportsMainListControl();

  // 竞彩和热门不显示日期筛选
  const isShowDateFilter =
    currentPlayType === PlayType.Early &&
    currentSportId !== HotSportId &&
    currentSportId !== LotterySportId;
  const isHideNavBarMenu = currentPlayType === PlayType.Early || currentPlayType === PlayType.Today;
  const { data: matchCountData } = useGetMatchCountQuery(
    { sportId: currentSportId },
    isShowDateFilter,
  );

  // 容器 ref
  const navRef = useRef<HTMLElement>(null);
  // 每个按钮的 ref Map，key 为 sportId
  const buttonRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
  const [modalVisible, setModalVisible] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // 当前菜单列表
  const menuList = useMemo(() => {
    const currentMenuList = menus[currentPlayType] || [];
    if (hasHotList) {
      return currentMenuList;
    } else {
      // 固定获取热门赛事列表，如果没有一条数据就不展示热门
      return currentMenuList.filter((item) => item.sportId !== HotSportId);
    }
  }, [menus, currentPlayType, hasHotList]);

  const activeTime = useMemo(() => {
    if (!filterTime) return 0;
    if (filterTime.length === 0) return 0;

    return filterTime[0];
  }, [filterTime]);
  /**
   * 滚动到指定的菜单项
   */
  const scrollToItem = (sportId: number): void => {
    const button = buttonRefs.current.get(sportId);
    const container = navRef.current;

    if (!button || !container) {
      return;
    }

    // 计算目标元素的位置
    const containerRect = container.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();

    // 计算需要滚动的距离
    // 让目标元素居中显示
    const scrollLeft =
      container.scrollLeft +
      (buttonRect.left - containerRect.left) -
      (containerRect.width - buttonRect.width) / 2;

    // 平滑滚动
    container.scrollTo({
      left: scrollLeft,
      behavior: 'smooth',
    });
  };

  const updateScrollButtons = () => {
    const container = navRef.current;
    if (!container) return;
    const maxScrollLeft = container.scrollWidth - container.clientWidth;
    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(container.scrollLeft < maxScrollLeft - 1);
  };

  const scrollNavBy = (direction: 'left' | 'right') => {
    const container = navRef.current;
    if (!container) return;
    const distance = Math.max(180, Math.floor(container.clientWidth * 0.5));
    container.scrollBy({
      left: direction === 'left' ? -distance : distance,
      behavior: 'smooth',
    });
  };

  // 当 currentPlayType 或 currentSportId 变化时，自动滚动到对应位置
  useEffect(() => {
    if (currentSportId && menuList.length > 0) {
      // 确保 DOM 已经更新
      const timer = setTimeout(() => {
        scrollToItem(currentSportId);
      }, 0);

      return () => {
        clearTimeout(timer);
      };
    }
    return () => {};
  }, [currentPlayType, currentSportId, menuList.length]);

  useEffect(() => {
    updateScrollButtons();
  }, [menuList.length, currentPlayType, currentSportId]);

  useEffect(() => {
    const onResize = () => updateScrollButtons();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // 当 currentPlayType 变化时，自动滚动到第一个
  useEffect(() => {
    if (menuList.length > 0) {
      const timer = setTimeout(() => {
        scrollToItem(menuList[0]?.sportId ?? HotSportId);
      }, 0);
      return () => clearTimeout(timer);
    }
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 仅响应玩法切换，不依赖 menuList 否则每次 menus 更新都会滚到第一项
  }, [currentPlayType]);

  // 点击处理函数，包含滚动逻辑
  const handleItemClick = (sportId: number) => {
    switchSportId(sportId);
    // 点击时也滚动到对应位置
    scrollToItem(sportId);
  };

  // 设置按钮 ref 的回调函数
  const setButtonRef = (sportId: number) => (el: HTMLButtonElement | null) => {
    if (el) {
      buttonRefs.current.set(sportId, el);
    } else {
      buttonRefs.current.delete(sportId);
    }
  };
  return (
    <div className={styles.navBarMenuWrapper}>
      <div className={styles.navBarMenuTitle}>
        <p className="_tf[14]">{PcNavBarMenu?.[currentPlayType]?.title}</p>
        <div className={clsx(styles.buttonWrapper, '_tf[12]')}>
          <div className={styles.button}>
            <span className={clsx(orderBy === 1 && styles.active)} onClick={() => changeOrderBy(1)}>
              联赛
            </span>
            <Icon src="/images/common/sort_pc.svg" size="12px" color="var(--Text-800)" />
            <span className={clsx(orderBy === 0 && styles.active)} onClick={() => changeOrderBy(0)}>
              时间
            </span>
          </div>
          <div className={styles.button} onClick={() => setModalVisible(true)}>
            赛事筛选<span className="text-[var(--ThemeColor-Main)]">(全部)</span>
          </div>
          <span
            className={clsx(styles.iconExpandAll, {
              [styles.collapsed as string]: collapsedAll,
            })}
            onClick={() => changeCollapsedAll(!collapsedAll)}
          >
            <Icon src="/images/common/arrows_up.svg" size="16px" color="var(--Text-700)" />
          </span>
        </div>
      </div>
      {isShowDateFilter && (
        <div className={styles.calendar}>
          <div className={clsx(styles.calendarWrapper, '_tf[12]')}>
            <span
              className={clsx(styles.calendarItem, activeTime === 0 && styles.active)}
              onClick={() => changeFilterTime([])}
            >
              全部
            </span>
            {TimeStepFor7Days.filter((item) =>
              _.find(
                matchCountData?.dl,
                (dataItem) => dataItem.bt + 12 * 60 * 60 * 1000 === item.startTime,
              ),
            ).map((item, index) => {
              const isActive = item.startTime === activeTime;
              return (
                <span
                  key={index}
                  className={clsx(styles.calendarItem, isActive && styles.active)}
                  onClick={() => changeFilterTime([item.startTime, item.endTime])}
                >
                  {dayjs(item.startTime).format('MM月DD日')}({matchCountData?.dl[index]?.c ?? 0})
                </span>
              );
            })}
          </div>
        </div>
      )}
      {!isHideNavBarMenu && menuList.length > 0 && (
        <div className={styles.navBarMenuContainer}>
          <nav
            ref={navRef}
            className={`${styles.navBarMenu} _tf[14]`}
            onScroll={updateScrollButtons}
          >
            {menuList.map((item) => {
              const isExpanded = currentSportId === item.sportId;
              return (
                <button
                  ref={setButtonRef(item.sportId)}
                  onClick={() => handleItemClick(item.sportId)}
                  key={item.sportId}
                  className={clsx(styles.menuItem, isExpanded && styles.menuItemActive)}
                >
                  {isExpanded && item.sportId === HotSportId ? (
                    <img
                      src="/images/common/menu/sports/sid/-2_active.svg"
                      className={styles.menuItemIcon}
                    />
                  ) : (
                    <Icon
                      src={`/images/common/menu/sports/sid/${item.viewId}.svg`}
                      className={styles.menuItemIcon}
                      size="20px"
                      color={isExpanded ? 'var(--ThemeColor-Main)' : 'var(--Text-800)'}
                    />
                  )}
                  <div className={styles.menuItemContent}>
                    <span className={clsx({ 'font-bold': isExpanded })}>{item.name}</span>
                    {
                      // 热门赛种不展示数量
                      item.sportId !== HotSportId && (
                        <p className={clsx(styles.menuItemCount, '_tf[12] din-pro')}>
                          {item.count}
                        </p>
                      )
                    }
                  </div>
                </button>
              );
            })}
            {/* 左右两边各一个点击滑动的按钮 */}
            <button
              className={clsx(styles.navScrollBtn, styles.left, !canScrollLeft && styles.disabled)}
              onClick={() => canScrollLeft && scrollNavBy('left')}
              aria-label="向左滚动"
              type="button"
            >
              <span className={styles.navScrollBtnArrow} />
            </button>
            <button
              className={clsx(
                styles.navScrollBtn,
                styles.right,
                !canScrollRight && styles.disabled,
              )}
              onClick={() => canScrollRight && scrollNavBy('right')}
              aria-label="向右滚动"
              type="button"
            >
              <span className={styles.navScrollBtnArrow} />
            </button>
          </nav>
        </div>
      )}
      {/* 固定联赛快捷筛选：主列表上方单独一行（今日/早盘下球种 tab 隐藏，紧跟在标题行下） */}
      <ClientOnly>
        <LeagueTabsPC />
      </ClientOnly>
      <SearchModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </div>
  );
};

export default NavBarMenuPC;

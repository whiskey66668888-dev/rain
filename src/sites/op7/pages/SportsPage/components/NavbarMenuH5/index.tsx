import React, { useCallback, useEffect, useMemo, useRef } from 'react';

import { HotSportId, PlayType } from '@/apis/commonSports/constants';
import { useAppSelector } from '@/core/store/hooks';

import useSportsMainListControl from '@/common/hooks/useSportsMainListControl';

import styles from './NavbarMenu.module.scss';
// import Icon from '@/common/components/Icon';
import clsx from 'clsx';
import Icon from '@/common/components/Icon';

// const PcNavBarMenu: Partial<Record<PlayType, { title: string; icon: string }>> = {
//   [PlayType.Champion]: {
//     title: '冠军投注',
//     icon: '/images/common/menu/champion.svg',
//   },
//   [PlayType.Living]: {
//     title: 'LIVE滚球',
//     icon: '/images/common/menu/live.svg',
//   },
//   [PlayType.Follow]: {
//     title: '我的关注',
//     icon: '/images/common/menu/follow.svg',
//   },
// };

/**
 * H5 体育导航栏菜单组件
 * 与 PC 体育侧边栏联动，使用相同的数据源和状态管理
 * 支持自动滚动到当前选中的菜单项
 */
const NavBarMenuH5: React.FC = () => {
  const menus = useAppSelector((state) => state.sport.mainList.datas.menuInfo.menus);
  const currentPlayType = useAppSelector((state) => state.sport.mainList.settings.playType);
  const currentSportId = useAppSelector((state) => state.sport.mainList.settings.sportId);
  const followMatch = useAppSelector((state) => state.sport.mainList.settings.followMatch);
  const hasHotList = useAppSelector((state) => state.sport.mainList.settings.hasHotList);

  const { switchSportId } = useSportsMainListControl();
  // 容器 ref
  const navRef = useRef<HTMLElement>(null);
  // 每个按钮的 ref Map，key 为 sportId
  const buttonRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
  const scrollRafRef = useRef<number | null>(null);
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

  // pc上只有冠军投注，LIVE滚球，我的关注三个要显示赛种菜单
  const showNavBarMenu = useMemo(() => {
    if (currentPlayType === PlayType.Follow) {
      return followMatch.length > 0;
    }
    return true;
    // return Object.keys(PcNavBarMenu).includes(currentPlayType);
  }, [currentPlayType, followMatch]);

  /**
   * 滚动到指定的菜单项
   */
  const scrollToItem = useCallback((sportId: number, behavior: ScrollBehavior = 'smooth'): void => {
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
      behavior,
    });
  }, []);

  // 当玩法/赛种变化时，自动滚动到对应位置；合并处理避免玩法切换时触发两次横向滚动
  useEffect(() => {
    if (!menuList.length) return undefined;

    const targetSportId = menuList.some((item) => item.sportId === currentSportId)
      ? currentSportId
      : (menuList[0]?.sportId ?? HotSportId);

    if (scrollRafRef.current !== null) {
      window.cancelAnimationFrame(scrollRafRef.current);
    }

    scrollRafRef.current = window.requestAnimationFrame(() => {
      scrollToItem(targetSportId, 'auto');
      scrollRafRef.current = null;
    });

    return () => {
      if (scrollRafRef.current !== null) {
        window.cancelAnimationFrame(scrollRafRef.current);
        scrollRafRef.current = null;
      }
    };
  }, [currentPlayType, currentSportId, menuList, scrollToItem]);

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

  if (!showNavBarMenu) return null;
  return (
    <div className={clsx(styles.navBarMenuWrapper)}>
      <nav ref={navRef} className={`${styles.navBarMenu} _tf[12]`}>
        {menuList.map((item) => {
          const isExpanded = currentSportId === item.sportId;
          return (
            <button
              ref={setButtonRef(item.sportId)}
              onClick={() => handleItemClick(item.sportId)}
              key={item.sportId}
              className={`${isExpanded ? styles.menuItemActive : ''}`}
            >
              <span className={clsx({ 'font-bold': isExpanded }, '_tf[14]')}>{item.name}</span>
              {
                // 热门赛种不展示数量
                item.sportId !== HotSportId && <p>{item.count}</p>
              }
              {item.sportId === HotSportId &&
                (isExpanded ? (
                  <img
                    src="/images/common/menu/sports/sid/-2_active.svg"
                    className={styles.menuItemIcon}
                  />
                ) : (
                  <Icon
                    src="/images/common/menu/sports/sid/-2.svg"
                    size="12px"
                    color="var(--Text-800)"
                  />
                ))}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default NavBarMenuH5;

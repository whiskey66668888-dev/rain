import React, { useEffect, useMemo, useRef } from 'react';

import Icon from '@/common/components/Icon';

import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import { setExpandedMenuId } from '@/core/store/slices/entertainmentSlice';
import {
  ENTERTAINMENT_HOME_PAGE_TYPE,
  ENTERTAINMENT_MENU_ID,
  HomeListId,
} from '@/utils/constants/entertainment';

import { MergedBaseList, useHomeList } from '@/common/hooks/useHomeList';

import styles from './NavbarMenu.module.scss';
import { generatePath, useParams } from 'react-router-dom';
import { PATHS } from '../../routes/paths';
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import {
  getLayoutMainContentScrollTop,
  restoreLayoutMainContentScrollTop,
  scrollToSportsPageMainAreaIfNeeded,
} from '@/utils';

/**
 * H5 导航栏菜单组件
 * 与 PC 侧边栏联动，使用相同的数据源和状态管理
 */
const NavBarMenu: React.FC = () => {
  const { pageType } = useParams<{ pageType: ENTERTAINMENT_HOME_PAGE_TYPE }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigateWithLanguage();
  const expandedMenuId = useAppSelector((state) => state.entertainment.expandedMenuId);
  const currentMenuId = useMemo(() => {
    return pageType === ENTERTAINMENT_HOME_PAGE_TYPE.SLOT_GAME ? HomeListId.SLOTS : expandedMenuId;
  }, [pageType, expandedMenuId]);
  const { homeList } = useHomeList();
  const navRef = useRef<HTMLElement>(null);
  const buttonRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

  const scrollToItem = (menuId: number): void => {
    const button = buttonRefs.current.get(menuId);
    const container = navRef.current;

    if (!button || !container) {
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();
    const scrollLeft =
      container.scrollLeft +
      (buttonRect.left - containerRect.left) -
      (containerRect.width - buttonRect.width) / 2;

    container.scrollTo({
      left: scrollLeft,
      behavior: 'smooth',
    });
  };

  const handleMenuClick = (menuId: number): void => {
    const shouldReturnToHome = currentMenuId === Number(HomeListId.SLOTS);
    const currentMainScrollTop = shouldReturnToHome ? null : getLayoutMainContentScrollTop();

    if (currentMenuId === Number(HomeListId.SLOTS)) {
      dispatch(setExpandedMenuId(menuId));
      navigate(
        generatePath(PATHS.entertainment, { pageType: ENTERTAINMENT_HOME_PAGE_TYPE.HOME, id: '' }),
      );
      // dispatch(setExpandedMenuId(ENTERTAINMENT_MENU_ID));
    } else {
      dispatch(setExpandedMenuId(menuId));
    }
    if (shouldReturnToHome) {
      scrollToSportsPageMainAreaIfNeeded();
    }
    restoreLayoutMainContentScrollTop(currentMainScrollTop);
    scrollToItem(menuId);
  };

  const navMenuItems = useMemo(() => {
    const items: Array<MergedBaseList & { isEntertainmentHall?: boolean }> = [
      // 娱乐大厅（特殊处理）
      {
        label: '娱乐大厅',
        shortLabel: '大厅',
        icon: '/images/common/menu/entertainment-hall.svg',
        homeId: ENTERTAINMENT_MENU_ID,
        promotion: '',
        children: [],
        isEntertainmentHall: true,
      },
      // 其他菜单项
      ...homeList,
    ];
    return items;
  }, [homeList]);

  const setButtonRef =
    (menuId: number) =>
    (el: HTMLButtonElement | null): void => {
      if (el) {
        buttonRefs.current.set(menuId, el);
      } else {
        buttonRefs.current.delete(menuId);
      }
    };

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToItem(currentMenuId);
    }, 0);

    return () => clearTimeout(timer);
  }, [currentMenuId, navMenuItems.length]);

  return (
    <nav
      ref={navRef}
      className={`${styles.navBarMenu} mb-[-12px] _tf[14] position-sticky top-0 lg:top-[48px] z-11 bg-[var(--Background-700)]`}
    >
      {navMenuItems.map((item) => {
        const isActive = currentMenuId === item.homeId;

        return (
          <button
            ref={setButtonRef(item.homeId)}
            key={item.homeId}
            className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
            onClick={() => handleMenuClick(item.homeId)}
          >
            <div className={styles.navItemContent}>
              <Icon
                className={styles.navItemIconActive}
                src={item.icon}
                size="18px"
                color={isActive ? 'var(--White-100)' : 'var(--ThemeColor-Main, #1a81ff)'}
              />
              <span className={styles.navLabel}>{item.shortLabel}</span>
            </div>
          </button>
        );
      })}
    </nav>
  );
};

export default NavBarMenu;

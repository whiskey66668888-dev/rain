import React, { lazy, Suspense, useEffect, useMemo } from 'react';
import { generatePath, useLocation } from 'react-router-dom';
import clsx from 'clsx';

import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import { AppPath, PATHS } from '@/sites/op7/routes/paths';
import { useAppSelector } from '@/core/store/hooks';

import styles from './BottomMenu.module.scss';
import Icon from '@/common/components/Icon';
import { useAppDispatch } from '@/core/store/hooks';
import { openLoginModal } from '@/core/store/slices/authUISlice';
import { useSocialUnreadCount } from '@/apis/origin/social/getSocialUnreadCount';
import { prefetchBottomTabRoutes } from '@/sites/op7/routes/prefetchBottomTabRoutes';

const loadBottomMenuLottie = () => import('./BottomMenuLottie');
const BottomMenuLottie = lazy(loadBottomMenuLottie);

/** 与 activeMenuId 一致：去掉语言前缀，供底部 Tab 与 PWA 横幅等共用 */
export const stripLocaleFromPathname = (pathname: string): string =>
  pathname.replace(/^\/[a-z]{2}(?:-[a-z]{2})?(?=\/|$)/i, '') || '/';

interface BottomMenuItem {
  id: string;
  label: string;
  path: AppPath;
  /** 非激活状态下显示的静态 SVG 图标 */
  defaultIcon?: string;
  /** 激活时显示背景装饰图并悬浮在导航栏上方 */
  bgImage?: string;
  floatOnActive?: boolean;
  /** 额外的激活路径（除 path 外，匹配这些路径时也视为激活） */
  activePaths?: string[];
}

const buildBottomMenuItems = (): BottomMenuItem[] => {
  return [
    {
      id: 'promotion',
      label: '发现',
      path: PATHS.promotionSponsor,
      defaultIcon: '/images/common/menu/faxian.svg',
      activePaths: [
        PATHS.promotion,
        PATHS.promotionSponsor,
        PATHS.promotionDiscount,
        PATHS.promotionHotEvent,
        PATHS.mineInviteFriends,
      ],
    },
    {
      id: 'entertainment',
      label: '娱乐',
      path: generatePath(PATHS.entertainment, { pageType: 'home', id: '' }) as AppPath,
      activePaths: ['/entertainment'],
      defaultIcon: '/images/common/menu/recreation-unselected.svg',
      bgImage: '/images/common/menu/main_tab/entertainment_bg.png',
      floatOnActive: true,
    },
    {
      id: 'sports',
      label: '体育',
      path: PATHS.sports,
      activePaths: [PATHS.sports, '/SportsDetailsPage', '/Champion'],
      defaultIcon: '/images/common/menu/sports-icon.svg',
      bgImage: '/images/common/menu/main_tab/sport_bg.png',
      floatOnActive: true,
    },
    {
      id: 'betting',
      label: '注单',
      path: PATHS.betHistoryH5,
      defaultIcon: '/images/common/menu/betting.svg',
    },
    {
      id: 'mine',
      label: '我的',
      path: PATHS.mineH5,
      activePaths: ['/mine'],
      defaultIcon: '/images/common/menu/mine_1.svg',
    },
  ];
};

/** 当前路径是否属于底部五个 Tab 对应业务域（与 BottomMenu 高亮范围一致） */
export const isRouteUnderH5BottomTabs = (pathname: string): boolean => {
  const pathWithoutLang = stripLocaleFromPathname(pathname);
  if (pathWithoutLang === PATHS.home || pathWithoutLang === '') return true;
  return buildBottomMenuItems().some((item) => {
    if (item.path === '/') return false;
    if (item.activePaths) {
      return item.activePaths.some((p) => pathWithoutLang.startsWith(p));
    }
    return pathWithoutLang.startsWith(item.path);
  });
};

const BottomMenu: React.FC = () => {
  const navigate = useNavigateWithLanguage();
  const location = useLocation();
  const unreadInboxCount = useAppSelector((state) => state.messageCenter.unreadInboxCount);
  const { isGamePlaying } = useAppSelector((state) => state.entertainment);
  const isLogin = useAppSelector((state) => state.user.userInfo.isLogin);
  const dispatch = useAppDispatch();
  const socialUnreadCount = useSocialUnreadCount();
  const hasSocialUnread = socialUnreadCount > 0;

  const bottomMenuItems = useMemo(() => buildBottomMenuItems(), []);

  useEffect(() => {
    let cancelled = false;
    let idleId: number | undefined;
    let gapTimer: number | undefined;

    // 首屏稳定后再预取，避免与关键渲染/API 抢带宽
    const PREFETCH_FLOOR_MS = 2500;

    const runPrefetch = () => {
      if (cancelled) return;
      void prefetchBottomTabRoutes().catch(() => {});
      gapTimer = window.setTimeout(() => {
        if (cancelled) return;
        void loadBottomMenuLottie()
          .then((mod) => mod.prefetchBottomMenuLotties())
          .catch(() => {});
      }, 600);
    };

    const floorTimer = window.setTimeout(() => {
      if (cancelled) return;
      if ('requestIdleCallback' in window) {
        idleId = window.requestIdleCallback(runPrefetch, { timeout: 2000 });
        return;
      }
      runPrefetch();
    }, PREFETCH_FLOOR_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(floorTimer);
      if (gapTimer !== undefined) window.clearTimeout(gapTimer);
      if (idleId !== undefined) window.cancelIdleCallback(idleId);
    };
  }, []);

  const activeMenuId = useMemo(() => {
    const pathname = location.pathname;
    const pathWithoutLang = stripLocaleFromPathname(pathname);
    if (pathWithoutLang === PATHS.home || pathWithoutLang === '') {
      return '';
    }
    const matchedItem = bottomMenuItems.find((item) => {
      if (item.path === '/') return false;
      if (item.activePaths) {
        return item.activePaths.some((p) => pathWithoutLang.startsWith(p));
      }
      return pathWithoutLang.startsWith(item.path);
    });
    return matchedItem?.id || 'entertainment';
  }, [location.pathname, bottomMenuItems]);

  const handleTabClick = (path: AppPath) => {
    if (path === PATHS.betHistoryH5) {
      if (!isLogin) {
        dispatch(openLoginModal());
        return;
      }
    }
    navigate(path);
  };

  return (
    <nav
      className={clsx(
        styles.bottomMenuAnimate,
        'fixed left-0 right-0 bg-[var(--Button-100)]',
        'z-[var(--z-bottom-menu)]',
        isGamePlaying && 'hidden',
      )}
    >
      <div className="grid grid-cols-5">
        {bottomMenuItems.map((item) => {
          const isActive = activeMenuId === item.id;
          const isFloating = item.floatOnActive && isActive;
          const showRedDot = item.id === 'mine' && unreadInboxCount > 0;
          const showPromotionRedDot = item.id === 'promotion' && hasSocialUnread;

          return (
            <button
              key={item.id}
              data-id={item.id}
              className={clsx(styles.tabItem, isActive && styles.tabItemActive)}
              onClick={() => handleTabClick(item.path)}
            >
              {/* 娱乐/体育激活：拱形背景图覆盖 */}
              {isFloating && <div className={styles.archBump} />}

              {/* 图标 */}
              <div
                className={clsx(
                  styles.iconWrap,
                  item.floatOnActive && !isFloating && styles.iconWrapLarge,
                  isFloating && styles.iconFloating,
                )}
              >
                {/* 未激活：SVG 占位；激活（含浮起）：Lottie 动画 */}
                {!isActive && item.defaultIcon ? (
                  <Icon
                    src={item.defaultIcon}
                    color="var(--Text-700)"
                    style={{ width: '100%', height: '100%' }}
                    draggable={false}
                  />
                ) : (
                  <Suspense
                    fallback={
                      item.defaultIcon ? (
                        <Icon
                          src={item.defaultIcon}
                          color="var(--Text-700)"
                          style={{ width: '100%', height: '100%' }}
                          draggable={false}
                        />
                      ) : null
                    }
                  >
                    <BottomMenuLottie itemId={item.id} fallbackIcon={item.defaultIcon} />
                  </Suspense>
                )}
                {showPromotionRedDot && <span className={styles.redDot} />}
                {showRedDot && <span className={styles.redDot} />}
              </div>

              {/* 标签：所有 tab 固定在底部同一位置 */}
              <span className={`${styles.tabLabel} _tf[10]`}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomMenu;

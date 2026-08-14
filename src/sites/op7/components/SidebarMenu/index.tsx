import React, { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { useMemoizedFn } from 'ahooks';
import { useTranslation } from 'react-i18next';

import Icon from '@/common/components/Icon';

import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import {
  setActiveGameHomeId,
  setCurrentGameInfo,
  setExpandedMenuId,
} from '@/core/store/slices/entertainmentSlice';
import { ENTERTAINMENT_MENU_ID } from '@/utils/constants/entertainment';

import { MergedBaseList, useHomeList } from '@/common/hooks/useHomeList';
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import { AppPath, PATHS } from '@/sites/op7/routes/paths';
import { useSystem } from '@/common/hooks/useSystem';

import styles from './SidebarMenu.module.scss';
import clsx from 'clsx';
import SportsMenu from './SportsMenu';
import { useRoute } from '@/sites/op7/hooks/useRoute';
import { ClientOnly } from '@/common/components/ClientOnly';
import { getSystemTheme } from '@/utils';
import { openLoginModal } from '@/core/store/slices/authUISlice';
import { useOpenCustomerService } from '@/sites/op7/hooks/useOpenCustomerService';
import { generatePath } from 'react-router-dom';
// import { useDiscountListQuery } from '@/apis/origin/promotion/getDiscountList';
import LazyImage from '@/common/components/LazyImage';
import { ESportsLeftPanelType, PlayType, PlayTypeId } from '@/apis/commonSports/constants';
import { FBSportIdValue } from '@/apis/fbSports/common/constants';
import useSportsMainListControl from '@/common/hooks/useSportsMainListControl';
import { BackMenuArrowSvg } from '../SvgIcons';
import { scrollToTopLayoutMainContent } from '@/utils';
import OneClickTransferButton from '../Bet/components/OneClickTransferButton';

const Bet = lazy(() => import('../Bet'));
const BetHistorySidebar = lazy(() => import('@/sites/op7/pages/BetHistoryPage/BetHistorySidebar'));
const PwaInstallDesktopEntry = lazy(() =>
  import('../PwaInstall').then((m) => ({ default: m.PwaInstallDesktopEntry })),
);

interface MenuSubItem {
  id: string;
  label: string;
  icon: string;
  path: AppPath;
}

/**
 * 第二组菜单项（可选二级菜单）
 */
interface MenuItem {
  id: string;
  label: string;
  icon: string;
  path?: AppPath;
  children?: MenuSubItem[];
}

export enum SidebarMenuId {
  RECENT_GAME_RECORD = 1001,
  MY_BETTING = 1002,
}

// // 体育优惠活动类型id
// const SPORTS_DISCOUNT_TYPE_ID = 1 as const;

/**
 * 侧边栏菜单组件
 */
const SidebarMenu: React.FC = () => {
  const expandedMenuId = useAppSelector((state) => state.entertainment.expandedMenuId);
  const themeMode = useAppSelector((state) => state.config.system.themeMode);
  const sportsLeftPanelType = useAppSelector((state) => state.sport.sportsLeftPanelType);
  const theme = themeMode === 'system' ? getSystemTheme() : themeMode;
  const isLogin = useAppSelector((state) => state.user.userInfo.isLogin);
  const navigate = useNavigateWithLanguage();
  const { setTheme } = useSystem();
  const { switchSportsLeftPanelType, switchPlayType } = useSportsMainListControl();
  const dispatch = useAppDispatch();
  const { homeList } = useHomeList();
  const { t } = useTranslation();
  const openCustomerService = useOpenCustomerService();
  // const { data: promotionList } = useDiscountListQuery(SPORTS_DISCOUNT_TYPE_ID);
  const route = useRoute();
  const handle = route?.handle;
  const routeModule = handle?.module;
  const sportsActive = routeModule === 'sports';
  const isEntertainmentTabActive = routeModule === 'entertainment';
  const [isSidebarMenuOpen, setIsSidebarMenuOpen] = useState(true);
  const [expandedGroup2Id, setExpandedGroup2Id] = useState<string | null>(null);
  const [sportsMenuResetKey, setSportsMenuResetKey] = useState(0);

  const handleSportsTabClick = useMemoizedFn(() => {
    switchSportsLeftPanelType(ESportsLeftPanelType.MENU);
    switchPlayType(PlayType.Living, FBSportIdValue.Football, PlayTypeId.Living);
    setExpandedGroup2Id(null);
    setSportsMenuResetKey((key) => key + 1);
    navigate(PATHS.sports);
  });

  // 回到落地页：顶部 Tab 与下方菜单选中态全部重置
  useEffect(() => {
    if (routeModule !== 'landing') return;
    dispatch(setExpandedMenuId(ENTERTAINMENT_MENU_ID));
    dispatch(setActiveGameHomeId(null));
    dispatch(setCurrentGameInfo(null));
    setExpandedGroup2Id(null);
  }, [routeModule, dispatch]);
  useEffect(() => {
    dispatch(setActiveGameHomeId(null));
  }, [sportsActive, dispatch]);
  useEffect(() => {
    if (!sportsActive) {
      switchSportsLeftPanelType(ESportsLeftPanelType.MENU);
    }
  }, [sportsActive, switchSportsLeftPanelType]);
  const navMenuItems = useMemo(() => {
    const items: Array<MergedBaseList & { isEntertainmentHall?: boolean }> = [
      // {
      //   label: '近期游戏记录',
      //   shortLabel: '近期游戏记录',
      //   icon: '/images/common/followed.svg',
      //   homeId: SidebarMenuId.RECENT_GAME_RECORD,
      //   promotion: '',
      //   children: [],
      //   path: generatePath(PATHS.entertainment, { pageType: 'home', id: '' }),
      // } as MergedBaseList & { path: AppPath },
      {
        label: '我的投注',
        shortLabel: '我的投注',
        icon: '/images/common/menu/bet.svg',
        homeId: SidebarMenuId.MY_BETTING,
        promotion: '',
        children: [],
        path: PATHS.allBettingRecord,
      } as MergedBaseList & { path: AppPath },
      // 其他菜单项
      ...homeList,
    ];
    return items;
  }, [homeList]);

  /**
   * 第二组菜单（无二级菜单）：优惠到设置
   */
  const menuGroup2: MenuItem[] = useMemo(
    () => [
      {
        id: 'promotion',
        label: t('common.promotion'),
        icon: '/images/common/menu/promotion.svg',
        path: PATHS.promotionDiscount,
        // children: promotionList
        //   ?.slice(0, 3)
        //   .map((item) => ({
        //     id: item.id.toString(),
        //     label: item.title,
        //     icon: '/images/common/menu/promotionchildren.svg',
        //     path: generatePath(PATHS.discountDetail, { id: item.id.toString() }) as AppPath,
        //   }))
        //   .concat({
        //     id: 'more',
        //     label: '查看全部',
        //     icon: '/images/common/menu/more.svg',
        //     path: PATHS.promotion,
        //   }),
      },
      // {
      //   id: 'betting',
      //   label: t('common.betting'),
      //   icon: '/images/common/menu/betting.svg',
      //   path: '/betting',
      // },
      {
        id: 'vip',
        label: t('common.vipCenter'),
        icon: '/images/common/menu/vip.svg',
        path: PATHS.vipCenter,
      },
      {
        id: 'partnership',
        label: t('common.partnership'),
        icon: '/images/common/menu/partnership.svg',
        path: PATHS.minePartnership,
      },
    ],
    [t],
  );
  const menuGroup3: MenuItem[] = useMemo(
    () => [
      {
        id: 'sponsorship',
        label: t('common.sponsorship'),
        icon: '/images/common/menu/sponsorship.svg',
        children: [
          {
            id: 'globalFootballAward',
            label: t('common.globalFootballAward'),
            icon: '/images/common/sponsor/hzj.png',
            path: generatePath(PATHS.PcSponsorDetail, { id: '17' }) as AppPath,
          },
          {
            id: 'juventus',
            label: t('common.juventus'),
            icon: `/images/${theme}/sponsor/ywts.png`,
            path: generatePath(PATHS.PcSponsorDetail, { id: '15' }) as AppPath,
          },
          {
            id: 'benfica',
            label: t('common.benfica'),
            icon: '/images/common/sponsor/bfk.png',
            path: generatePath(PATHS.PcSponsorDetail, { id: '19' }) as AppPath,
          },
        ],
      },
      {
        id: 'onlineCustomerService',
        label: t('common.onlineCustomerService'),
        icon: '/images/common/menu/onlineCustomerService.svg',
        // path: PATHS.onlineCustomerService,
      },
    ],
    [t, theme],
  );
  // 切换菜单展开/收起
  const handleToggleMenu = useMemoizedFn((menuId: number): void => {
    if (expandedMenuId === menuId) {
      dispatch(setExpandedMenuId(ENTERTAINMENT_MENU_ID));
    } else {
      dispatch(setExpandedMenuId(menuId));
    }
  });

  // 处理菜单项点击
  const handleMenuClick = useMemoizedFn((item: MergedBaseList): void => {
    if ('children' in item && item.children.length > 0) {
      // 娱乐分类直接跳转到娱乐页并选中分类，不再展开二级菜单
      dispatch(setExpandedMenuId(item.homeId));
      dispatch(setActiveGameHomeId(null));
      navigate(generatePath(PATHS.entertainment, { pageType: 'home', id: '' }));
      setIsSidebarMenuOpen(true);
      dispatch(setCurrentGameInfo(null));
      scrollToTopLayoutMainContent();
    } else if ('path' in item && item.path) {
      // 无子菜单，直接导航

      if (item.homeId === Number(SidebarMenuId.MY_BETTING)) {
        if (!isLogin) {
          dispatch(openLoginModal());
          return;
        }
      }
      navigate(item.path);
    } else {
      handleToggleMenu(item.homeId);
    }
  });

  const renderEntertainmentMenu = useMemo(() => {
    return navMenuItems.map((item) => {
      const isExpanded = expandedMenuId === item.homeId && isSidebarMenuOpen;
      const hasChildren = item.children && item.children.length > 0;

      return (
        <div key={item.homeId} className="flex flex-col">
          <button
            className={clsx(styles.menuButton, {
              [styles.menuItemActive as string]: isExpanded,
            })}
            onClick={() => handleMenuClick(item)}
          >
            <div className="flex items-center gap-12px flex-1">
              <Icon
                src={item.icon}
                size="16px"
                style={{
                  backgroundColor: isExpanded ? 'var(--ThemeColor-Main)' : 'var(--Text-800)',
                }}
                className="flex-shrink-0"
              />
              <span className="flex-1 text-left _tf[14]">{item.label}</span>
            </div>
            {hasChildren && (
              <div className={styles.arrowIconWrapper}>
                <Icon
                  src="/images/common/arrow_sports.svg"
                  size="8px"
                  color={'var(--Text-800)'}
                  className={`flex-shrink-0 ${styles.arrowIcon} ${styles.arrowIconDirect}`}
                />
              </div>
            )}
          </button>

          {item.homeId === Number(SidebarMenuId.MY_BETTING) && (
            <div className="mt-8px">
              <div className={styles.line}></div>
            </div>
          )}
        </div>
      );
    });
  }, [expandedMenuId, handleMenuClick, navMenuItems, isSidebarMenuOpen]);
  return (
    // <div
    //   className={clsx({
    //     [styles.sidebarMenuContainer as string]: isSidebarMenuOpen,
    //   })}
    //   // onClick={() => setIsSidebarMenuOpen(false)}
    // >
    <aside
      className={clsx(
        styles.sidebarMenuAnimate,
        { [styles.sidebarMenuClose as string]: !isSidebarMenuOpen },
        'h-full bg-[var(--Background-300)] flex flex-col overflow-hidden shrink-0 pt-12px',
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {/* 顶部切换按钮 */}
      <div className="shrink-0 flex items-center gap-8px h-48px px-12px">
        {/* <Icon
          src="/images/common/menu/mc.svg"
          size="16px"
          color="var(--Text-800)"
          className="flex-shrink-0"
          onClick={() => setIsSidebarMenuOpen((prev) => !prev)}
        /> */}
        {true && (
          <>
            <button
              className={clsx(
                styles.tabSwitchBtn,
                isEntertainmentTabActive
                  ? 'bg-[url(/images/common/menu/main_tab/entertainment_bg.png)] bg-no-repeat bg-center bg-cover text-[var(--White-100)]'
                  : 'bg-[var(--Background-500)] text-[var(--Text-800)]',
              )}
              onClick={() => {
                navigate(generatePath(PATHS.entertainment, { pageType: 'home', id: '' }));
              }}
            >
              <Icon
                src="/images/common/menu/main_tab/entertainment.svg"
                size={18}
                color="currentColor"
                className="flex-shrink-0"
              />
              <span className="_tf[14]">{t('common.entertainmentHallShort')}</span>
            </button>
            <button
              className={clsx(
                styles.tabSwitchBtn,
                sportsActive
                  ? 'bg-[url(/images/common/menu/main_tab/sport_bg.png)] bg-no-repeat bg-center bg-cover text-[var(--White-100)]'
                  : 'bg-[var(--Background-500)] text-[var(--Text-800)]',
              )}
              onClick={handleSportsTabClick}
            >
              <Icon
                src="/images/common/menu/main_tab/sport.svg"
                size={18}
                color="currentColor"
                className="flex-shrink-0"
              />
              <span className="_tf[14]">{t('common.sportsShort')}</span>
            </button>
          </>
        )}
      </div>

      {sportsLeftPanelType === ESportsLeftPanelType.MENU && (
        <div className="mt-12px flex flex-col gap-8px overflow-y-auto self-center">
          {/* 第一组菜单（有二级菜单） */}
          <div className="flex flex-col gap-8px">
            {sportsActive ? (
              <SportsMenu
                key={sportsMenuResetKey}
                isSidebarMenuOpen={isSidebarMenuOpen}
                setIsSidebarMenuOpen={setIsSidebarMenuOpen}
              />
            ) : (
              renderEntertainmentMenu
            )}
          </div>

          {/* 第二组菜单（可选二级菜单） */}
          <div className="flex flex-col gap-8px">
            {menuGroup2.map((item) => {
              const hasChildren = !!item.children?.length;
              const isExpanded = item.path === `/${route?.params?.['*']}`;
              return (
                <React.Fragment key={item.id}>
                  {['sponsorship', 'promotion'].includes(item.id) && (
                    <div className={styles.line}></div>
                  )}

                  <div className="flex flex-col">
                    <button
                      className={clsx(styles.menuButton, {
                        [hasChildren
                          ? (styles.expandedMenuItemActive as string)
                          : (styles.menuItemActive as string)]: isExpanded,
                      })}
                      onClick={() => {
                        if (hasChildren) {
                          if (!isSidebarMenuOpen) setIsSidebarMenuOpen(true);
                          setExpandedGroup2Id(isExpanded ? null : item.id);
                        } else {
                          setExpandedGroup2Id(item.id);
                          navigate(item.path ?? '');
                        }
                      }}
                    >
                      <div className="flex items-center gap-12px flex-1">
                        <Icon
                          src={item.icon}
                          size="16px"
                          style={{
                            backgroundColor: isExpanded
                              ? 'var(--ThemeColor-Main)'
                              : 'var(--Text-800)',
                          }}
                          className="flex-shrink-0"
                        />
                        <span className="flex-1 text-left _tf[14]">{item.label}</span>
                      </div>
                      {hasChildren && (
                        <div className={styles.arrowIconWrapper}>
                          <Icon
                            src="/images/common/arrow_sports.svg"
                            size="8px"
                            color={isExpanded ? 'var(--Text-Main-10)' : 'var(--Text-800)'}
                            className={`flex-shrink-0 ${styles.arrowIcon} ${isExpanded ? styles.arrowIconExpanded : ''}`}
                          />
                        </div>
                      )}
                    </button>

                    {hasChildren && (
                      <div
                        className={`${styles.subMenu} ${isExpanded ? styles.subMenuExpanded : styles.subMenuCollapsed}`}
                      >
                        {item.children!.map((subItem) => (
                          <button
                            key={subItem.id}
                            className={clsx(styles.subMenuItem, {
                              [styles.menuItemActive as string]:
                                subItem.path === `/${route?.params?.['*']}`,
                            })}
                            onClick={() => navigate(subItem.path)}
                          >
                            {subItem.icon && (
                              <Icon
                                src={subItem.icon}
                                size="22.4px"
                                color={
                                  subItem.path === `/${route?.params?.['*']}`
                                    ? 'var(--ThemeColor-Main)'
                                    : 'var(--Text-800)'
                                }
                                className="flex-shrink-0"
                                style={{ height: '16px' }}
                              />
                            )}
                            <span className="flex-1 text-left _tf[14]">{subItem.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
          <div className="flex flex-col gap-8px">
            {menuGroup3.map((item) => {
              const hasChildren = !!item.children?.length;
              const isExpanded = expandedGroup2Id === item.id && isSidebarMenuOpen;
              return (
                <React.Fragment key={item.id}>
                  {['sponsorship', 'promotion'].includes(item.id) && (
                    <div className={styles.line}></div>
                  )}

                  <div className="flex flex-col">
                    <button
                      className={clsx(styles.menuButton, {
                        [hasChildren
                          ? (styles.expandedMenuItemActive as string)
                          : (styles.menuItemActive as string)]: isExpanded,
                      })}
                      onClick={() => {
                        if (item.id === 'onlineCustomerService') {
                          openCustomerService();
                          return;
                        }
                        if (hasChildren) {
                          if (!isSidebarMenuOpen) setIsSidebarMenuOpen(true);
                          setExpandedGroup2Id(isExpanded ? null : item.id);
                        } else {
                          navigate(item.path ?? '');
                          setExpandedGroup2Id(item.id);
                        }
                      }}
                    >
                      <div className="flex items-center gap-12px flex-1">
                        <Icon
                          src={item.icon}
                          size="16px"
                          style={{
                            backgroundColor: isExpanded
                              ? 'var(--ThemeColor-Main)'
                              : 'var(--Text-800)',
                          }}
                          className="flex-shrink-0"
                        />
                        <span className="flex-1 text-left _tf[14]">{item.label}</span>
                      </div>
                      {hasChildren && (
                        <div className={styles.arrowIconWrapper}>
                          <Icon
                            src="/images/common/arrow_sports.svg"
                            size="8px"
                            color={isExpanded ? 'var(--Text-Main-10)' : 'var(--Text-800)'}
                            className={`flex-shrink-0 ${styles.arrowIcon} ${isExpanded ? styles.arrowIconExpanded : ''}`}
                          />
                        </div>
                      )}
                    </button>

                    <ClientOnly>
                      {hasChildren && (
                        <div
                          className={`${styles.subMenu} ${isExpanded ? styles.subMenuExpanded : styles.subMenuCollapsed}`}
                        >
                          {item.children!.map((subItem) => (
                            <button
                              key={subItem.id}
                              className={clsx(styles.subMenuItem, {
                                [styles.menuItemActive as string]:
                                  subItem.path === `/${route?.params?.['*']}`,
                              })}
                              onClick={() => {
                                // navigate(subItem.path);
                                window.open(subItem.path, '_blank');
                              }}
                            >
                              {subItem.icon && (
                                <LazyImage
                                  src={subItem.icon}
                                  width={18}
                                  height={18}
                                  className="flex-shrink-0"
                                />
                              )}
                              <span className="flex-1 text-left _tf[14]">{subItem.label}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </ClientOnly>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
          {/* 底部主题切换 */}

          {isSidebarMenuOpen ? (
            <div className={styles.themeButtonContainer}>
              <button className={'_tf[12]'} onClick={() => setTheme('light')}>
                <Icon
                  src="/images/common/menu/light-mode.svg"
                  size="16px"
                  color="var(--Text-800)"
                  className="flex-shrink-0"
                />
                <span>{t('common.lightMode')}</span>
              </button>
              <button className={'_tf[12]'} onClick={() => setTheme('dark')}>
                <Icon
                  src="/images/common/menu/dark-mode.svg"
                  size="16px"
                  color="var(--Text-800)"
                  className="flex-shrink-0"
                />
                <span>{t('common.darkMode')}</span>
              </button>
            </div>
          ) : (
            <ClientOnly>
              <button
                className={clsx(styles.menuButton)}
                onClick={() => setIsSidebarMenuOpen(true)}
              >
                <div className="flex items-center gap-12px flex-1">
                  <Icon
                    src={`/images/common/menu/${theme}-mode.svg`}
                    size="16px"
                    color="var(--ThemeColor-Main)"
                    className="flex-shrink-0"
                  />
                </div>
              </button>
            </ClientOnly>
          )}
          <ClientOnly>
            <Suspense fallback={null}>
              <PwaInstallDesktopEntry />
            </Suspense>
          </ClientOnly>
        </div>
      )}

      <ClientOnly>
        {sportsLeftPanelType !== ESportsLeftPanelType.MENU && (
          <div className="shrink-0 px-12px mt-8px flex items-center justify-between gap-8px">
            <button
              onClick={() => switchSportsLeftPanelType(ESportsLeftPanelType.MENU)}
              className="flex items-center gap-8px min-w-0"
            >
              <div className="flex items-center justify-center w-24px h-24px rounded-4px bg-[var(--ThemeColor-Main)] shrink-0">
                <BackMenuArrowSvg className="w-11px h-10px text-[var(--White-100)]" />
              </div>
              <span className="_tf[12] font-medium leading-[1.33] text-[var(--Text-Main-10)]">
                返回导航
              </span>
            </button>
            {!!isLogin && sportsLeftPanelType === ESportsLeftPanelType.ORDER_CART && (
              <OneClickTransferButton />
            )}
          </div>
        )}
        <Suspense fallback={null}>
          <Bet />
        </Suspense>
        {sportsLeftPanelType === ESportsLeftPanelType.BET_HISTORY ? (
          <Suspense fallback={null}>
            <BetHistorySidebar />
          </Suspense>
        ) : null}
      </ClientOnly>
    </aside>
    // </div>
  );
};

export default SidebarMenu;

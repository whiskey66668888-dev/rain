import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Icon from '@/common/components/Icon';
import LazyImage from '@/common/components/LazyImage';
// import { NoticeBar } from '@/common/components/NoticeBar';
import { useAppSelector } from '@/core/store/hooks';
import {
  ENTERTAINMENT_HOME_PAGE_TYPE,
  ENTERTAINMENT_MENU_ID,
  // HomeListId,
} from '@/utils/constants/entertainment';
import { MergedBaseList, useHomeList } from '@/common/hooks/useHomeList';

import { communityData } from '@/sites/op7/components/home/constants';
import { openWarmTipDialog } from '@/sites/op7/components/CommonDialog/openWarmTipDialog';
import styles from './HomePage.module.scss';

import { checkIp2Req } from '@/apis/origin/login';
import { isMainlandChinaIp } from '@/sites/op7/utils/ipRegion';

import NavBarMenu from '../../components/NavbarMenu';
import SportsCard from '../../components/SportsCard';

import { useVenueService } from '@/apis/commonSports';
import clsx from 'clsx';
import { HomeListSwitch } from '@/apis/origin/homeList';
import { useEntertainmentHooks } from '@/common/hooks/useEntertainmentHooks';
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import { PATHS } from '@/sites/op7/routes/paths';
import HorizontalScrollSection from '../LandingPage/components/HorizontalScrollSection';
import { useAppDispatch } from '@/core/store/hooks';
import { setExpandedMenuId } from '@/core/store/slices/entertainmentSlice';
import { useParams } from 'react-router-dom';
import SlotGame from './components/SlotGame';
import HomeTopCarouselBanner from '../../components/HomeTopCarouselBanner';
import VenueMaintenanceMask from '@/sites/op7/components/VenueMaintenanceMask';
// import { useGameSlotListQuery } from '@/apis/origin/gamePlay';
import GamePage from '../GamePage';
import HomePartnersSection from '@/sites/op7/components/home/HomePartnersSection';
import HomeGameProvidersSection from '@/sites/op7/components/home/HomeGameProvidersSection';
import { scrollToSportsPageMainAreaIfNeeded } from '@/utils';

const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { homeList } = useHomeList();
  const { handleGameHomeClick } = useEntertainmentHooks();
  // const { handleOpenGame } = useEntertainmentHooks();
  const navigate = useNavigateWithLanguage();
  const { t } = useTranslation();
  const expandedMenuId = useAppSelector((state) => state.entertainment.expandedMenuId);
  const currentGameInfo = useAppSelector((state) => state.entertainment.currentGameInfo);
  const isLogin = useAppSelector((state) => state.user.userInfo.isLogin);
  const prevExpandedMenuIdRef = useRef<number>(expandedMenuId);
  const [isResetAnimation, setIsResetAnimation] = useState(false);
  const [isMainlandChina, setIsMainlandChina] = useState<boolean | null>(null);
  const { pageType, id } = useParams<{ pageType: ENTERTAINMENT_HOME_PAGE_TYPE; id: string }>();
  // // 热门游戏
  // const { data: hotGameSlotList } = useGameSlotListQuery({
  //   clType: 'hot',
  //   displaySize: 20,
  //   pageNumber: 1,
  //   pageSize: 20,
  // });
  // // 最近游戏（登陆后才请求）
  // const { data: recentGameSlotList, refetch: refetchRecentGameSlotList } = useGameSlotListQuery(
  //   {
  //     clType: 'recent',
  //     displaySize: 20,
  //     pageNumber: 1,
  //     pageSize: 20,
  //   },
  //   { enabled: isLogin, suspense: false },
  // );
  // 最新游戏
  // const { data: newGameSlotList } = useGameSlotListQuery({
  //   clType: 'new',
  //   displaySize: 20,
  //   pageNumber: 1,
  //   pageSize: 20,
  // });
  const { data: popularEventsLiveList = [] } = useVenueService().useGetRecommendMatchQuery({
    current: 1,
    type: 1,
    size: 20,
  });

  useEffect(() => {
    let alive = true;
    checkIp2Req()
      .then((res) => {
        if (!alive) return;
        setIsMainlandChina(isMainlandChinaIp(res?.data));
      })
      .catch(() => {
        if (!alive) return;
        setIsMainlandChina(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const handleCommunityClick = useCallback(
    async (url: string) => {
      let isMainland = isMainlandChina;
      if (isMainland === null) {
        try {
          const res = await checkIp2Req();
          isMainland = isMainlandChinaIp(res?.data);
          setIsMainlandChina(isMainland);
        } catch {
          isMainland = false;
          setIsMainlandChina(false);
        }
      }

      if (isMainland) {
        openWarmTipDialog({
          title: t('common.communityVpnModalTitle'),
          content: t('common.communityVpnModalContent'),
          confirmText: t('common.communityVpnModalConfirm'),
        });
        return;
      }

      window.open(url, '_blank');
    },
    [isMainlandChina, t],
  );
  const hasPopularEvents = popularEventsLiveList.length > 0;

  // const recentOrHotGameSlotList = useMemo(() => {
  //   // 如果登陆后最近游戏有数据，则返回最近游戏，否则返回热门游戏
  //   const hasRecentGame = isLogin && recentGameSlotList && recentGameSlotList?.gameList.length > 0;
  //   return {
  //     gameList: hasRecentGame ? recentGameSlotList.gameList : (hotGameSlotList?.gameList ?? []),
  //     lable: hasRecentGame ? '最近游戏' : '热门游戏',
  //   };
  // }, [isLogin, recentGameSlotList, hotGameSlotList]);

  const isHomeMenu = useMemo(() => {
    return expandedMenuId === ENTERTAINMENT_MENU_ID;
  }, [expandedMenuId]);

  const showMenuCards = useCallback(
    // pc&h5主列表特殊差异处理，通过样式控制兼容响应式以及ssr
    // 在选中某一项场馆时，pc端只是左侧菜单展开下拉，在h5端时主列表不展示，只有选中娱乐大厅时才展示主列表
    (item: MergedBaseList) => {
      return isHomeMenu || expandedMenuId === item.homeId;
    },
    [isHomeMenu, expandedMenuId],
  );
  useEffect(() => {
    if (
      (prevExpandedMenuIdRef.current === ENTERTAINMENT_MENU_ID &&
        expandedMenuId !== ENTERTAINMENT_MENU_ID) ||
      (expandedMenuId === ENTERTAINMENT_MENU_ID &&
        prevExpandedMenuIdRef.current !== ENTERTAINMENT_MENU_ID)
    ) {
      // 从大厅切换到具体的场馆时/或者从具体场馆切换到大厅时，需要强制触发重新加载动画
      setIsResetAnimation(true);
      setTimeout(() => {
        setIsResetAnimation(false);
      }, 100);
    }
    prevExpandedMenuIdRef.current = expandedMenuId;
  }, [expandedMenuId]);
  return (
    <section className={`${styles.homePage} base-main-background`}>
      <div className={`lg:max-w-1200px w-full mx-auto`}>
        {!currentGameInfo && (
          <div className={styles.topArea}>
            <HomeTopCarouselBanner className={styles.carouselBanner} />
            {/* {!isMobile && (
              <NoticeBar
                items={noticeList.map((notice) => {
                  const content = (notice.contentTitle ?? '').replace(/[\n\t\r]+/g, '');
                  return `${notice.title}${content ? `: ${content}` : ''}`;
                })}
                icon="/images/common/notice.svg"
                className="pl-12px pr-12px color-[var(--Text-Main-10)]"
                speed={50}
                iconColor="var(--Text-800)"
                itemClick={(_item, index) => {
                  setNoticeBarOpenIndex(index);
                }}
              />
            )} */}
          </div>
        )}
        <div className={styles.mainArea} id="sports-page-main-area">
          {/* 主体区域上半部分 */}
          {!currentGameInfo && <NavBarMenu />}
          <div className={styles.mainAreaTop}>
            {pageType === ENTERTAINMENT_HOME_PAGE_TYPE.SLOT_GAME && !currentGameInfo && (
              <SlotGame venueId={Number(id)} />
            )}
            {pageType === ENTERTAINMENT_HOME_PAGE_TYPE.HOME && !currentGameInfo && (
              <>
                {/* {recentOrHotGameSlotList.gameList.length > 0 && (
                  // 最近游戏或热门游戏
                  <HorizontalScrollSection
                    title={recentOrHotGameSlotList.lable}
                    icon={
                      <Icon
                        size="18px"
                        color="var(--ThemeColor-Main)"
                        src="/images/common/menu/sports/hot.svg"
                      />
                    }
                    className={clsx({
                      [styles.cardWrapper as string]: true,
                      [styles.menuCards as string]: true,
                      [styles.showMenuCards as string]: isHomeMenu,
                      [styles.resetAnimation as string]: isResetAnimation,
                    })}
                    viewAllText="全部"
                    onViewAll={() => dispatch(setExpandedMenuId(HomeListId.SLOTS))}
                  >
                    {recentOrHotGameSlotList.gameList.map((item, index: number) => (
                      <div
                        className={styles.smallCardContent}
                        key={index}
                        onClick={() => handleOpenGame(item, false)}
                      >
                        <LazyImage className="w-full h-full" src={item.imageUrl} />
                      </div>
                    ))}
                  </HorizontalScrollSection>
                )} */}

                {/* 主列表（联动菜单） */}
                {homeList.map((item) => {
                  const isShowMenuCards = showMenuCards(item);
                  const isCurrentItem = expandedMenuId === item.homeId;
                  return (
                    <HorizontalScrollSection
                      className={clsx({
                        [styles.cardWrapper as string]: true,
                        [styles.menuCards as string]: true,
                        [styles.showMenuCards as string]: isShowMenuCards,
                        [styles.resetAnimation as string]: isResetAnimation,
                        [styles.currentItemActive as string]: isCurrentItem,
                      })}
                      title={item.label}
                      labelList={item.promotionList}
                      icon={<Icon size="18px" color="var(--ThemeColor-Main)" src={item.icon} />}
                      viewAllText="全部"
                      listClassName={styles.cardContent}
                      viewNav={false}
                      listItemClassName={styles.cardItemWrapper}
                      key={item.homeId}
                      onViewAll={
                        !isCurrentItem
                          ? () => {
                              dispatch(setExpandedMenuId(item.homeId));
                              scrollToSportsPageMainAreaIfNeeded();
                            }
                          : undefined
                      }
                    >
                      {/* 主列表（联动菜单） */}
                      {/* 过滤试玩场馆不在主页展示（试玩场馆在菜单栏中展示） */}
                      {item.children
                        .filter((child) => !child.isTryPlay)
                        .map((child) => {
                          const hasMaintenanceNotice = Boolean(child.maintenanceDesc?.trim());
                          const normalizedSwitch = String(child.switch) as HomeListSwitch;
                          const isNormalWithNotice =
                            normalizedSwitch === HomeListSwitch.NORMAL && hasMaintenanceNotice;

                          const shouldShowMask =
                            (normalizedSwitch !== HomeListSwitch.NORMAL || hasMaintenanceNotice) &&
                            isLogin;
                          return (
                            <div
                              className={`${styles.cardItem} ${styles[`gameId-${child.gameId}`]} flex-shrink-0`}
                              key={child.gameId}
                              onClick={() => handleGameHomeClick(child, item.homeId)}
                            >
                              {shouldShowMask && (
                                <VenueMaintenanceMask
                                  className={
                                    isNormalWithNotice
                                      ? styles.maintenanceNotice
                                      : styles.maintenance
                                  }
                                  switch={child.switch}
                                  maintenanceDesc={child.maintenanceDesc}
                                />
                              )}
                              {/* <div
                              className={clsx(
                                styles.cardItemTitle,
                                isMobile && styles[`name-${item.homeId}`],
                              )}
                            >
                              <p className="_tf[16]">{child.name}</p>
                            </div> */}
                              {!shouldShowMask && (
                                <div className={styles.hover}>
                                  <LazyImage lazy={false} src={'/images/common/play.png'} />
                                </div>
                              )}
                              <LazyImage className={clsx(styles.cardImage)} src={child.cardImage} />
                            </div>
                          );
                        })}
                    </HorizontalScrollSection>
                  );
                })}
                {/* 最新游戏 */}
                {/* {newGameSlotList && newGameSlotList?.gameList?.length > 0 && (
                  <HorizontalScrollSection
                    title={'最新游戏'}
                    icon={
                      <Icon
                        size="18px"
                        color="var(--ThemeColor-Main)"
                        src="/images/common/menu/sports/new.svg"
                      />
                    }
                    className={clsx({
                      [styles.cardWrapper as string]: true,
                      [styles.menuCards as string]: true,
                      [styles.showMenuCards as string]: isHomeMenu,
                      [styles.resetAnimation as string]: isResetAnimation,
                    })}
                    viewAllText="全部"
                    onViewAll={() => dispatch(setExpandedMenuId(HomeListId.SLOTS))}
                  >
                    {newGameSlotList?.gameList.map((item, index: number) => (
                      <div
                        className={styles.smallCardContent}
                        key={index}
                        onClick={() => handleOpenGame(item, false)}
                      >
                        <LazyImage className="w-full h-full" src={item.imageUrl} />
                      </div>
                    ))}
                  </HorizontalScrollSection>
                )} */}
              </>
            )}
          </div>
          {currentGameInfo && (
            <GamePage
            // refetchRecentGameSlotList={() => {
            //   refetchRecentGameSlotList();
            // }}
            />
          )}

          {/* 推荐赛事 */}
          {hasPopularEvents && (
            <HorizontalScrollSection
              listClassName="!gap-12px"
              title={t('common.recommendedEvents')}
              icon={
                <Icon
                  size="18px"
                  color="var(--ThemeColor-Main)"
                  src="/images/common/recommend.svg"
                />
              }
              className={clsx(styles.cardWrapper, 'mb-16px')}
              viewAllText="全部"
              onViewAll={() => navigate(PATHS.sports)}
            >
              {popularEventsLiveList.map((matchInfo, index: number) => (
                <div className="h-154px w-351px" key={index}>
                  <SportsCard matchInfo={matchInfo} type="bigCard" />
                </div>
              ))}
            </HorizontalScrollSection>
          )}
          <div className="mt-12px">
            <HomePartnersSection />
          </div>
          {/* 社区：始终展示；大陆 IP 点击时弹窗提示 */}
          <section className={clsx(styles.cardWrapper, 'pl-12px pr-12px mb-12px')}>
            <div className={styles.cardTitle}>
              <Icon size="18px" color="var(--ThemeColor-Main)" src="/images/common/community.svg" />
              <p className="_tf[14]">{t('common.op7Community')}</p>
            </div>
            <ul className={clsx(styles.cardContent, styles.cardContent2)}>
              {communityData.map((community, index) => (
                <li
                  className={styles.communityCard}
                  key={index}
                  onClick={() => void handleCommunityClick(community.url)}
                >
                  <LazyImage className="w-32px" src={community.logo} alt={community.name} />
                </li>
              ))}
            </ul>
          </section>
          <div>
            <HomeGameProvidersSection />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomePage;

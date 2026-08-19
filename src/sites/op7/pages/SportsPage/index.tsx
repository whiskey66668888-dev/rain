// 体育页
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';

import Banner from '@/common/components/Banner';
import { NoticeBar } from '@/common/components/NoticeBar';

import MainList from './components/MainList';
import MainChampionList from './components/MainChampionList';
import NavBarMenuH5 from './components/NavbarMenuH5';
import PlayTypePickerH5 from './components/PlayTypePickerH5';
import styles from './SportsPage.module.scss';
import SportsCard from '../../components/SportsCard';
import SearchBarH5 from './components/SearchBarH5';
import MyPullToRefresh from '@/common/components/MyPullToRefresh';

import { useVenueService } from '@/apis/commonSports';
import { EVenue, HotSportId, PlayType } from '@/apis/commonSports/constants';
import { useMatchWinnersQuery } from '@/apis/fbSports/getMatchWinner';
// hooks
import { useAppSelector } from '@/core/store/hooks';
import { useSportsInit } from '@/common/hooks/useSportsInit';
import OptionBarPC from './components/OptionBarPC';
import NavBarMenuPC from './components/NavbarMenuPC';
import { useHomeList } from '@/common/hooks/useHomeList';
import { HomeListId } from '@/utils/constants/entertainment';
import { useEntertainmentHooks } from '@/common/hooks/useEntertainmentHooks';
import { useWebsiteSwitchListQuery } from '@/apis/origin/websiteSwitch';
import { getFollowGameType, useFavorites } from '@/common/hooks/follow';
import SportsMaintenancePage from './components/SportsMaintenancePage';
import GoalToast from '../../components/GoalToast';
import useSportsMainListControl from '@/common/hooks/useSportsMainListControl';

const SportsPage: React.FC = () => {
  const { useNoticeListQuery, useGetRecommendMatchQuery, useGetMainListQuery } = useVenueService();
  const { setHasHotList } = useSportsMainListControl();
  useSportsInit();
  const { data: websiteSwitchList = [] } = useWebsiteSwitchListQuery();
  const fbSwitchItem = useMemo(
    () => websiteSwitchList.find((item) => typeof item?.FB !== 'undefined'),
    [websiteSwitchList],
  );
  const isFBSportsMaintenance = useMemo(
    () => String(fbSwitchItem?.FB ?? '') === '0',
    [fbSwitchItem],
  );
  const { homeList } = useHomeList({ enabled: isFBSportsMaintenance });
  const { handleGameHomeClick } = useEntertainmentHooks();
  const isSimpleOdds = useAppSelector((state) => state.sport.mainList.settings.isSimpleOdds);
  const currentPlayType = useAppSelector((state) => state.sport.mainList.settings.playType);
  const currentPlayTypeId = useAppSelector((state) => state.sport.mainList.settings.playTypeId);
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);
  const venue = useAppSelector((state) => state.sport.venue);
  const isLogin = useAppSelector((state) => state.user.userInfo.isLogin);
  const { data: fbNoticeList = [] } = useNoticeListQuery({ limit: 10 });
  const { playType } = useAppSelector((state) => state.sport.mainList.settings);
  const isH5 = useMemo(() => screenBreakpoint === 'md', [screenBreakpoint]);
  const [isTopH5Sticky, setIsTopH5Sticky] = useState(false);
  const topAreaH5Ref = useRef<HTMLDivElement>(null);
  const isTopH5StickyRef = useRef(false);
  const queryClient = useQueryClient();
  const handleRefresh = async () => {
    if (venue === EVenue.FB) {
      await queryClient.invalidateQueries({ queryKey: ['fb', 'match', 'getList'] });
    } else {
      await queryClient.invalidateQueries({ queryKey: ['ob', 'match', 'getList'] });
    }
  };

  const { data: bannerListByPopularEventsLive = [] } = useGetRecommendMatchQuery({
    current: 1,
    type: 1,
    size: 20,
  });
  // FB 热门球种探测；OB 菜单不注入热门，无需请求
  const { data: hotListData } = useGetMainListQuery(
    {
      size: 5,
      sportId: HotSportId,
      type: currentPlayTypeId ?? undefined,
    },
    {
      enabled: venue === EVenue.FB && currentPlayType !== PlayType.Follow,
    },
  );

  useEffect(() => {
    if (venue !== EVenue.FB) {
      setHasHotList(false);
      return;
    }
    setHasHotList(!!hotListData?.pages?.[0]?.length && hotListData.pages[0].length > 0);
  }, [venue, hotListData, setHasHotList]);

  useFavorites({ gameType: getFollowGameType(venue) });

  useEffect(() => {
    if (!isH5) {
      topAreaH5Ref.current?.style.setProperty('--sports-top-opacity', '1');
      setIsTopH5Sticky(false);
      return;
    }
    const scrollEl = document.getElementById('layout-main-content');
    if (!scrollEl) return;
    const MAX_FADE_DISTANCE = 140;
    const MIN_OPACITY = 0;
    let rafId = 0;
    const syncTopAreaState = () => {
      rafId = 0;
      const scrollTop = Math.max(0, scrollEl.scrollTop);
      const progress = Math.min(scrollTop / MAX_FADE_DISTANCE, 1);
      const nextOpacity = 1 - progress * (1 - MIN_OPACITY);
      topAreaH5Ref.current?.style.setProperty('--sports-top-opacity', nextOpacity.toFixed(3));

      const stickyTopEl = document.getElementById('sports-page-main-area-top-h5');
      if (!stickyTopEl) return;
      const scrollRectTop = scrollEl.getBoundingClientRect().top;
      const paddingTop = Number.parseFloat(getComputedStyle(scrollEl).paddingTop) || 0;
      const stickyTop = scrollRectTop + paddingTop;
      const nextSticky = stickyTopEl.getBoundingClientRect().top <= stickyTop + 0.5;
      if (nextSticky !== isTopH5StickyRef.current) {
        isTopH5StickyRef.current = nextSticky;
        setIsTopH5Sticky(nextSticky);
      }
    };
    const onScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(syncTopAreaState);
    };
    syncTopAreaState();
    scrollEl.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      scrollEl.removeEventListener('scroll', onScroll);
    };
  }, [isH5]);

  const sortedBannerListByPopularEventsLive = useMemo(() => {
    return [...bannerListByPopularEventsLive].sort((a, b) => Number(a.bt ?? 0) - Number(b.bt ?? 0));
  }, [bannerListByPopularEventsLive]);
  const sportsContentKey = `${playType}-${currentPlayTypeId ?? 'all'}-${isSimpleOdds ? 'simple' : 'full'}`;

  // 队名加粗：对齐主列表 / App，优先用初盘 winner；后端未返回时保留 format 本地结果
  const bannerMatchIds = useMemo(
    () => sortedBannerListByPopularEventsLive.map((item) => item.matchId),
    [sortedBannerListByPopularEventsLive],
  );
  const bannerMatchWinners = useMatchWinnersQuery(
    bannerMatchIds,
    venue === EVenue.OB ? 'OB' : 'FB',
  );
  const bannerListWithNameBold = useMemo(
    () =>
      sortedBannerListByPopularEventsLive.map((item) => {
        const winner = bannerMatchWinners[String(item.matchId)];
        return winner ? { ...item, nameBold: winner } : item;
      }),
    [sortedBannerListByPopularEventsLive, bannerMatchWinners],
  );

  const sportsSection = useMemo(
    () => homeList.find((item) => Number(item.homeId) === Number(HomeListId.SPORTS)),
    [homeList],
  );
  return (
    <section className="base-main-background">
      <div className={styles.sportsPage}>
        {isFBSportsMaintenance ? (
          <SportsMaintenancePage
            sportsSection={sportsSection}
            isLogin={isLogin}
            onVenueClick={(venue) => handleGameHomeClick(venue, HomeListId.SPORTS)}
          />
        ) : (
          <>
            <div ref={topAreaH5Ref} className={styles.topAreaH5}>
              <Banner
                items={bannerListWithNameBold.map((banner, index) => (
                  <SportsCard key={index} matchInfo={banner} type="smallCard" />
                ))}
                itemWidth={351}
                itemHeight={120}
                gap={10}
                autoplayInterval={3000}
                showDots={true}
              />
            </div>
            <div className={styles.mainArea} id="sports-page-main-area">
              <div
                id="sports-page-main-area-top-h5"
                className={clsx(styles.mainAreaTopH5, isTopH5Sticky && styles.mainAreaTopH5Sticky)}
              >
                <PlayTypePickerH5 />
                <NavBarMenuH5 />
                <SearchBarH5 />
              </div>
              <div className={styles.mainAreaTopPC}>
                <div className={styles.topAreaPC}>
                  <OptionBarPC />
                  <NoticeBar
                    className={styles.noticeBar}
                    items={fbNoticeList.map((notice) => notice.co)}
                    icon="/images/common/notice.svg"
                    speed={50}
                    iconColor="var(--Text-800)"
                    itemClick={(item, index) => {
                      console.log('NoticeBar clicked:', item, index);
                    }}
                  />
                </div>
                <NavBarMenuPC />
              </div>
              {isH5 ? (
                <MyPullToRefresh onRefresh={handleRefresh}>
                  <div key={sportsContentKey} className={styles.listTransition}>
                    {playType === PlayType.Champion ? (
                      <MainChampionList />
                    ) : (
                      <MainList isSimpleOdds={isSimpleOdds && isH5} />
                    )}
                  </div>
                </MyPullToRefresh>
              ) : playType === PlayType.Champion ? (
                <div key={sportsContentKey} className={styles.listTransition}>
                  <MainChampionList />
                </div>
              ) : (
                <div key={sportsContentKey} className={styles.listTransition}>
                  <MainList isSimpleOdds={isSimpleOdds && isH5} />
                </div>
              )}
            </div>
          </>
        )}
        <GoalToast />
        {/* <section className={'flex gap-4 flex-col'}>
        <h3>FB接口赛事列表数据 ({getListData.records.length})</h3>
        <ul>
          {getListData.records.map((match) => (
            <li key={match.id}>{match.nm}</li>
          ))}
        </ul>
      </section> */}
      </div>
    </section>
  );
};

export default SportsPage;

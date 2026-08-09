// 体育页
import React, { useEffect, useMemo, useState } from 'react';
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
import { HotSportId, PlayType } from '@/apis/commonSports/constants';
// hooks
import { useAppSelector } from '@/core/store/hooks';
import { useSportsInit } from '@/common/hooks/useSportsInit';
import OptionBarPC from './components/OptionBarPC';
import NavBarMenuPC from './components/NavbarMenuPC';
import { useHomeList } from '@/common/hooks/useHomeList';
import { HomeListId } from '@/utils/constants/entertainment';
import { useEntertainmentHooks } from '@/common/hooks/useEntertainmentHooks';
import { useWebsiteSwitchListQuery } from '@/apis/origin/websiteSwitch';
import { useFavorites } from '@/common/hooks/follow';
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
  const isLogin = useAppSelector((state) => state.user.userInfo.isLogin);
  const { data: fbNoticeList = [] } = useNoticeListQuery({ limit: 10 });
  const { playType } = useAppSelector((state) => state.sport.mainList.settings);
  const isH5 = useMemo(() => screenBreakpoint === 'md', [screenBreakpoint]);
  const [topAreaOpacity, setTopAreaOpacity] = useState(1);
  const [isTopH5Sticky, setIsTopH5Sticky] = useState(false);
  const queryClient = useQueryClient();
  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['fb', 'match', 'getList'] });
  };

  const { data: bannerListByPopularEventsLive = [] } = useGetRecommendMatchQuery({
    current: 1,
    type: 1,
    size: 20,
  });
  // 固定获取热门赛事列表，如果没有一条数据就不展示热门
  const { data: hotListData } = useGetMainListQuery(
    {
      size: 5,
      sportId: HotSportId,
      type: currentPlayTypeId ?? undefined,
    },
    {
      enabled: currentPlayType !== PlayType.Follow,
    },
  );

  useEffect(() => {
    setHasHotList(!!hotListData?.pages?.[0]?.length && hotListData.pages[0].length > 0);
  }, [hotListData, setHasHotList]);

  // 关注（v2）三端同步：登录后/进入关注 tab 从服务器拉取列表回填，游客→登录时同步本地收藏
  useFavorites({ gameType: 'FB' });

  useEffect(() => {
    if (!isH5) {
      setTopAreaOpacity(1);
      setIsTopH5Sticky(false);
      return;
    }
    const scrollEl = document.getElementById('layout-main-content');
    if (!scrollEl) return;
    const MAX_FADE_DISTANCE = 140;
    const MIN_OPACITY = 0;
    const onScroll = () => {
      const scrollTop = Math.max(0, scrollEl.scrollTop);
      const progress = Math.min(scrollTop / MAX_FADE_DISTANCE, 1);
      setTopAreaOpacity(1 - progress * (1 - MIN_OPACITY));

      const stickyTopEl = document.getElementById('sports-page-main-area-top-h5');
      if (!stickyTopEl) return;
      const scrollRectTop = scrollEl.getBoundingClientRect().top;
      const paddingTop = Number.parseFloat(getComputedStyle(scrollEl).paddingTop) || 0;
      const stickyTop = scrollRectTop + paddingTop;
      setIsTopH5Sticky(stickyTopEl.getBoundingClientRect().top <= stickyTop + 0.5);
    };
    onScroll();
    scrollEl.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      scrollEl.removeEventListener('scroll', onScroll);
    };
  }, [isH5]);

  const sortedBannerListByPopularEventsLive = useMemo(() => {
    return [...bannerListByPopularEventsLive].sort((a, b) => Number(a.bt ?? 0) - Number(b.bt ?? 0));
  }, [bannerListByPopularEventsLive]);
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
            <div className={styles.topAreaH5} style={{ opacity: topAreaOpacity }}>
              <Banner
                items={sortedBannerListByPopularEventsLive.map((banner, index) => (
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
                  {playType === PlayType.Champion ? (
                    <MainChampionList />
                  ) : (
                    <MainList isSimpleOdds={isSimpleOdds && isH5} />
                  )}
                </MyPullToRefresh>
              ) : playType === PlayType.Champion ? (
                <MainChampionList />
              ) : (
                <MainList isSimpleOdds={isSimpleOdds && isH5} />
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

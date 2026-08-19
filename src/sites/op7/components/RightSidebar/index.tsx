import clsx from 'clsx';
import _ from 'lodash';
import React, {
  lazy,
  memo,
  Suspense,
  useCallback,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import Advertise from './Advertise';
import { ClientOnly } from '@/common/components/ClientOnly';
import styles from './RightSidebar.module.scss';
import { setRightSidebarVisible } from '@/core/store/slices/configSlice';
import { useLocation, useParams } from 'react-router-dom';
import SportsDetailsSidebarMatchList from './SportsDetailsSidebarMatchList';
import { PlayType, EVenue } from '@/apis/commonSports/constants';
import { FBSportIdValue, MatchPlayType } from '@/apis/fbSports/common/constants';
import { useVenueService } from '@/apis/commonSports';
import type { MatchBaseInfo } from '@/apis/commonSports/types';

import {
  getFirstMatchFromListData,
  getFirstMatchIdFromListData,
  useSportsMainListData,
} from '@/common/hooks/useSportsMainListData';
import Skeleton from '@/common/components/Skeleton';
import Empty from '@/common/components/Empty';
import { useGetMatchDetailQuery } from '@/apis/fbSports/getMatchDetail';
import { useGetOBMatchDetailQuery } from '@/apis/obSports/getMatchDetail';
import { formatFBSportItem } from '@/apis/fbSports/common/fbFormat';
import { useWebsiteSwitchListQuery } from '@/apis/origin/websiteSwitch';
import { useRetainedMatchRecord } from '@/sites/op7/pages/SportsDetailsPage/hooks/useRetainedMatchRecord';
import VideoPlayerWeb from '../VideoPlayerWeb';

const SportDetail = lazy(() => import('../../pages/SportsDetailsPage'));
const MessageCenter = lazy(() => import('../../pages/MessageCenter'));

// PC端右侧边栏，一定不是mobile
const RightSidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const messageCenterVisible = useAppSelector((state) => state.messageCenter.messageCenterVisible);
  const rightSidebarVisible = useAppSelector((state) => state.config.rightSidebarVisible);
  const [sidebarClosing, setSidebarClosing] = useState(false);
  const venue = useAppSelector((state) => state.sport.venue);
  const isOb = venue === EVenue.OB;

  const closeRightSidebar = useCallback(() => {
    if (!rightSidebarVisible) return;
    setSidebarClosing(true);
  }, [rightSidebarVisible]);
  const isMobile = useAppSelector((state) => state.config.isMobile);
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);
  const currentPlayType = useAppSelector((state) => state.sport.mainList.settings.playType);
  const currentOrderBy = useAppSelector((state) => state.sport.mainList.settings.orderBy);
  const currentFilterByLeagueIds = useAppSelector(
    (state) => state.sport.mainList.settings.filterByLeagueIds,
  );
  const pinnedMatchs = useAppSelector((state) => state.sport.mainList.datas.pinnedMatchs);
  // const showBetDrawer = useAppSelector((state) => state.bet[state.sport.venue].showBetDrawer);
  const { matchId: routeMatchId } = useParams<{ matchId: string }>();
  // const handle = useHandle();
  const location = useLocation();
  const { data: websiteSwitchList = [] } = useWebsiteSwitchListQuery();
  const fbSwitchItem = useMemo(
    () => websiteSwitchList.find((item) => typeof item?.FB !== 'undefined'),
    [websiteSwitchList],
  );
  const isFBSportsMaintenance = useMemo(
    () => String(fbSwitchItem?.FB ?? '') === '0',
    [fbSwitchItem],
  );
  // FB 维护只影响 FB 场馆，OB 详情/视频不受影响
  const { listData, isLoading: sportsListLoading } = useSportsMainListData();
  const showSportsDetailsMatchList = useMemo(() => {
    if (isMobile) return false;
    return location.pathname.includes('/SportsDetailsPage/');
  }, [isMobile, location.pathname]);
  /** PC 端 /sports 首页右侧栏展示赛事详情，id 取主列表第一场 */
  const showSportsHomeSidebarDetail = useMemo(() => {
    if (isMobile) return false;
    if (location.pathname.includes('/SportsDetailsPage/')) return false;
    return location.pathname.includes('/sports');
  }, [isMobile, location.pathname]);
  const firstSportsMatchId = useMemo(() => getFirstMatchIdFromListData(listData), [listData]);
  const firstSportsMatch = useMemo(() => getFirstMatchFromListData(listData), [listData]);
  const shouldUseLiveForFollow = useMemo(
    () => showSportsHomeSidebarDetail && currentPlayType === PlayType.Follow,
    [showSportsHomeSidebarDetail, currentPlayType],
  );
  const useLiveFirstMatchForHomeSidebar =
    showSportsHomeSidebarDetail &&
    (currentPlayType === PlayType.Champion || shouldUseLiveForFollow);
  const { useGetMainListQuery } = useVenueService();
  const liveSidebarListQuery = useGetMainListQuery(
    {
      size: 50,
      sportId: FBSportIdValue.Football,
      type: MatchPlayType.LIVE,
      orderBy: currentOrderBy,
      ...(currentFilterByLeagueIds.length > 0 ? { leagueIds: currentFilterByLeagueIds } : {}),
    },
    {
      enabled: useLiveFirstMatchForHomeSidebar,
    },
  );
  /** 滚球无数据时，右侧详情回退为「今日」第一条 */
  const todaySidebarListQuery = useGetMainListQuery(
    {
      size: 50,
      sportId: FBSportIdValue.Football,
      type: MatchPlayType.TODAY,
      orderBy: currentOrderBy,
      ...(currentFilterByLeagueIds.length > 0 ? { leagueIds: currentFilterByLeagueIds } : {}),
    },
    {
      enabled: useLiveFirstMatchForHomeSidebar,
    },
  );

  const pickFirstMatchWithPinned = useCallback(
    (flatList: MatchBaseInfo[], playTypeFilter: PlayType.Living | PlayType.Today) => {
      if (flatList.length === 0) return undefined;

      const pinnedIds = pinnedMatchs
        .filter(
          (item) =>
            Number(item.sportId) === Number(FBSportIdValue.Football) &&
            String(item.playType) === String(playTypeFilter),
        )
        .map((item) => item.matchId);

      const [pinnedSubset, normalList] = _.partition(flatList, (item) =>
        pinnedIds.includes(item.matchId),
      );

      const sortedPinned = _.orderBy(
        pinnedSubset,
        (item) => _.indexOf(pinnedIds, item.matchId),
        'desc',
      );

      return sortedPinned[0] ?? normalList[0];
    },
    [pinnedMatchs],
  );

  const firstLiveSidebarMatch = useMemo(() => {
    const liveList = liveSidebarListQuery.data?.pages?.flat() ?? [];
    return pickFirstMatchWithPinned(liveList, PlayType.Living);
  }, [liveSidebarListQuery.data, pickFirstMatchWithPinned]);

  const firstTodaySidebarMatch = useMemo(() => {
    const todayList = todaySidebarListQuery.data?.pages?.flat() ?? [];
    return pickFirstMatchWithPinned(todayList, PlayType.Today);
  }, [todaySidebarListQuery.data, pickFirstMatchWithPinned]);

  /** PC 侧栏首页：优先滚球首条，无滚球则用今日首条 */
  const sidebarHomePrimaryMatch = useMemo(
    () => firstLiveSidebarMatch ?? firstTodaySidebarMatch,
    [firstLiveSidebarMatch, firstTodaySidebarMatch],
  );
  const sidebarHomePrimaryMatchId = sidebarHomePrimaryMatch?.matchId;
  const detailMatchId =
    showSportsDetailsMatchList && routeMatchId && Number(routeMatchId) > 0
      ? Number(routeMatchId)
      : -1;
  const { data: currentDetailMatchRaw } = useGetMatchDetailQuery({
    matchId: detailMatchId > 0 ? String(detailMatchId) : '',
  });
  const { data: obCurrentDetail } = useGetOBMatchDetailQuery({
    matchId: isOb && showSportsDetailsMatchList && routeMatchId ? routeMatchId : '',
    enabled: isOb && showSportsDetailsMatchList && !!routeMatchId,
  });
  /** 完赛后详情接口可能无数据：侧栏比分板与详情页同口径本地保留，离开详情路由后随 matchId 清理 */
  const currentDetailMatch = useRetainedMatchRecord(detailMatchId, currentDetailMatchRaw);
  /** 列表第一条只有 MatchBaseInfo；比分条/视频需详情 MatchRecord，故首页侧栏单独拉详情 */
  const homeSidebarMatchId = useLiveFirstMatchForHomeSidebar
    ? sidebarHomePrimaryMatchId
    : firstSportsMatchId;
  const { data: sportsHomeDetailMatch } = useGetMatchDetailQuery({
    matchId: !isOb && showSportsHomeSidebarDetail && homeSidebarMatchId ? homeSidebarMatchId : '',
  });
  const { data: obHomeDetail } = useGetOBMatchDetailQuery({
    matchId:
      isOb && showSportsHomeSidebarDetail && homeSidebarMatchId != null
        ? String(homeSidebarMatchId)
        : '',
    enabled: isOb && showSportsHomeSidebarDetail && homeSidebarMatchId != null,
  });

  const scoreboardMatch = useMemo(() => {
    if (showSportsDetailsMatchList) {
      if (isOb) {
        return routeMatchId ? { matchId: routeMatchId } : undefined;
      }
      return currentDetailMatch;
    }
    if (showSportsHomeSidebarDetail) {
      if (isOb) {
        if (obHomeDetail?.matchInfo?.matchId) {
          return { matchId: String(obHomeDetail.matchInfo.matchId) };
        }
        const fallback = useLiveFirstMatchForHomeSidebar
          ? sidebarHomePrimaryMatch
          : firstSportsMatch;
        return fallback ? { matchId: String(fallback.matchId) } : undefined;
      }
      if (sportsHomeDetailMatch?.id) return sportsHomeDetailMatch;
      return useLiveFirstMatchForHomeSidebar ? sidebarHomePrimaryMatch : firstSportsMatch;
    }
    return undefined;
  }, [
    showSportsDetailsMatchList,
    isOb,
    routeMatchId,
    currentDetailMatch,
    showSportsHomeSidebarDetail,
    obHomeDetail?.matchInfo?.matchId,
    sportsHomeDetailMatch,
    useLiveFirstMatchForHomeSidebar,
    sidebarHomePrimaryMatch,
    firstSportsMatch,
  ]);

  const matchInfo = useMemo(() => {
    if (showSportsDetailsMatchList) {
      if (isOb) {
        const base = obCurrentDetail?.matchInfo;
        if (!base) return undefined;
        return { ...base, matchPeriod: base.periodName ?? base.matchPeriod ?? '' };
      }
      if (!currentDetailMatch) return undefined;
      const base = formatFBSportItem(currentDetailMatch);
      return { ...base, matchPeriod: base.periodName ?? base.matchPeriod ?? '' };
    }
    if (showSportsHomeSidebarDetail) {
      if (isOb) {
        if (obHomeDetail?.matchInfo) {
          const base = obHomeDetail.matchInfo;
          return { ...base, matchPeriod: base.periodName ?? base.matchPeriod ?? '' };
        }
        const fallbackMatch = useLiveFirstMatchForHomeSidebar
          ? sidebarHomePrimaryMatch
          : firstSportsMatch;
        if (fallbackMatch) {
          return {
            ...fallbackMatch,
            matchPeriod: fallbackMatch.periodName ?? fallbackMatch.matchPeriod ?? '',
          };
        }
        return undefined;
      }
      if (sportsHomeDetailMatch?.id) {
        const base = formatFBSportItem(sportsHomeDetailMatch);
        return { ...base, matchPeriod: base.periodName ?? base.matchPeriod ?? '' };
      }
      const fallbackMatch = useLiveFirstMatchForHomeSidebar
        ? sidebarHomePrimaryMatch
        : firstSportsMatch;
      if (fallbackMatch) {
        return {
          ...fallbackMatch,
          matchPeriod: fallbackMatch.periodName ?? fallbackMatch.matchPeriod ?? '',
        };
      }
    }
    return undefined;
  }, [
    showSportsDetailsMatchList,
    showSportsHomeSidebarDetail,
    isOb,
    obCurrentDetail?.matchInfo,
    currentDetailMatch,
    obHomeDetail?.matchInfo,
    sportsHomeDetailMatch,
    useLiveFirstMatchForHomeSidebar,
    sidebarHomePrimaryMatch,
    firstSportsMatch,
  ]);
  // const showInviteFriend = useMemo(() => {
  //   return !isMobile && !messageCenterVisible && (!showBetDrawer || !handle?.showBet);
  // }, [isMobile, messageCenterVisible, showBetDrawer, handle?.showBet]);
  const isH5 = screenBreakpoint === 'md';
  const show = showSportsHomeSidebarDetail || showSportsDetailsMatchList;
  const showAdvertise = !showSportsHomeSidebarDetail && !showSportsDetailsMatchList;
  const sidebarTargetWidth = messageCenterVisible || showAdvertise ? 351 : 391;
  const [sidebarMounted, setSidebarMounted] = useState(rightSidebarVisible);

  useLayoutEffect(() => {
    if (rightSidebarVisible) {
      setSidebarMounted(true);
      setSidebarClosing(false);
    }
  }, [rightSidebarVisible]);

  const handleSidebarTransitionEnd = useCallback(
    (event: React.TransitionEvent<HTMLDivElement>) => {
      if (event.propertyName !== 'transform') return;
      if (sidebarClosing) {
        setSidebarMounted(false);
        setSidebarClosing(false);
        dispatch(setRightSidebarVisible(false));
      }
    },
    [dispatch, sidebarClosing],
  );
  const sidebarShown = rightSidebarVisible && !sidebarClosing;

  return (
    <ClientOnly>
      <div
        className={clsx('h-full', sidebarMounted && styles.rightSidebarContainer)}
        onClick={closeRightSidebar}
      >
        {sidebarMounted ? (
          <div
            onClick={(e) => e.stopPropagation()}
            onTransitionEnd={handleSidebarTransitionEnd}
            className={clsx(
              'h-full flex flex-col shrink-0 overflow-hidden',
              'relative z-[var(--z-right-sidebar)]',
              'bg-[var(--Background-700)]',
              messageCenterVisible && 'shadow-[-2px_0_10px_0_var(--Shadow-400)]',
            )}
            style={{
              width: sidebarTargetWidth,
              transform: sidebarShown ? 'translate3d(0, 0, 0)' : 'translate3d(100%, 0, 0)',
              transition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
              willChange: 'transform',
            }}
          >
            <div className="relative flex-1 min-h-0 overflow-hidden">
              {!messageCenterVisible && showAdvertise ? (
                <Advertise />
              ) : (
                <div className="flex h-full min-h-0 flex-col overflow-hidden">
                  {!isH5 && show && !isFBSportsMaintenance && (
                    <VideoPlayerWeb sourceMatch={scoreboardMatch} matchInfo={matchInfo} />
                  )}
                  {showSportsDetailsMatchList ? (
                    <SportsDetailsSidebarMatchList />
                  ) : showSportsHomeSidebarDetail ? (
                    <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden overflow-x-hidden">
                      {isFBSportsMaintenance ? (
                        <Empty
                          className="flex-1 min-h-0 bg-[var(--Background-300)]"
                          text="暂无数据"
                          variant="card"
                        />
                      ) : sportsListLoading ||
                        (useLiveFirstMatchForHomeSidebar &&
                          (liveSidebarListQuery.isLoading || todaySidebarListQuery.isLoading)) ? (
                        <Skeleton type="sportsDetailsMarkets" />
                      ) : (
                          useLiveFirstMatchForHomeSidebar
                            ? sidebarHomePrimaryMatchId != null
                            : firstSportsMatchId != null
                        ) ? (
                        <Suspense fallback={<Skeleton type="sportsDetailsMarkets" />}>
                          <SportDetail
                            id={
                              useLiveFirstMatchForHomeSidebar
                                ? sidebarHomePrimaryMatchId
                                : firstSportsMatchId
                            }
                            hideMatchInfo={true}
                          />
                        </Suspense>
                      ) : (
                        <Empty
                          className="flex-1 min-h-0 bg-[var(--Background-300)]"
                          text="暂无数据"
                        />
                      )}
                    </div>
                  ) : null}
                </div>
              )}
              {messageCenterVisible ? (
                <div className="absolute inset-0 z-10 flex flex-col">
                  <Suspense fallback={null}>
                    <MessageCenter />
                  </Suspense>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </ClientOnly>
  );
};

RightSidebar.displayName = 'RightSidebar';

export default memo(RightSidebar);
